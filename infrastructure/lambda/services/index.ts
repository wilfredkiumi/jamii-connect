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
    const { httpMethod } = event;
    const servicesTable = process.env.SERVICES_TABLE!;

    switch (httpMethod) {
      case 'GET':
        return await handleGet(event, servicesTable);
      case 'POST':
        return await handlePost(event, servicesTable);
      case 'PUT':
        return await handlePut(event, servicesTable);
      case 'DELETE':
        return await handleDelete(event, servicesTable);
      default:
        return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
    }
  } catch (error) {
    console.error('Error in services handler:', error);
    return errorResponse(error);
  }
};

async function handleGet(event: APIGatewayProxyEvent, tableName: string) {
  const { pathParameters, queryStringParameters } = event;
  
  if (pathParameters?.serviceId) {
    // Get specific service
    const serviceId = pathParameters.serviceId;
    const service = await getItem(tableName, {
      PK: `SERVICE#${serviceId}`,
      SK: `SERVICE#${serviceId}`,
    });
    
    if (!service) {
      return errorResponse(new Error('Service not found'), 404);
    }
    
    return successResponse(service);
  } else {
    // List services with filters
    const limit = queryStringParameters?.limit ? parseInt(queryStringParameters.limit) : 20;
    const category = queryStringParameters?.category;
    const location = queryStringParameters?.location;
    const verified = queryStringParameters?.verified === 'true';
    const minRating = queryStringParameters?.minRating ? parseFloat(queryStringParameters.minRating) : undefined;
    const providerId = queryStringParameters?.providerId;

    let result;
    
    if (category) {
      // Query by category using GSI
      result = await queryItems(
        tableName,
        'GSI1PK = :category',
        { ':category': `CATEGORY#${category}` },
        'ByCategory',
        limit
      );
    } else if (location) {
      // Query by location using GSI
      result = await queryItems(
        tableName,
        'GSI2PK = :location',
        { ':location': `LOCATION#${location}` },
        'ByLocation',
        limit
      );
    } else if (providerId) {
      // Query by provider using GSI
      result = await queryItems(
        tableName,
        'GSI3PK = :provider',
        { ':provider': `PROVIDER#${providerId}` },
        'ByProvider',
        limit
      );
    } else {
      // Get all services sorted by creation date
      result = await queryItems(
        tableName,
        'GSI1PK = :type',
        { ':type': 'SERVICE' },
        'ByCategory',
        limit
      );
    }
    
    // Apply additional filters
    let filteredServices = result.items;

    if (verified) {
      filteredServices = filteredServices.filter((service: any) => service.verified === true);
    }

    if (minRating) {
      filteredServices = filteredServices.filter((service: any) => 
        service.rating && service.rating >= minRating
      );
    }
    
    return successResponse({
      services: filteredServices,
      lastEvaluatedKey: result.lastEvaluatedKey,
      totalCount: filteredServices.length,
    });
  }
}

async function handlePost(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const body = parseBody(event);
  
  validateRequired(body, [
    'title', 'description', 'category', 'location', 'availability'
  ]);
  
  const serviceId = generateId();
  const timestamp = getCurrentTimestamp();
  
  const service = {
    PK: `SERVICE#${serviceId}`,
    SK: `SERVICE#${serviceId}`,
    entityType: 'SERVICE',
    serviceId,
    userId: currentUser.userId,
    providerName: `${currentUser.firstName} ${currentUser.lastName}`,
    title: body.title,
    description: body.description,
    category: body.category,
    location: body.location,
    serviceArea: body.serviceArea || [body.location],
    pricing: body.pricing ? {
      type: body.pricing.type, // 'fixed' | 'hourly' | 'custom'
      amount: body.pricing.amount,
      currency: body.pricing.currency || 'GBP'
    } : undefined,
    contactPhone: body.contactPhone,
    contactEmail: body.contactEmail || currentUser.email,
    website: body.website,
    availability: body.availability,
    images: body.images || [],
    rating: 0,
    reviewCount: 0,
    verified: false, // Admin verification required
    createdAt: timestamp,
    updatedAt: timestamp,
    GSI1PK: `CATEGORY#${body.category}`,
    GSI1SK: timestamp,
    GSI2PK: `LOCATION#${body.location}`,
    GSI2SK: timestamp,
    GSI3PK: `PROVIDER#${currentUser.userId}`,
    GSI3SK: timestamp,
  };
  
  await putItem(tableName, service);
  
  return successResponse(service, 201);
}

async function handlePut(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  const body = parseBody(event);
  
  if (!pathParameters?.serviceId) {
    return errorResponse(new Error('Service ID is required'), 400);
  }
  
  const serviceId = pathParameters.serviceId;
  
  // Get the existing service to verify ownership
  const existingService = await getItem(tableName, {
    PK: `SERVICE#${serviceId}`,
    SK: `SERVICE#${serviceId}`,
  });
  
  if (!existingService) {
    return errorResponse(new Error('Service not found'), 404);
  }
  
  // Users can only update their own services
  if (existingService.userId !== currentUser.userId) {
    return errorResponse(new Error('You can only update your own services'), 403);
  }
  
  const updateFields = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};
  
  // Build update expression dynamically
  const allowedFields = [
    'title', 'description', 'category', 'location', 'serviceArea', 'pricing',
    'contactPhone', 'contactEmail', 'website', 'availability', 'images'
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
  if (body.category && body.category !== existingService.category) {
    updateFields.push('#GSI1PK = :GSI1PK');
    expressionAttributeNames['#GSI1PK'] = 'GSI1PK';
    expressionAttributeValues[':GSI1PK'] = `CATEGORY#${body.category}`;
  }
  
  if (body.location && body.location !== existingService.location) {
    updateFields.push('#GSI2PK = :GSI2PK', '#GSI2SK = :GSI2SK');
    expressionAttributeNames['#GSI2PK'] = 'GSI2PK';
    expressionAttributeNames['#GSI2SK'] = 'GSI2SK';
    expressionAttributeValues[':GSI2PK'] = `LOCATION#${body.location}`;
    expressionAttributeValues[':GSI2SK'] = getCurrentTimestamp();
  }
  
  const updateExpression = `SET ${updateFields.join(', ')}`;
  
  const updatedService = await updateItem(
    tableName,
    { PK: `SERVICE#${serviceId}`, SK: `SERVICE#${serviceId}` },
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  );
  
  return successResponse(updatedService);
}

async function handleDelete(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  
  if (!pathParameters?.serviceId) {
    return errorResponse(new Error('Service ID is required'), 400);
  }
  
  const serviceId = pathParameters.serviceId;
  
  // Get the existing service to verify ownership
  const existingService = await getItem(tableName, {
    PK: `SERVICE#${serviceId}`,
    SK: `SERVICE#${serviceId}`,
  });
  
  if (!existingService) {
    return errorResponse(new Error('Service not found'), 404);
  }
  
  // Users can only delete their own services
  if (existingService.userId !== currentUser.userId) {
    return errorResponse(new Error('You can only delete your own services'), 403);
  }
  
  await deleteItem(tableName, {
    PK: `SERVICE#${serviceId}`,
    SK: `SERVICE#${serviceId}`,
  });
  
  return successResponse({ message: 'Service deleted successfully' });
}