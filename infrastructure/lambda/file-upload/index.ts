import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const {
  successResponse,
  errorResponse,
  getUserFromEvent,
  parseBody,
  validateRequired,
  getSignedUploadUrl,
  getSignedDownloadUrl,
  generateId,
} = require('/opt/nodejs/index');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { httpMethod, resource } = event;
    const bucket = process.env.FILES_BUCKET!;

    if (resource.includes('/signed-url')) {
      return await handleGetSignedUrl(event, bucket);
    }

    switch (httpMethod) {
      case 'POST':
        return await handleUpload(event, bucket);
      default:
        return errorResponse(new Error(`Unsupported method: ${httpMethod}`), 405);
    }
  } catch (error) {
    console.error('Error in file upload handler:', error);
    return errorResponse(error);
  }
};

async function handleGetSignedUrl(event: APIGatewayProxyEvent, bucketName: string) {
  const currentUser = getUserFromEvent(event);
  const body = parseBody(event);
  
  validateRequired(body, ['fileName', 'fileType', 'folder']);
  
  const { fileName, fileType, folder } = body;
  
  // Validate folder permissions
  const allowedFolders = ['public', 'protected', 'private'];
  if (!allowedFolders.includes(folder)) {
    return errorResponse(new Error('Invalid folder specified'), 400);
  }
  
  // Generate unique file key
  const fileId = generateId();
  const fileExtension = fileName.split('.').pop();
  const key = `${folder}/${currentUser.userId}/${fileId}.${fileExtension}`;
  
  try {
    const signedUrl = await getSignedUploadUrl(bucketName, key, fileType, 3600); // 1 hour expiry
    
    return successResponse({
      uploadUrl: signedUrl,
      fileKey: key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return errorResponse(new Error('Failed to generate upload URL'));
  }
}

async function handleUpload(event: APIGatewayProxyEvent, bucketName: string) {
  // This endpoint would handle direct file uploads if needed
  // For now, we'll use pre-signed URLs for better performance
  return successResponse({ 
    message: 'Use the signed-url endpoint to get a pre-signed upload URL' 
  });
}