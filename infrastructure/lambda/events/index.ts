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
    const eventsTable = process.env.EVENTS_TABLE!;

    // Handle event attendees endpoints
    if (resource.includes('/attendees')) {
      return await handleAttendees(event, eventsTable);
    }

    switch (httpMethod) {
      case 'GET':
        return await handleGet(event, eventsTable);
      case 'POST':
        return await handlePost(event, eventsTable);
      case 'PUT':
        return await handlePut(event, eventsTable);
      case 'DELETE':
        return await handleDelete(event, eventsTable);
      default:
        return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
    }
  } catch (error) {
    console.error('Error in events handler:', error);
    return errorResponse(error);
  }
};

async function handleGet(event: APIGatewayProxyEvent, tableName: string) {
  const { pathParameters, queryStringParameters } = event;
  
  if (pathParameters?.eventId) {
    // Get specific event
    const eventId = pathParameters.eventId;
    const eventItem = await getItem(tableName, {
      PK: `EVENT#${eventId}`,
      SK: `EVENT#${eventId}`,
    });
    
    if (!eventItem) {
      return errorResponse(new Error('Event not found'), 404);
    }
    
    return successResponse(eventItem);
  } else {
    // List events with filters
    const limit = queryStringParameters?.limit ? parseInt(queryStringParameters.limit) : 20;
    const category = queryStringParameters?.category;
    const locationType = queryStringParameters?.locationType;
    const isFree = queryStringParameters?.isFree === 'true';
    const dateFrom = queryStringParameters?.dateFrom;
    const dateTo = queryStringParameters?.dateTo;
    const status = queryStringParameters?.status || 'upcoming';

    let result;
    
    if (category) {
      // Query by category using GSI
      result = await queryItems(
        tableName,
        'GSI2PK = :category',
        { ':category': `CATEGORY#${category}` },
        'ByCategory',
        limit
      );
    } else if (dateFrom || dateTo) {
      // Query by date range using GSI
      let keyCondition = 'GSI3PK = :dateType';
      const expressionValues: any = { ':dateType': 'EVENT_DATE' };
      
      if (dateFrom && dateTo) {
        keyCondition += ' AND GSI3SK BETWEEN :dateFrom AND :dateTo';
        expressionValues[':dateFrom'] = dateFrom;
        expressionValues[':dateTo'] = dateTo;
      } else if (dateFrom) {
        keyCondition += ' AND GSI3SK >= :dateFrom';
        expressionValues[':dateFrom'] = dateFrom;
      } else if (dateTo) {
        keyCondition += ' AND GSI3SK <= :dateTo';
        expressionValues[':dateTo'] = dateTo;
      }
      
      result = await queryItems(
        tableName,
        keyCondition,
        expressionValues,
        'ByDate',
        limit
      );
    } else {
      // Get events by status (default: upcoming)
      result = await queryItems(
        tableName,
        'GSI1PK = :status',
        { ':status': `EVENT#${status}` },
        'ByStatus',
        limit
      );
    }
    
    // Apply additional filters
    let filteredEvents = result.items;

    if (locationType) {
      filteredEvents = filteredEvents.filter((event: any) => event.locationType === locationType);
    }

    if (isFree) {
      filteredEvents = filteredEvents.filter((event: any) => event.isFree === true || event.price === 0);
    }

    // Filter out past events if status is upcoming
    if (status === 'upcoming') {
      const now = new Date().toISOString();
      filteredEvents = filteredEvents.filter((event: any) => event.startDate >= now);
    }
    
    return successResponse({
      events: filteredEvents,
      lastEvaluatedKey: result.lastEvaluatedKey,
      totalCount: filteredEvents.length,
    });
  }
}

async function handlePost(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const body = parseBody(event);
  
  validateRequired(body, [
    'title', 'description', 'startDate', 'locationType', 'category'
  ]);
  
  // Validate date
  const startDate = new Date(body.startDate);
  const endDate = body.endDate ? new Date(body.endDate) : null;
  
  if (startDate < new Date()) {
    return errorResponse(new Error('Event start date must be in the future'), 400);
  }
  
  if (endDate && endDate <= startDate) {
    return errorResponse(new Error('Event end date must be after start date'), 400);
  }
  
  const eventId = generateId();
  const timestamp = getCurrentTimestamp();
  
  const eventItem = {
    PK: `EVENT#${eventId}`,
    SK: `EVENT#${eventId}`,
    entityType: 'EVENT',
    eventId,
    userId: currentUser.userId,
    organizerName: `${currentUser.firstName} ${currentUser.lastName}`,
    title: body.title,
    description: body.description,
    startDate: body.startDate,
    endDate: body.endDate,
    location: body.location,
    country: body.country || 'United Kingdom',
    locationType: body.locationType, // 'in-person' | 'virtual' | 'hybrid'
    category: body.category, // 'conference' | 'workshop' | 'networking' | 'cultural' | 'business' | 'social'
    capacity: body.capacity,
    attendeeCount: 0,
    price: body.price || 0,
    currency: body.currency || 'GBP',
    isFree: body.isFree || body.price === 0,
    registrationUrl: body.registrationUrl,
    image: body.image,
    tags: body.tags || [],
    status: 'upcoming',
    createdAt: timestamp,
    updatedAt: timestamp,
    GSI1PK: 'EVENT#upcoming',
    GSI1SK: body.startDate,
    GSI2PK: `CATEGORY#${body.category}`,
    GSI2SK: body.startDate,
    GSI3PK: 'EVENT_DATE',
    GSI3SK: body.startDate,
  };
  
  await putItem(tableName, eventItem);
  
  return successResponse(eventItem, 201);
}

async function handlePut(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  const body = parseBody(event);
  
  if (!pathParameters?.eventId) {
    return errorResponse(new Error('Event ID is required'), 400);
  }
  
  const eventId = pathParameters.eventId;
  
  // Get the existing event to verify ownership
  const existingEvent = await getItem(tableName, {
    PK: `EVENT#${eventId}`,
    SK: `EVENT#${eventId}`,
  });
  
  if (!existingEvent) {
    return errorResponse(new Error('Event not found'), 404);
  }
  
  // Users can only update their own events
  if (existingEvent.userId !== currentUser.userId) {
    return errorResponse(new Error('You can only update your own events'), 403);
  }
  
  // Validate dates if provided
  if (body.startDate) {
    const startDate = new Date(body.startDate);
    if (startDate < new Date() && existingEvent.status !== 'completed') {
      return errorResponse(new Error('Event start date must be in the future'), 400);
    }
  }
  
  if (body.endDate && body.startDate) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (endDate <= startDate) {
      return errorResponse(new Error('Event end date must be after start date'), 400);
    }
  }
  
  const updateFields = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};
  
  // Build update expression dynamically
  const allowedFields = [
    'title', 'description', 'startDate', 'endDate', 'location', 'country',
    'locationType', 'category', 'capacity', 'price', 'currency', 'isFree',
    'registrationUrl', 'image', 'tags', 'status'
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
  if (body.status && body.status !== existingEvent.status) {
    updateFields.push('#GSI1PK = :GSI1PK');
    expressionAttributeNames['#GSI1PK'] = 'GSI1PK';
    expressionAttributeValues[':GSI1PK'] = `EVENT#${body.status}`;
  }
  
  if (body.category && body.category !== existingEvent.category) {
    updateFields.push('#GSI2PK = :GSI2PK');
    expressionAttributeNames['#GSI2PK'] = 'GSI2PK';
    expressionAttributeValues[':GSI2PK'] = `CATEGORY#${body.category}`;
  }
  
  if (body.startDate && body.startDate !== existingEvent.startDate) {
    updateFields.push('#GSI1SK = :GSI1SK', '#GSI2SK = :GSI2SK', '#GSI3SK = :GSI3SK');
    expressionAttributeNames['#GSI1SK'] = 'GSI1SK';
    expressionAttributeNames['#GSI2SK'] = 'GSI2SK';
    expressionAttributeNames['#GSI3SK'] = 'GSI3SK';
    expressionAttributeValues[':GSI1SK'] = body.startDate;
    expressionAttributeValues[':GSI2SK'] = body.startDate;
    expressionAttributeValues[':GSI3SK'] = body.startDate;
  }
  
  const updateExpression = `SET ${updateFields.join(', ')}`;
  
  const updatedEvent = await updateItem(
    tableName,
    { PK: `EVENT#${eventId}`, SK: `EVENT#${eventId}` },
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  );
  
  return successResponse(updatedEvent);
}

async function handleDelete(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  
  if (!pathParameters?.eventId) {
    return errorResponse(new Error('Event ID is required'), 400);
  }
  
  const eventId = pathParameters.eventId;
  
  // Get the existing event to verify ownership
  const existingEvent = await getItem(tableName, {
    PK: `EVENT#${eventId}`,
    SK: `EVENT#${eventId}`,
  });
  
  if (!existingEvent) {
    return errorResponse(new Error('Event not found'), 404);
  }
  
  // Users can only delete their own events
  if (existingEvent.userId !== currentUser.userId) {
    return errorResponse(new Error('You can only delete your own events'), 403);
  }
  
  // Don't allow deletion if event has started
  const now = new Date();
  const eventStartDate = new Date(existingEvent.startDate);
  
  if (eventStartDate <= now && existingEvent.attendeeCount > 0) {
    return errorResponse(new Error('Cannot delete an event that has started with attendees'), 400);
  }
  
  await deleteItem(tableName, {
    PK: `EVENT#${eventId}`,
    SK: `EVENT#${eventId}`,
  });
  
  return successResponse({ message: 'Event deleted successfully' });
}

async function handleAttendees(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { httpMethod, pathParameters } = event;
  
  if (!pathParameters?.eventId) {
    return errorResponse(new Error('Event ID is required'), 400);
  }
  
  const eventId = pathParameters.eventId;
  
  if (httpMethod === 'GET') {
    // Get attendees for an event
    const eventItem = await getItem(tableName, {
      PK: `EVENT#${eventId}`,
      SK: `EVENT#${eventId}`,
    });
    
    if (!eventItem) {
      return errorResponse(new Error('Event not found'), 404);
    }
    
    // Query attendees for this event
    const result = await queryItems(
      tableName,
      'PK = :eventPK AND begins_with(SK, :attendeePrefix)',
      {
        ':eventPK': `EVENT#${eventId}`,
        ':attendeePrefix': 'ATTENDEE#',
      }
    );
    
    return successResponse({
      attendees: result.items,
      totalCount: result.items.length,
      event: {
        id: eventItem.eventId,
        title: eventItem.title,
        organizerName: eventItem.organizerName,
        startDate: eventItem.startDate,
        capacity: eventItem.capacity,
      },
    });
    
  } else if (httpMethod === 'POST') {
    // RSVP to an event
    const body = parseBody(event);
    const status = body.status || 'attending'; // 'attending' | 'maybe' | 'not_attending'
    
    if (!['attending', 'maybe', 'not_attending'].includes(status)) {
      return errorResponse(new Error('Invalid RSVP status'), 400);
    }
    
    // Check if event exists and is open for registration
    const eventItem = await getItem(tableName, {
      PK: `EVENT#${eventId}`,
      SK: `EVENT#${eventId}`,
    });
    
    if (!eventItem) {
      return errorResponse(new Error('Event not found'), 404);
    }
    
    if (eventItem.status === 'completed' || eventItem.status === 'cancelled') {
      return errorResponse(new Error('Cannot RSVP to a completed or cancelled event'), 400);
    }
    
    // Check if event is at capacity (only for 'attending' status)
    if (status === 'attending' && eventItem.capacity && eventItem.attendeeCount >= eventItem.capacity) {
      return errorResponse(new Error('Event is at full capacity'), 400);
    }
    
    // Check if already RSVPed
    const existingRsvp = await getItem(tableName, {
      PK: `EVENT#${eventId}`,
      SK: `ATTENDEE#${currentUser.userId}`,
    });
    
    const timestamp = getCurrentTimestamp();
    
    if (existingRsvp) {
      // Update existing RSVP
      const oldStatus = existingRsvp.status;
      
      await updateItem(
        tableName,
        { PK: `EVENT#${eventId}`, SK: `ATTENDEE#${currentUser.userId}` },
        'SET #status = :status, updatedAt = :now',
        {
          ':status': status,
          ':now': timestamp,
        },
        { '#status': 'status' }
      );
      
      // Update attendee count on event if status changed
      if (oldStatus !== status) {
        let countChange = 0;
        if (oldStatus === 'attending' && status !== 'attending') {
          countChange = -1; // Was attending, now not
        } else if (oldStatus !== 'attending' && status === 'attending') {
          countChange = 1; // Wasn't attending, now is
        }
        
        if (countChange !== 0) {
          await updateItem(
            tableName,
            { PK: `EVENT#${eventId}`, SK: `EVENT#${eventId}` },
            'ADD attendeeCount :change SET updatedAt = :now',
            {
              ':change': countChange,
              ':now': timestamp,
            }
          );
        }
      }
      
      return successResponse({ 
        message: 'RSVP updated successfully',
        status,
        eventId,
      });
    } else {
      // Create new RSVP
      const rsvp = {
        PK: `EVENT#${eventId}`,
        SK: `ATTENDEE#${currentUser.userId}`,
        entityType: 'ATTENDEE',
        eventId,
        userId: currentUser.userId,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userImage: body.userImage,
        status,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      await putItem(tableName, rsvp);
      
      // Increment attendee count on event if attending
      if (status === 'attending') {
        await updateItem(
          tableName,
          { PK: `EVENT#${eventId}`, SK: `EVENT#${eventId}` },
          'ADD attendeeCount :inc SET updatedAt = :now',
          {
            ':inc': 1,
            ':now': timestamp,
          }
        );
      }
      
      return successResponse(rsvp, 201);
    }
    
  } else if (httpMethod === 'DELETE') {
    // Remove RSVP
    const existingRsvp = await getItem(tableName, {
      PK: `EVENT#${eventId}`,
      SK: `ATTENDEE#${currentUser.userId}`,
    });
    
    if (!existingRsvp) {
      return errorResponse(new Error('No RSVP found to remove'), 404);
    }
    
    await deleteItem(tableName, {
      PK: `EVENT#${eventId}`,
      SK: `ATTENDEE#${currentUser.userId}`,
    });
    
    // Decrement attendee count if was attending
    if (existingRsvp.status === 'attending') {
      await updateItem(
        tableName,
        { PK: `EVENT#${eventId}`, SK: `EVENT#${eventId}` },
        'ADD attendeeCount :dec SET updatedAt = :now',
        {
          ':dec': -1,
          ':now': getCurrentTimestamp(),
        }
      );
    }
    
    return successResponse({ message: 'RSVP removed successfully' });
  }
  
  return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
}