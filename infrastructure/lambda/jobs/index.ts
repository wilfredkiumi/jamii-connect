import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const {
  successResponse,
  errorResponse,
  getUserFromEvent,
  parseBody,
  validateRequired,
  putItem,
  getItem,
  queryItems,
  updateItem,
  deleteItem,
  generateId,
  getCurrentTimestamp,
} = require('/opt/nodejs/index');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { httpMethod, resource } = event;
    const jobsTable = process.env.JOBS_TABLE!;

    // Handle job applications endpoints
    if (resource.includes('/applications')) {
      return await handleApplications(event, jobsTable);
    }

    switch (httpMethod) {
      case 'GET':
        return await handleGet(event, jobsTable);
      case 'POST':
        return await handlePost(event, jobsTable);
      case 'PUT':
        return await handlePut(event, jobsTable);
      case 'DELETE':
        return await handleDelete(event, jobsTable);
      default:
        return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
    }
  } catch (error) {
    console.error('Error in jobs handler:', error);
    return errorResponse(error);
  }
};

async function handleGet(event: APIGatewayProxyEvent, tableName: string) {
  const { pathParameters, queryStringParameters } = event;
  
  if (pathParameters?.jobId) {
    // Get specific job
    const jobId = pathParameters.jobId;
    const job = await getItem(tableName, {
      PK: `JOB#${jobId}`,
      SK: `JOB#${jobId}`,
    });
    
    if (!job) {
      return errorResponse(new Error('Job not found'), 404);
    }

    // Increment view count
    try {
      await updateItem(
        tableName,
        { PK: `JOB#${jobId}`, SK: `JOB#${jobId}` },
        'ADD viewsCount :inc',
        { ':inc': 1 }
      );
      job.viewsCount = (job.viewsCount || 0) + 1;
    } catch (error) {
      console.warn('Failed to increment view count:', error);
    }
    
    return successResponse(job);
  } else {
    // List jobs with filters
    const limit = queryStringParameters?.limit ? parseInt(queryStringParameters.limit) : 20;
    const location = queryStringParameters?.location;
    const jobType = queryStringParameters?.jobType;
    const experienceLevel = queryStringParameters?.experienceLevel;
    const diasporaFriendly = queryStringParameters?.diasporaFriendly === 'true';
    const visaSponsorship = queryStringParameters?.visaSponsorship === 'true';
    const company = queryStringParameters?.company;
    const status = queryStringParameters?.status || 'active';

    let result;
    
    if (location) {
      // Query by location using GSI
      result = await queryItems(
        tableName,
        'GSI2PK = :location AND GSI2SK > :minDate',
        { 
          ':location': `LOCATION#${location}`,
          ':minDate': '2020-01-01T00:00:00.000Z'
        },
        'ByLocation',
        limit
      );
    } else if (company) {
      // Query by company using GSI
      result = await queryItems(
        tableName,
        'GSI3PK = :company',
        { ':company': `COMPANY#${company}` },
        'ByCompany',
        limit
      );
    } else {
      // Get jobs by status (default: active)
      result = await queryItems(
        tableName,
        'GSI1PK = :status',
        { ':status': `JOB#${status}` },
        'ByStatus',
        limit
      );
    }
    
    // Apply additional filters
    let filteredJobs = result.items;

    if (jobType) {
      filteredJobs = filteredJobs.filter((job: any) => job.jobType === jobType);
    }

    if (experienceLevel) {
      filteredJobs = filteredJobs.filter((job: any) => job.experienceLevel === experienceLevel);
    }

    if (diasporaFriendly) {
      filteredJobs = filteredJobs.filter((job: any) => job.diasporaFriendly === true);
    }

    if (visaSponsorship) {
      filteredJobs = filteredJobs.filter((job: any) => job.visaSponsorship === true);
    }
    
    return successResponse({
      jobs: filteredJobs,
      lastEvaluatedKey: result.lastEvaluatedKey,
      totalCount: filteredJobs.length,
    });
  }
}

async function handlePost(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const body = parseBody(event);
  
  validateRequired(body, [
    'title', 'companyName', 'description', 'location', 'locationType', 
    'jobType', 'experienceLevel', 'requirements'
  ]);
  
  const jobId = generateId();
  const timestamp = getCurrentTimestamp();
  
  const job = {
    PK: `JOB#${jobId}`,
    SK: `JOB#${jobId}`,
    entityType: 'JOB',
    jobId,
    userId: currentUser.userId,
    companyName: body.companyName,
    companyLogo: body.companyLogo,
    title: body.title,
    description: body.description,
    location: body.location,
    country: body.country || 'United Kingdom',
    locationType: body.locationType, // 'remote' | 'hybrid' | 'onsite'
    jobType: body.jobType, // 'full-time' | 'part-time' | 'contract' | 'internship'
    experienceLevel: body.experienceLevel, // 'entry' | 'mid' | 'senior' | 'executive'
    salary: body.salary ? {
      min: body.salary.min,
      max: body.salary.max,
      currency: body.salary.currency || 'GBP'
    } : undefined,
    requirements: body.requirements,
    benefits: body.benefits || [],
    skills: body.skills || [],
    companySize: body.companySize,
    industry: body.industry,
    applicationUrl: body.applicationUrl,
    applicationEmail: body.applicationEmail,
    diasporaFriendly: body.diasporaFriendly || false,
    visaSponsorship: body.visaSponsorship || false,
    applicationDeadline: body.applicationDeadline,
    status: body.status || 'active',
    viewsCount: 0,
    applicationsCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    GSI1PK: `JOB#${body.status || 'active'}`,
    GSI1SK: timestamp,
    GSI2PK: `LOCATION#${body.location}`,
    GSI2SK: timestamp,
    GSI3PK: `COMPANY#${body.companyName}`,
    GSI3SK: timestamp,
  };
  
  await putItem(tableName, job);
  
  return successResponse(job, 201);
}

async function handlePut(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  const body = parseBody(event);
  
  if (!pathParameters?.jobId) {
    return errorResponse(new Error('Job ID is required'), 400);
  }
  
  const jobId = pathParameters.jobId;
  
  // Get the existing job to verify ownership
  const existingJob = await getItem(tableName, {
    PK: `JOB#${jobId}`,
    SK: `JOB#${jobId}`,
  });
  
  if (!existingJob) {
    return errorResponse(new Error('Job not found'), 404);
  }
  
  // Users can only update their own job postings
  if (existingJob.userId !== currentUser.userId) {
    return errorResponse(new Error('You can only update your own job postings'), 403);
  }
  
  const updateFields = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};
  
  // Build update expression dynamically
  const allowedFields = [
    'title', 'companyName', 'companyLogo', 'description', 'location', 'country',
    'locationType', 'jobType', 'experienceLevel', 'salary', 'requirements',
    'benefits', 'skills', 'companySize', 'industry', 'applicationUrl',
    'applicationEmail', 'diasporaFriendly', 'visaSponsorship', 'applicationDeadline', 'status'
  ];
  
  allowedFields.forEach(field => {
    if (body[field] !== undefined) {
      updateFields.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = body[field];
    }
  });
  
  if (updateFields.length === 0) {
    return errorResponse(new Error('No valid fields to update'), 400);
  }
  
  // Always update the timestamp
  updateFields.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = getCurrentTimestamp();
  
  // Update GSI keys if relevant fields changed
  if (body.status && body.status !== existingJob.status) {
    updateFields.push('#GSI1PK = :GSI1PK');
    expressionAttributeNames['#GSI1PK'] = 'GSI1PK';
    expressionAttributeValues[':GSI1PK'] = `JOB#${body.status}`;
  }
  
  if (body.location && body.location !== existingJob.location) {
    updateFields.push('#GSI2PK = :GSI2PK', '#GSI2SK = :GSI2SK');
    expressionAttributeNames['#GSI2PK'] = 'GSI2PK';
    expressionAttributeNames['#GSI2SK'] = 'GSI2SK';
    expressionAttributeValues[':GSI2PK'] = `LOCATION#${body.location}`;
    expressionAttributeValues[':GSI2SK'] = getCurrentTimestamp();
  }
  
  if (body.companyName && body.companyName !== existingJob.companyName) {
    updateFields.push('#GSI3PK = :GSI3PK');
    expressionAttributeNames['#GSI3PK'] = 'GSI3PK';
    expressionAttributeValues[':GSI3PK'] = `COMPANY#${body.companyName}`;
  }
  
  const updateExpression = `SET ${updateFields.join(', ')}`;
  
  const updatedJob = await updateItem(
    tableName,
    { PK: `JOB#${jobId}`, SK: `JOB#${jobId}` },
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  );
  
  return successResponse(updatedJob);
}

async function handleDelete(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  
  if (!pathParameters?.jobId) {
    return errorResponse(new Error('Job ID is required'), 400);
  }
  
  const jobId = pathParameters.jobId;
  
  // Get the existing job to verify ownership
  const existingJob = await getItem(tableName, {
    PK: `JOB#${jobId}`,
    SK: `JOB#${jobId}`,
  });
  
  if (!existingJob) {
    return errorResponse(new Error('Job not found'), 404);
  }
  
  // Users can only delete their own job postings
  if (existingJob.userId !== currentUser.userId) {
    return errorResponse(new Error('You can only delete your own job postings'), 403);
  }
  
  await deleteItem(tableName, {
    PK: `JOB#${jobId}`,
    SK: `JOB#${jobId}`,
  });
  
  return successResponse({ message: 'Job deleted successfully' });
}

async function handleApplications(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { httpMethod, pathParameters } = event;
  
  if (!pathParameters?.jobId) {
    return errorResponse(new Error('Job ID is required'), 400);
  }
  
  const jobId = pathParameters.jobId;
  
  if (httpMethod === 'GET') {
    // Get applications for a job (only job owner can see this)
    const job = await getItem(tableName, {
      PK: `JOB#${jobId}`,
      SK: `JOB#${jobId}`,
    });
    
    if (!job) {
      return errorResponse(new Error('Job not found'), 404);
    }
    
    if (job.userId !== currentUser.userId) {
      return errorResponse(new Error('You can only view applications for your own job postings'), 403);
    }
    
    // Query applications for this job
    const result = await queryItems(
      tableName,
      'PK = :jobPK AND begins_with(SK, :applicationPrefix)',
      {
        ':jobPK': `JOB#${jobId}`,
        ':applicationPrefix': 'APPLICATION#',
      }
    );
    
    return successResponse({
      applications: result.items,
      totalCount: result.items.length,
    });
    
  } else if (httpMethod === 'POST') {
    // Apply for a job
    const body = parseBody(event);
    
    // Check if job exists and is active
    const job = await getItem(tableName, {
      PK: `JOB#${jobId}`,
      SK: `JOB#${jobId}`,
    });
    
    if (!job) {
      return errorResponse(new Error('Job not found'), 404);
    }
    
    if (job.status !== 'active') {
      return errorResponse(new Error('This job is no longer accepting applications'), 400);
    }
    
    if (job.userId === currentUser.userId) {
      return errorResponse(new Error('You cannot apply to your own job posting'), 400);
    }
    
    // Check if already applied
    const existingApplication = await getItem(tableName, {
      PK: `JOB#${jobId}`,
      SK: `APPLICATION#${currentUser.userId}`,
    });
    
    if (existingApplication) {
      return errorResponse(new Error('You have already applied to this job'), 409);
    }
    
    const applicationId = generateId();
    const timestamp = getCurrentTimestamp();
    
    const application = {
      PK: `JOB#${jobId}`,
      SK: `APPLICATION#${currentUser.userId}`,
      entityType: 'APPLICATION',
      applicationId,
      jobId,
      userId: currentUser.userId,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userEmail: currentUser.email,
      status: 'pending',
      coverLetter: body.coverLetter,
      resumeUrl: body.resumeUrl,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await putItem(tableName, application);
    
    // Increment applications count on the job
    await updateItem(
      tableName,
      { PK: `JOB#${jobId}`, SK: `JOB#${jobId}` },
      'ADD applicationsCount :inc SET updatedAt = :now',
      {
        ':inc': 1,
        ':now': timestamp,
      }
    );
    
    return successResponse(application, 201);
  }
  
  return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
}