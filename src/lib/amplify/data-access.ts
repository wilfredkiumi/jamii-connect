import { getDynamoDBClient, TABLES, GSI, generateId, getCurrentTimestamp } from './dynamodb';
import { 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand, 
  DeleteCommand, 
  ScanCommand,
  BatchWriteCommand 
} from '@aws-sdk/lib-dynamodb';
import type { 
  UserEntity, 
  PostEntity, 
  JobEntity, 
  EventEntity, 
  ServiceEntity, 
  ConnectionEntity 
} from './dynamodb';

const client = getDynamoDBClient();

// User operations
export const userOperations = {
  async create(user: Omit<UserEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt'>) {
    const timestamp = getCurrentTimestamp();
    const item: UserEntity = {
      PK: `USER#${user.userId}`,
      SK: `USER#${user.userId}`,
      entityType: 'USER',
      createdAt: timestamp,
      updatedAt: timestamp,
      GSI1PK: 'USER',
      GSI1SK: timestamp,
      ...user,
    };

    await client.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: item,
    }));

    return item;
  },

  async get(userId: string): Promise<UserEntity | null> {
    const result = await client.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: {
        PK: `USER#${userId}`,
        SK: `USER#${userId}`,
      },
    }));

    return result.Item as UserEntity || null;
  },

  async update(userId: string, updates: Partial<UserEntity>) {
    const updateExpression = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'PK' && key !== 'SK' && key !== 'userId') {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = getCurrentTimestamp();

    await client.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: {
        PK: `USER#${userId}`,
        SK: `USER#${userId}`,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    }));
  },

  async list(limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: GSI.BY_TIMESTAMP,
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'USER',
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as UserEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },
};

// Post operations
export const postOperations = {
  async create(post: Omit<PostEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'postId' | 'likeCount' | 'commentCount'>) {
    const postId = generateId();
    const timestamp = getCurrentTimestamp();
    const item: PostEntity = {
      PK: `POST#${postId}`,
      SK: `POST#${postId}`,
      entityType: 'POST',
      postId,
      createdAt: timestamp,
      updatedAt: timestamp,
      likeCount: 0,
      commentCount: 0,
      GSI1PK: 'POST',
      GSI1SK: timestamp,
      GSI2PK: `USER#${post.userId}`,
      GSI2SK: timestamp,
      ...post,
    };

    await client.send(new PutCommand({
      TableName: TABLES.POSTS,
      Item: item,
    }));

    return item;
  },

  async get(postId: string): Promise<PostEntity | null> {
    const result = await client.send(new GetCommand({
      TableName: TABLES.POSTS,
      Key: {
        PK: `POST#${postId}`,
        SK: `POST#${postId}`,
      },
    }));

    return result.Item as PostEntity || null;
  },

  async listByUser(userId: string, limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.POSTS,
      IndexName: GSI.BY_USER,
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as PostEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },

  async listAll(limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.POSTS,
      IndexName: GSI.BY_TIMESTAMP,
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'POST',
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as PostEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },

  async incrementLikes(postId: string) {
    await client.send(new UpdateCommand({
      TableName: TABLES.POSTS,
      Key: {
        PK: `POST#${postId}`,
        SK: `POST#${postId}`,
      },
      UpdateExpression: 'ADD likeCount :inc SET updatedAt = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': getCurrentTimestamp(),
      },
    }));
  },

  async incrementComments(postId: string) {
    await client.send(new UpdateCommand({
      TableName: TABLES.POSTS,
      Key: {
        PK: `POST#${postId}`,
        SK: `POST#${postId}`,
      },
      UpdateExpression: 'ADD commentCount :inc SET updatedAt = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': getCurrentTimestamp(),
      },
    }));
  },
};

// Job operations
export const jobOperations = {
  async create(job: Omit<JobEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'jobId'>) {
    const jobId = generateId();
    const timestamp = getCurrentTimestamp();
    const item: JobEntity = {
      PK: `JOB#${jobId}`,
      SK: `JOB#${jobId}`,
      entityType: 'JOB',
      jobId,
      createdAt: timestamp,
      updatedAt: timestamp,
      GSI1PK: `JOB#${job.status}`,
      GSI1SK: timestamp,
      GSI2PK: `LOCATION#${job.location}`,
      GSI2SK: timestamp,
      ...job,
    };

    await client.send(new PutCommand({
      TableName: TABLES.JOBS,
      Item: item,
    }));

    return item;
  },

  async get(jobId: string): Promise<JobEntity | null> {
    const result = await client.send(new GetCommand({
      TableName: TABLES.JOBS,
      Key: {
        PK: `JOB#${jobId}`,
        SK: `JOB#${jobId}`,
      },
    }));

    return result.Item as JobEntity || null;
  },

  async listByStatus(status: string, limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.JOBS,
      IndexName: GSI.BY_STATUS,
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `JOB#${status}`,
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as JobEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },

  async listByLocation(location: string, limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.JOBS,
      IndexName: GSI.BY_LOCATION,
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `LOCATION#${location}`,
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as JobEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },

  async search(filters: {
    jobType?: string;
    experienceLevel?: string;
    diasporaFriendly?: boolean;
    visaSponsorship?: boolean;
  }, limit = 20, lastEvaluatedKey?: any) {
    const filterExpressions = [];
    const expressionAttributeValues: any = {};

    if (filters.jobType) {
      filterExpressions.push('jobType = :jobType');
      expressionAttributeValues[':jobType'] = filters.jobType;
    }
    if (filters.experienceLevel) {
      filterExpressions.push('experienceLevel = :experienceLevel');
      expressionAttributeValues[':experienceLevel'] = filters.experienceLevel;
    }
    if (filters.diasporaFriendly !== undefined) {
      filterExpressions.push('diasporaFriendly = :diasporaFriendly');
      expressionAttributeValues[':diasporaFriendly'] = filters.diasporaFriendly;
    }
    if (filters.visaSponsorship !== undefined) {
      filterExpressions.push('visaSponsorship = :visaSponsorship');
      expressionAttributeValues[':visaSponsorship'] = filters.visaSponsorship;
    }

    const params: any = {
      TableName: TABLES.JOBS,
      IndexName: GSI.BY_STATUS,
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'JOB#active',
        ...expressionAttributeValues,
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
    }

    const result = await client.send(new QueryCommand(params));

    return {
      items: result.Items as JobEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },
};

// Event operations
export const eventOperations = {
  async create(event: Omit<EventEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'eventId' | 'attendeeCount'>) {
    const eventId = generateId();
    const timestamp = getCurrentTimestamp();
    const item: EventEntity = {
      PK: `EVENT#${eventId}`,
      SK: `EVENT#${eventId}`,
      entityType: 'EVENT',
      eventId,
      createdAt: timestamp,
      updatedAt: timestamp,
      attendeeCount: 0,
      GSI1PK: `EVENT#${event.status}`,
      GSI1SK: event.startDate,
      GSI2PK: `CATEGORY#${event.category}`,
      GSI2SK: event.startDate,
      ...event,
    };

    await client.send(new PutCommand({
      TableName: TABLES.EVENTS,
      Item: item,
    }));

    return item;
  },

  async get(eventId: string): Promise<EventEntity | null> {
    const result = await client.send(new GetCommand({
      TableName: TABLES.EVENTS,
      Key: {
        PK: `EVENT#${eventId}`,
        SK: `EVENT#${eventId}`,
      },
    }));

    return result.Item as EventEntity || null;
  },

  async listUpcoming(limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.EVENTS,
      IndexName: GSI.BY_STATUS,
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK >= :now',
      ExpressionAttributeValues: {
        ':pk': 'EVENT#upcoming',
        ':now': getCurrentTimestamp(),
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as EventEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },

  async listByCategory(category: string, limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.EVENTS,
      IndexName: GSI.BY_CATEGORY,
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `CATEGORY#${category}`,
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as EventEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },

  async incrementAttendees(eventId: string) {
    await client.send(new UpdateCommand({
      TableName: TABLES.EVENTS,
      Key: {
        PK: `EVENT#${eventId}`,
        SK: `EVENT#${eventId}`,
      },
      UpdateExpression: 'ADD attendeeCount :inc SET updatedAt = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': getCurrentTimestamp(),
      },
    }));
  },
};

// Service operations
export const serviceOperations = {
  async create(service: Omit<ServiceEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'serviceId'>) {
    const serviceId = generateId();
    const timestamp = getCurrentTimestamp();
    const item: ServiceEntity = {
      PK: `SERVICE#${serviceId}`,
      SK: `SERVICE#${serviceId}`,
      entityType: 'SERVICE',
      serviceId,
      createdAt: timestamp,
      updatedAt: timestamp,
      GSI1PK: `CATEGORY#${service.category}`,
      GSI1SK: timestamp,
      GSI2PK: `LOCATION#${service.location}`,
      GSI2SK: timestamp,
      ...service,
    };

    await client.send(new PutCommand({
      TableName: TABLES.SERVICES,
      Item: item,
    }));

    return item;
  },

  async get(serviceId: string): Promise<ServiceEntity | null> {
    const result = await client.send(new GetCommand({
      TableName: TABLES.SERVICES,
      Key: {
        PK: `SERVICE#${serviceId}`,
        SK: `SERVICE#${serviceId}`,
      },
    }));

    return result.Item as ServiceEntity || null;
  },

  async listByCategory(category: string, limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.SERVICES,
      IndexName: GSI.BY_CATEGORY,
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `CATEGORY#${category}`,
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as ServiceEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },

  async listByLocation(location: string, limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.SERVICES,
      IndexName: GSI.BY_LOCATION,
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `LOCATION#${location}`,
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as ServiceEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },
};

// Connection operations
export const connectionOperations = {
  async create(connection: Omit<ConnectionEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'connectionId'>) {
    const connectionId = generateId();
    const timestamp = getCurrentTimestamp();
    const item: ConnectionEntity = {
      PK: `USER#${connection.userId}`,
      SK: `CONNECTION#${connection.connectedUserId}`,
      entityType: 'CONNECTION',
      connectionId,
      createdAt: timestamp,
      updatedAt: timestamp,
      GSI1PK: `USER#${connection.connectedUserId}`,
      GSI1SK: `CONNECTION#${connection.userId}`,
      ...connection,
    };

    await client.send(new PutCommand({
      TableName: TABLES.CONNECTIONS,
      Item: item,
    }));

    return item;
  },

  async get(userId: string, connectedUserId: string): Promise<ConnectionEntity | null> {
    const result = await client.send(new GetCommand({
      TableName: TABLES.CONNECTIONS,
      Key: {
        PK: `USER#${userId}`,
        SK: `CONNECTION#${connectedUserId}`,
      },
    }));

    return result.Item as ConnectionEntity || null;
  },

  async listUserConnections(userId: string, limit = 20, lastEvaluatedKey?: any) {
    const result = await client.send(new QueryCommand({
      TableName: TABLES.CONNECTIONS,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'CONNECTION#',
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      items: result.Items as ConnectionEntity[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  },

  async updateStatus(userId: string, connectedUserId: string, status: 'accepted' | 'blocked') {
    await client.send(new UpdateCommand({
      TableName: TABLES.CONNECTIONS,
      Key: {
        PK: `USER#${userId}`,
        SK: `CONNECTION#${connectedUserId}`,
      },
      UpdateExpression: 'SET #status = :status, updatedAt = :now',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':now': getCurrentTimestamp(),
      },
    }));
  },
};

// Direct exports for backward compatibility
export const listJobs = async (params: {
  status?: string;
  location?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}) => {
  const { status = 'active', location, limit = 20, lastEvaluatedKey } = params;
  
  if (location) {
    return await jobOperations.listByLocation(location, limit, lastEvaluatedKey);
  }
  
  return await jobOperations.listByStatus(status, limit, lastEvaluatedKey);
};

export const searchJobs = async (filters: {
  jobType?: string;
  experienceLevel?: string;
  diasporaFriendly?: boolean;
  visaSponsorship?: boolean;
  limit?: number;
  lastEvaluatedKey?: any;
}) => {
  const { limit = 20, lastEvaluatedKey, ...searchFilters } = filters;
  return await jobOperations.search(searchFilters, limit, lastEvaluatedKey);
};

export const getJob = async (jobId: string) => {
  return await jobOperations.get(jobId);
};

export const createJob = async (job: Omit<JobEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'jobId'>) => {
  return await jobOperations.create(job);
};

export const listEvents = async (params: {
  status?: string;
  category?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}) => {
  const { status = 'upcoming', category, limit = 20, lastEvaluatedKey } = params;
  
  if (category) {
    return await eventOperations.listByCategory(category, limit, lastEvaluatedKey);
  }
  
  // For upcoming events
  return await eventOperations.listUpcoming(limit, lastEvaluatedKey);
};

export const searchEvents = async (filters: {
  category?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}) => {
  const { category, limit = 20, lastEvaluatedKey } = filters;
  
  if (category) {
    return await eventOperations.listByCategory(category, limit, lastEvaluatedKey);
  }
  
  return await eventOperations.listUpcoming(limit, lastEvaluatedKey);
};

export const getEvent = async (eventId: string) => {
  return await eventOperations.get(eventId);
};

export const createEvent = async (event: Omit<EventEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'eventId'>) => {
  return await eventOperations.create(event);
};

export const listServices = async (params: {
  category?: string;
  location?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}) => {
  const { category, location, limit = 20, lastEvaluatedKey } = params;
  
  if (category) {
    return await serviceOperations.listByCategory(category, limit, lastEvaluatedKey);
  }
  
  if (location) {
    return await serviceOperations.listByLocation(location, limit, lastEvaluatedKey);
  }
  
  // Default to listing by category (could be 'all' or any default category)
  return await serviceOperations.listByCategory('all', limit, lastEvaluatedKey);
};

export const searchServices = async (filters: {
  category?: string;
  location?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}) => {
  const { category, location, limit = 20, lastEvaluatedKey } = filters;
  
  if (category) {
    return await serviceOperations.listByCategory(category, limit, lastEvaluatedKey);
  }
  
  if (location) {
    return await serviceOperations.listByLocation(location, limit, lastEvaluatedKey);
  }
  
  return await serviceOperations.listByCategory('all', limit, lastEvaluatedKey);
};

export const getService = async (serviceId: string) => {
  return await serviceOperations.get(serviceId);
};

export const createService = async (service: Omit<ServiceEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt' | 'serviceId'>) => {
  return await serviceOperations.create(service);
};

export const listConnections = async (params: {
  userId: string;
  limit?: number;
  lastEvaluatedKey?: any;
}) => {
  const { userId, limit = 20, lastEvaluatedKey } = params;
  
  return await connectionOperations.listUserConnections(userId, limit, lastEvaluatedKey);
};

export const searchUsers = async (filters: {
  limit?: number;
  lastEvaluatedKey?: any;
}) => {
  const { limit = 20, lastEvaluatedKey } = filters;
  
  // For now, return all users - could be enhanced with proper search
  return await userOperations.list(limit, lastEvaluatedKey);
};

export const getUser = async (userId: string) => {
  return await userOperations.get(userId);
};

export const createUser = async (user: Omit<UserEntity, 'PK' | 'SK' | 'entityType' | 'createdAt' | 'updatedAt'>) => {
  return await userOperations.create(user);
};