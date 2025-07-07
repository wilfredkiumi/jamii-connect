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
    const { httpMethod, pathParameters, resource } = event;
    const postsTable = process.env.POSTS_TABLE!;

    // Handle likes endpoints
    if (resource.includes('/likes')) {
      return await handleLikes(event, postsTable);
    }

    switch (httpMethod) {
      case 'GET':
        return await handleGet(event, postsTable);
      case 'POST':
        return await handlePost(event, postsTable);
      case 'PUT':
        return await handlePut(event, postsTable);
      case 'DELETE':
        return await handleDelete(event, postsTable);
      default:
        return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
    }
  } catch (error) {
    console.error('Error in posts handler:', error);
    return errorResponse(error);
  }
};

async function handleGet(event: APIGatewayProxyEvent, tableName: string) {
  const { pathParameters, queryStringParameters } = event;
  
  if (pathParameters?.postId) {
    // Get specific post
    const postId = pathParameters.postId;
    const post = await getItem(tableName, {
      PK: `POST#${postId}`,
      SK: `POST#${postId}`,
    });
    
    if (!post) {
      return errorResponse(new Error('Post not found'), 404);
    }
    
    return successResponse(post);
  } else {
    // List posts with optional filters
    const limit = queryStringParameters?.limit ? parseInt(queryStringParameters.limit) : 20;
    const userId = queryStringParameters?.userId;
    const category = queryStringParameters?.category;
    
    let result;
    
    if (userId) {
      // Get posts by specific user
      result = await queryItems(
        tableName,
        'GSI2PK = :userId',
        { ':userId': `USER#${userId}` },
        'ByUser',
        limit
      );
    } else if (category) {
      // Get posts by category
      result = await queryItems(
        tableName,
        'GSI3PK = :category',
        { ':category': `CATEGORY#${category}` },
        'ByCategory',
        limit
      );
    } else {
      // Get all posts sorted by creation date (feed)
      result = await queryItems(
        tableName,
        'GSI1PK = :type',
        { ':type': 'POST' },
        'ByTimestamp',
        limit
      );
    }
    
    return successResponse({
      posts: result.items,
      lastEvaluatedKey: result.lastEvaluatedKey,
    });
  }
}

async function handlePost(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const body = parseBody(event);
  
  validateRequired(body, ['content']);
  
  const postId = generateId();
  const timestamp = getCurrentTimestamp();
  
  const post = {
    PK: `POST#${postId}`,
    SK: `POST#${postId}`,
    entityType: 'POST',
    postId,
    userId: currentUser.userId,
    userName: `${currentUser.firstName} ${currentUser.lastName}`,
    userImage: body.userImage,
    content: body.content,
    images: body.images || [],
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    category: body.category,
    tags: body.tags || [],
    isPinned: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    GSI1PK: 'POST',
    GSI1SK: timestamp,
    GSI2PK: `USER#${currentUser.userId}`,
    GSI2SK: timestamp,
    GSI3PK: body.category ? `CATEGORY#${body.category}` : undefined,
    GSI3SK: timestamp,
  };
  
  await putItem(tableName, post);
  
  return successResponse(post, 201);
}

async function handlePut(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  const body = parseBody(event);
  
  if (!pathParameters?.postId) {
    return errorResponse(new Error('Post ID is required'), 400);
  }
  
  const postId = pathParameters.postId;
  
  // Get the existing post to verify ownership
  const existingPost = await getItem(tableName, {
    PK: `POST#${postId}`,
    SK: `POST#${postId}`,
  });
  
  if (!existingPost) {
    return errorResponse(new Error('Post not found'), 404);
  }
  
  // Users can only update their own posts
  if (existingPost.userId !== currentUser.userId) {
    return errorResponse(new Error('You can only update your own posts'), 403);
  }
  
  const updateFields = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};
  
  // Build update expression dynamically
  const allowedFields = ['content', 'images', 'category', 'tags'];
  
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
  
  // Update category GSI if category is being updated
  if (body.category && body.category !== existingPost.category) {
    updateFields.push('#GSI3PK = :GSI3PK', '#GSI3SK = :GSI3SK');
    expressionAttributeNames['#GSI3PK'] = 'GSI3PK';
    expressionAttributeNames['#GSI3SK'] = 'GSI3SK';
    expressionAttributeValues[':GSI3PK'] = `CATEGORY#${body.category}`;
    expressionAttributeValues[':GSI3SK'] = getCurrentTimestamp();
  }
  
  const updateExpression = `SET ${updateFields.join(', ')}`;
  
  const updatedPost = await updateItem(
    tableName,
    { PK: `POST#${postId}`, SK: `POST#${postId}` },
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  );
  
  return successResponse(updatedPost);
}

async function handleDelete(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { pathParameters } = event;
  
  if (!pathParameters?.postId) {
    return errorResponse(new Error('Post ID is required'), 400);
  }
  
  const postId = pathParameters.postId;
  
  // Get the existing post to verify ownership
  const existingPost = await getItem(tableName, {
    PK: `POST#${postId}`,
    SK: `POST#${postId}`,
  });
  
  if (!existingPost) {
    return errorResponse(new Error('Post not found'), 404);
  }
  
  // Users can only delete their own posts
  if (existingPost.userId !== currentUser.userId) {
    return errorResponse(new Error('You can only delete your own posts'), 403);
  }
  
  await deleteItem(tableName, {
    PK: `POST#${postId}`,
    SK: `POST#${postId}`,
  });
  
  return successResponse({ message: 'Post deleted successfully' });
}

async function handleLikes(event: APIGatewayProxyEvent, tableName: string) {
  const currentUser = getUserFromEvent(event);
  const { httpMethod, pathParameters } = event;
  
  if (!pathParameters?.postId) {
    return errorResponse(new Error('Post ID is required'), 400);
  }
  
  const postId = pathParameters.postId;
  
  if (httpMethod === 'POST') {
    // Like a post
    try {
      // Create like record
      const likeId = generateId();
      const like = {
        PK: `POST#${postId}`,
        SK: `LIKE#${currentUser.userId}`,
        entityType: 'LIKE',
        likeId,
        postId,
        userId: currentUser.userId,
        createdAt: getCurrentTimestamp(),
      };
      
      await putItem(tableName, like);
      
      // Increment like count on post
      await updateItem(
        tableName,
        { PK: `POST#${postId}`, SK: `POST#${postId}` },
        'ADD likeCount :inc SET updatedAt = :now',
        {
          ':inc': 1,
          ':now': getCurrentTimestamp(),
        }
      );
      
      return successResponse({ message: 'Post liked successfully' });
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        return errorResponse(new Error('You have already liked this post'), 409);
      }
      throw error;
    }
  } else if (httpMethod === 'DELETE') {
    // Unlike a post
    await deleteItem(tableName, {
      PK: `POST#${postId}`,
      SK: `LIKE#${currentUser.userId}`,
    });
    
    // Decrement like count on post
    await updateItem(
      tableName,
      { PK: `POST#${postId}`, SK: `POST#${postId}` },
      'ADD likeCount :dec SET updatedAt = :now',
      {
        ':dec': -1,
        ':now': getCurrentTimestamp(),
      }
    );
    
    return successResponse({ message: 'Post unliked successfully' });
  }
  
  return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
}