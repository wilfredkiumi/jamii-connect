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
    const { httpMethod, pathParameters, queryStringParameters } = event;
    const usersTable = process.env.USERS_TABLE!;

    switch (httpMethod) {
      case 'GET':
        return await handleGet(event, usersTable);
      case 'POST':
        return await handlePost(event, usersTable);
      case 'PUT':
        return await handlePut(event, usersTable);
      case 'DELETE':
        return await handleDelete(event, usersTable);
      default:
        return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
    }
  } catch (error) {
    console.error('Error in users handler:', error);
    return errorResponse(error);
  }
};

async function handleGet(event: APIGatewayProxyEvent, tableName: string) {
  const { pathParameters, queryStringParameters } = event;
  
  if (pathParameters?.userId) {
    // Get specific user
    const userId = pathParameters.userId;
    const user = await getItem(tableName, {
      PK: `USER#${userId}`,
      SK: `USER#${userId}`,
    });
    
    if (!user) {
      return errorResponse(new Error('User not found'), 404);
    }
    
    return successResponse(user);
  } else {
    // List users with optional filters
    const limit = queryStringParameters?.limit ? parseInt(queryStringParameters.limit) : 20;
    const location = queryStringParameters?.location;
    const skills = queryStringParameters?.skills;
    
    let result;
    
    if (location) {
      // Query by location using GSI
      result = await queryItems(
        tableName,
        'GSI2PK = :location',
        { ':location': `LOCATION#${location}` },
        'ByLocation',
        limit
      );
    } else {
      // Get all users sorted by creation date
      result = await queryItems(
        tableName,
        'GSI1PK = :type',
        { ':type': 'USER' },
        'ByTimestamp',
        limit
      );
    }
    
    // Filter by skills if provided
    if (skills) {
      const skillsArray = skills.split(',');
      result.items = result.items.filter((user: any) => 
        user.skills && user.skills.some((skill: string) => 
          skillsArray.some((filterSkill: string) => 
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }
    
    return successResponse({
      users: result.items,
      lastEvaluatedKey: result.lastEvaluatedKey,
    });
  }
}

async function handlePost(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const body = parseBody(event);
  
  validateRequired(body, ['firstName', 'lastName']);
  
  const timestamp = getCurrentTimestamp();
  const user = {
    PK: `USER#${currentUser.userId}`,
    SK: `USER#${currentUser.userId}`,
    entityType: 'USER',
    userId: currentUser.userId,
    email: currentUser.email,
    firstName: body.firstName,
    lastName: body.lastName,
    username: body.username || currentUser.username,
    location: body.location,
    bio: body.bio,
    heritageCountry: body.heritageCountry,
    currentCountry: body.currentCountry,
    profession: body.profession,
    company: body.company,
    education: body.education,
    skills: body.skills || [],
    languages: body.languages || [],
    interests: body.interests || [],
    lookingFor: body.lookingFor || [],
    linkedinUrl: body.linkedinUrl,
    twitterUrl: body.twitterUrl,
    websiteUrl: body.websiteUrl,
    isMentor: body.isMentor || false,
    isSeekingMentorship: body.isSeekingMentorship || false,
    verified: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    GSI1PK: 'USER',
    GSI1SK: timestamp,
    GSI2PK: body.location ? `LOCATION#${body.location}` : undefined,
    GSI2SK: timestamp,
  };
  
  await putItem(tableName, user);
  
  return successResponse(user, 201);
}

async function handlePut(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  const body = parseBody(event);
  
  if (!pathParameters?.userId) {
    return errorResponse(new Error('User ID is required'), 400);
  }
  
  const userId = pathParameters.userId;
  
  // Users can only update their own profile
  if (userId !== currentUser.userId) {
    return errorResponse(new Error('You can only update your own profile'), 403);
  }
  
  const updateFields = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};
  
  // Build update expression dynamically
  const allowedFields = [
    'firstName', 'lastName', 'username', 'location', 'bio', 'heritageCountry',
    'currentCountry', 'profession', 'company', 'education', 'skills', 'languages',
    'interests', 'lookingFor', 'linkedinUrl', 'twitterUrl', 'websiteUrl',
    'isMentor', 'isSeekingMentorship'
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
  
  // Update location GSI if location is being updated
  if (body.location) {
    updateFields.push('#GSI2PK = :GSI2PK', '#GSI2SK = :GSI2SK');
    expressionAttributeNames['#GSI2PK'] = 'GSI2PK';
    expressionAttributeNames['#GSI2SK'] = 'GSI2SK';
    expressionAttributeValues[':GSI2PK'] = `LOCATION#${body.location}`;
    expressionAttributeValues[':GSI2SK'] = getCurrentTimestamp();
  }
  
  const updateExpression = `SET ${updateFields.join(', ')}`;
  
  const updatedUser = await updateItem(
    tableName,
    { PK: `USER#${userId}`, SK: `USER#${userId}` },
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  );
  
  return successResponse(updatedUser);
}

async function handleDelete(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  
  if (!pathParameters?.userId) {
    return errorResponse(new Error('User ID is required'), 400);
  }
  
  const userId = pathParameters.userId;
  
  // Users can only delete their own profile
  if (userId !== currentUser.userId) {
    return errorResponse(new Error('You can only delete your own profile'), 403);
  }
  
  await deleteItem(tableName, {
    PK: `USER#${userId}`,
    SK: `USER#${userId}`,
  });
  
  return successResponse({ message: 'User deleted successfully' });
}