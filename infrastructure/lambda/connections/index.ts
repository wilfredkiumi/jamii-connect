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
    const connectionsTable = process.env.CONNECTIONS_TABLE!;

    switch (httpMethod) {
      case 'GET':
        return await handleGet(event, connectionsTable);
      case 'POST':
        return await handlePost(event, connectionsTable);
      case 'PUT':
        return await handlePut(event, connectionsTable);
      case 'DELETE':
        return await handleDelete(event, connectionsTable);
      default:
        return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
    }
  } catch (error) {
    console.error('Error in connections handler:', error);
    return errorResponse(error);
  }
};

async function handleGet(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters, queryStringParameters } = event;
  
  if (pathParameters?.connectionId) {
    // Get specific connection
    const connectionId = pathParameters.connectionId;
    
    // Try to find connection where current user is either requester or addressee
    const connection1 = await getItem(tableName, {
      PK: `USER#${currentUser.userId}`,
      SK: `CONNECTION#${connectionId}`,
    });
    
    if (connection1) {
      return successResponse(connection1);
    }
    
    // Check if it's a reverse connection
    const connection2 = await getItem(tableName, {
      PK: `USER#${connectionId}`,
      SK: `CONNECTION#${currentUser.userId}`,
    });
    
    if (connection2) {
      return successResponse(connection2);
    }
    
    return errorResponse(new Error('Connection not found'), 404);
  } else {
    // List connections for current user
    const status = queryStringParameters?.status; // 'pending', 'accepted', 'blocked'
    const type = queryStringParameters?.type; // 'sent', 'received'
    const limit = queryStringParameters?.limit ? parseInt(queryStringParameters.limit) : 20;

    let result;
    
    if (type === 'received') {
      // Get connection requests received by current user
      result = await queryItems(
        tableName,
        'GSI1PK = :userId AND begins_with(GSI1SK, :connectionPrefix)',
        {
          ':userId': `USER#${currentUser.userId}`,
          ':connectionPrefix': 'CONNECTION#',
        },
        'ByConnectedUser',
        limit
      );
    } else {
      // Get connections sent by current user (default)
      result = await queryItems(
        tableName,
        'PK = :userId AND begins_with(SK, :connectionPrefix)',
        {
          ':userId': `USER#${currentUser.userId}`,
          ':connectionPrefix': 'CONNECTION#',
        },
        null,
        limit
      );
    }
    
    // Apply status filter if provided
    let filteredConnections = result.items;
    if (status) {
      filteredConnections = filteredConnections.filter((conn: any) => conn.status === status);
    }
    
    return successResponse({
      connections: filteredConnections,
      lastEvaluatedKey: result.lastEvaluatedKey,
      totalCount: filteredConnections.length,
      type: type || 'sent',
    });
  }
}

async function handlePost(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const body = parseBody(event);
  
  validateRequired(body, ['connectedUserId']);
  
  const { connectedUserId, message } = body;
  
  // Can't connect to yourself
  if (connectedUserId === currentUser.userId) {
    return errorResponse(new Error('You cannot connect to yourself'), 400);
  }
  
  // Check if connection already exists (either direction)
  const existingConnection1 = await getItem(tableName, {
    PK: `USER#${currentUser.userId}`,
    SK: `CONNECTION#${connectedUserId}`,
  });
  
  const existingConnection2 = await getItem(tableName, {
    PK: `USER#${connectedUserId}`,
    SK: `CONNECTION#${currentUser.userId}`,
  });
  
  if (existingConnection1 || existingConnection2) {
    return errorResponse(new Error('Connection already exists'), 409);
  }
  
  // Get connected user info from Users table
  const usersTable = process.env.USERS_TABLE!;
  const connectedUser = await getItem(usersTable, {
    PK: `USER#${connectedUserId}`,
    SK: `USER#${connectedUserId}`,
  });
  
  if (!connectedUser) {
    return errorResponse(new Error('User not found'), 404);
  }
  
  const connectionId = generateId();
  const timestamp = getCurrentTimestamp();
  
  const connection = {
    PK: `USER#${currentUser.userId}`,
    SK: `CONNECTION#${connectedUserId}`,
    entityType: 'CONNECTION',
    connectionId,
    userId: currentUser.userId,
    connectedUserId,
    status: 'pending',
    requesterName: `${currentUser.firstName} ${currentUser.lastName}`,
    connectedUserName: `${connectedUser.firstName} ${connectedUser.lastName}`,
    message,
    createdAt: timestamp,
    updatedAt: timestamp,
    GSI1PK: `USER#${connectedUserId}`,
    GSI1SK: `CONNECTION#${currentUser.userId}`,
    GSI2PK: `STATUS#pending`,
    GSI2SK: timestamp,
  };
  
  await putItem(tableName, connection);
  
  return successResponse(connection, 201);
}

async function handlePut(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  const body = parseBody(event);
  
  if (!pathParameters?.connectionId) {
    return errorResponse(new Error('Connection ID is required'), 400);
  }
  
  const connectedUserId = pathParameters.connectionId; // This is actually the other user's ID
  const { status } = body; // 'accepted' | 'blocked'
  
  if (!['accepted', 'blocked'].includes(status)) {
    return errorResponse(new Error('Invalid status. Must be "accepted" or "blocked"'), 400);
  }
  
  // Find the connection request (should be where current user is the addressee)
  const connection = await getItem(tableName, {
    PK: `USER#${connectedUserId}`,
    SK: `CONNECTION#${currentUser.userId}`,
  });
  
  if (!connection) {
    return errorResponse(new Error('Connection request not found'), 404);
  }
  
  // Only the addressee (current user) can update the status
  if (connection.connectedUserId !== currentUser.userId) {
    return errorResponse(new Error('You can only respond to connection requests sent to you'), 403);
  }
  
  // Can only update pending connections
  if (connection.status !== 'pending') {
    return errorResponse(new Error('Connection request has already been responded to'), 400);
  }
  
  const timestamp = getCurrentTimestamp();
  
  const updatedConnection = await updateItem(
    tableName,
    { PK: `USER#${connectedUserId}`, SK: `CONNECTION#${currentUser.userId}` },
    'SET #status = :status, updatedAt = :now, GSI2PK = :statusPK',
    {
      ':status': status,
      ':now': timestamp,
      ':statusPK': `STATUS#${status}`,
    },
    { '#status': 'status' }
  );
  
  // If accepted, create reverse connection for easy lookup
  if (status === 'accepted') {
    const reverseConnection = {
      PK: `USER#${currentUser.userId}`,
      SK: `CONNECTION#${connectedUserId}`,
      entityType: 'CONNECTION',
      connectionId: connection.connectionId,
      userId: currentUser.userId,
      connectedUserId: connectedUserId,
      status: 'accepted',
      requesterName: connection.connectedUserName,
      connectedUserName: connection.requesterName,
      message: 'Connection accepted',
      createdAt: connection.createdAt,
      updatedAt: timestamp,
      GSI1PK: `USER#${connectedUserId}`,
      GSI1SK: `CONNECTION#${currentUser.userId}`,
      GSI2PK: 'STATUS#accepted',
      GSI2SK: timestamp,
    };
    
    await putItem(tableName, reverseConnection);
  }
  
  return successResponse(updatedConnection);
}

async function handleDelete(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  
  if (!pathParameters?.connectionId) {
    return errorResponse(new Error('Connection ID is required'), 400);
  }
  
  const connectedUserId = pathParameters.connectionId;
  
  // Find and delete the connection
  const connection = await getItem(tableName, {
    PK: `USER#${currentUser.userId}`,
    SK: `CONNECTION#${connectedUserId}`,
  });
  
  if (!connection) {
    return errorResponse(new Error('Connection not found'), 404);
  }
  
  // Delete the main connection
  await deleteItem(tableName, {
    PK: `USER#${currentUser.userId}`,
    SK: `CONNECTION#${connectedUserId}`,
  });
  
  // If it was accepted, also delete the reverse connection
  if (connection.status === 'accepted') {
    try {
      await deleteItem(tableName, {
        PK: `USER#${connectedUserId}`,
        SK: `CONNECTION#${currentUser.userId}`,
      });
    } catch (error) {
      console.warn('Failed to delete reverse connection:', error);
    }
  }
  
  // If current user is rejecting a pending request, delete the original
  if (connection.status === 'pending' && connection.userId !== currentUser.userId) {
    try {
      await deleteItem(tableName, {
        PK: `USER#${connectedUserId}`,
        SK: `CONNECTION#${currentUser.userId}`,
      });
    } catch (error) {
      console.warn('Failed to delete original connection request:', error);
    }
  }
  
  return successResponse({ 
    message: 'Connection removed successfully',
    connectionId: connectedUserId 
  });
}