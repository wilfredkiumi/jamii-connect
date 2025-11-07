const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

// Initialize clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Utility functions
const generateId = () => `${Date.now()}-${uuidv4().split('-')[0]}`;
const getCurrentTimestamp = () => new Date().toISOString();

// Response helpers
const createResponse = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    ...headers,
  },
  body: JSON.stringify(body),
});

const successResponse = (data, statusCode = 200) => createResponse(statusCode, { success: true, data });
const errorResponse = (error, statusCode = 500) => {
  console.error('Error:', error);
  return createResponse(statusCode, { 
    success: false, 
    error: error.message || 'Internal server error' 
  });
};

// DynamoDB helpers
const putItem = async (tableName, item) => {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });
  return await docClient.send(command);
};

const getItem = async (tableName, key) => {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });
  const result = await docClient.send(command);
  return result.Item;
};

const queryItems = async (tableName, keyConditionExpression, expressionAttributeValues, indexName = null, limit = 50) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    Limit: limit,
    ScanIndexForward: false, // Sort descending by default
  };

  if (indexName) {
    params.IndexName = indexName;
  }

  const command = new QueryCommand(params);
  const result = await docClient.send(command);
  return {
    items: result.Items || [],
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
};

const updateItem = async (tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames = {}) => {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
    ReturnValues: 'ALL_NEW',
  });
  const result = await docClient.send(command);
  return result.Attributes;
};

const deleteItem = async (tableName, key) => {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });
  return await docClient.send(command);
};

// S3 helpers
const getSignedUploadUrl = async (bucketName, key, contentType, expiresIn = 3600) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

const getSignedDownloadUrl = async (bucketName, key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

// Auth helpers
const getUserFromEvent = (event) => {
  const claims = event.requestContext?.authorizer?.claims;
  if (!claims) {
    throw new Error('No authentication claims found');
  }
  
  return {
    userId: claims.sub,
    email: claims.email,
    firstName: claims.given_name,
    lastName: claims.family_name,
    username: claims.preferred_username,
  };
};

// Validation helpers
const validateRequired = (obj, fields) => {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

const parseBody = (event) => {
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
};

// Export all utilities
module.exports = {
  // Clients
  docClient,
  s3Client,
  
  // Utilities
  generateId,
  getCurrentTimestamp,
  
  // Response helpers
  successResponse,
  errorResponse,
  createResponse,
  
  // DynamoDB helpers
  putItem,
  getItem,
  queryItems,
  updateItem,
  deleteItem,
  
  // S3 helpers
  getSignedUploadUrl,
  getSignedDownloadUrl,
  
  // Auth helpers
  getUserFromEvent,
  
  // Validation helpers
  validateRequired,
  parseBody,
};