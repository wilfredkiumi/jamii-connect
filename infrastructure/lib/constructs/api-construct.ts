import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { DatabaseTables } from './database-construct';
import * as path from 'path';

export interface ApiConstructProps {
  environment: string;
  userPool: cognito.UserPool;
  identityPool: cognito.CfnIdentityPool;
  tables: DatabaseTables;
  filesBucket: s3.Bucket;
}

export class ApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly authorizer: apigateway.CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const { environment, userPool, tables, filesBucket } = props;

    // Common Lambda environment variables
    const commonEnvVars = {
      ENVIRONMENT: environment,
      USERS_TABLE: tables.users.tableName,
      POSTS_TABLE: tables.posts.tableName,
      JOBS_TABLE: tables.jobs.tableName,
      EVENTS_TABLE: tables.events.tableName,
      SERVICES_TABLE: tables.services.tableName,
      CONNECTIONS_TABLE: tables.connections.tableName,
      FILES_BUCKET: filesBucket.bucketName,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    };

    // Common Lambda layer for shared utilities
    const utilsLayer = new lambda.LayerVersion(this, 'UtilsLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-layers/utils')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Shared utilities for Jamii Connect Lambda functions',
    });

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `jamii-connect-api-${environment}`,
      description: `Jamii Connect API - ${environment}`,
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:3000', 'https://*.jamiiconnect.com'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
      },
      cloudWatchRole: true,
      deployOptions: {
        stageName: environment,
        dataTraceEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
    });

    // Cognito User Pool Authorizer
    this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool],
      authorizerName: `jamii-connect-authorizer-${environment}`,
      identitySource: 'method.request.header.Authorization',
    });

    // Lambda functions

    // 1. Users API
    const usersFunction = new lambdaNodejs.NodejsFunction(this, 'UsersFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../lambda/users/index.ts'),
      handler: 'handler',
      environment: commonEnvVars,
      layers: [utilsLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // 2. Posts API
    const postsFunction = new lambdaNodejs.NodejsFunction(this, 'PostsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../lambda/posts/index.ts'),
      handler: 'handler',
      environment: commonEnvVars,
      layers: [utilsLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // 3. Jobs API
    const jobsFunction = new lambdaNodejs.NodejsFunction(this, 'JobsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../lambda/jobs/index.ts'),
      handler: 'handler',
      environment: commonEnvVars,
      layers: [utilsLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // 4. Events API
    const eventsFunction = new lambdaNodejs.NodejsFunction(this, 'EventsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../lambda/events/index.ts'),
      handler: 'handler',
      environment: commonEnvVars,
      layers: [utilsLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // 5. Services API
    const servicesFunction = new lambdaNodejs.NodejsFunction(this, 'ServicesFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../lambda/services/index.ts'),
      handler: 'handler',
      environment: commonEnvVars,
      layers: [utilsLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // 6. Connections API
    const connectionsFunction = new lambdaNodejs.NodejsFunction(this, 'ConnectionsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../lambda/connections/index.ts'),
      handler: 'handler',
      environment: commonEnvVars,
      layers: [utilsLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // 7. File Upload API
    const fileUploadFunction = new lambdaNodejs.NodejsFunction(this, 'FileUploadFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../lambda/file-upload/index.ts'),
      handler: 'handler',
      environment: commonEnvVars,
      layers: [utilsLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Grant DynamoDB permissions to Lambda functions
    const lambdaFunctions = [
      usersFunction,
      postsFunction,
      jobsFunction,
      eventsFunction,
      servicesFunction,
      connectionsFunction,
    ];

    lambdaFunctions.forEach((func) => {
      Object.values(tables).forEach((table) => {
        table.grantReadWriteData(func);
      });
    });

    // Grant S3 permissions to file upload function
    filesBucket.grantReadWrite(fileUploadFunction);

    // API Gateway Resources and Methods

    // Users API
    const usersResource = this.api.root.addResource('users');
    usersResource.addMethod('GET', new apigateway.LambdaIntegration(usersFunction), {
      authorizer: this.authorizer,
    });
    usersResource.addMethod('POST', new apigateway.LambdaIntegration(usersFunction), {
      authorizer: this.authorizer,
    });

    const userResource = usersResource.addResource('{userId}');
    userResource.addMethod('GET', new apigateway.LambdaIntegration(usersFunction), {
      authorizer: this.authorizer,
    });
    userResource.addMethod('PUT', new apigateway.LambdaIntegration(usersFunction), {
      authorizer: this.authorizer,
    });
    userResource.addMethod('DELETE', new apigateway.LambdaIntegration(usersFunction), {
      authorizer: this.authorizer,
    });

    // Posts API
    const postsResource = this.api.root.addResource('posts');
    postsResource.addMethod('GET', new apigateway.LambdaIntegration(postsFunction));
    postsResource.addMethod('POST', new apigateway.LambdaIntegration(postsFunction), {
      authorizer: this.authorizer,
    });

    const postResource = postsResource.addResource('{postId}');
    postResource.addMethod('GET', new apigateway.LambdaIntegration(postsFunction));
    postResource.addMethod('PUT', new apigateway.LambdaIntegration(postsFunction), {
      authorizer: this.authorizer,
    });
    postResource.addMethod('DELETE', new apigateway.LambdaIntegration(postsFunction), {
      authorizer: this.authorizer,
    });

    const postLikesResource = postResource.addResource('likes');
    postLikesResource.addMethod('POST', new apigateway.LambdaIntegration(postsFunction), {
      authorizer: this.authorizer,
    });
    postLikesResource.addMethod('DELETE', new apigateway.LambdaIntegration(postsFunction), {
      authorizer: this.authorizer,
    });

    // Jobs API
    const jobsResource = this.api.root.addResource('jobs');
    jobsResource.addMethod('GET', new apigateway.LambdaIntegration(jobsFunction));
    jobsResource.addMethod('POST', new apigateway.LambdaIntegration(jobsFunction), {
      authorizer: this.authorizer,
    });

    const jobResource = jobsResource.addResource('{jobId}');
    jobResource.addMethod('GET', new apigateway.LambdaIntegration(jobsFunction));
    jobResource.addMethod('PUT', new apigateway.LambdaIntegration(jobsFunction), {
      authorizer: this.authorizer,
    });
    jobResource.addMethod('DELETE', new apigateway.LambdaIntegration(jobsFunction), {
      authorizer: this.authorizer,
    });

    const jobApplicationsResource = jobResource.addResource('applications');
    jobApplicationsResource.addMethod('GET', new apigateway.LambdaIntegration(jobsFunction), {
      authorizer: this.authorizer,
    });
    jobApplicationsResource.addMethod('POST', new apigateway.LambdaIntegration(jobsFunction), {
      authorizer: this.authorizer,
    });

    // Events API
    const eventsResource = this.api.root.addResource('events');
    eventsResource.addMethod('GET', new apigateway.LambdaIntegration(eventsFunction));
    eventsResource.addMethod('POST', new apigateway.LambdaIntegration(eventsFunction), {
      authorizer: this.authorizer,
    });

    const eventResource = eventsResource.addResource('{eventId}');
    eventResource.addMethod('GET', new apigateway.LambdaIntegration(eventsFunction));
    eventResource.addMethod('PUT', new apigateway.LambdaIntegration(eventsFunction), {
      authorizer: this.authorizer,
    });
    eventResource.addMethod('DELETE', new apigateway.LambdaIntegration(eventsFunction), {
      authorizer: this.authorizer,
    });

    const eventAttendeesResource = eventResource.addResource('attendees');
    eventAttendeesResource.addMethod('GET', new apigateway.LambdaIntegration(eventsFunction));
    eventAttendeesResource.addMethod('POST', new apigateway.LambdaIntegration(eventsFunction), {
      authorizer: this.authorizer,
    });
    eventAttendeesResource.addMethod('DELETE', new apigateway.LambdaIntegration(eventsFunction), {
      authorizer: this.authorizer,
    });

    // Services API
    const servicesApiResource = this.api.root.addResource('services');
    servicesApiResource.addMethod('GET', new apigateway.LambdaIntegration(servicesFunction));
    servicesApiResource.addMethod('POST', new apigateway.LambdaIntegration(servicesFunction), {
      authorizer: this.authorizer,
    });

    const serviceResource = servicesApiResource.addResource('{serviceId}');
    serviceResource.addMethod('GET', new apigateway.LambdaIntegration(servicesFunction));
    serviceResource.addMethod('PUT', new apigateway.LambdaIntegration(servicesFunction), {
      authorizer: this.authorizer,
    });
    serviceResource.addMethod('DELETE', new apigateway.LambdaIntegration(servicesFunction), {
      authorizer: this.authorizer,
    });

    // Connections API
    const connectionsApiResource = this.api.root.addResource('connections');
    connectionsApiResource.addMethod('GET', new apigateway.LambdaIntegration(connectionsFunction), {
      authorizer: this.authorizer,
    });
    connectionsApiResource.addMethod('POST', new apigateway.LambdaIntegration(connectionsFunction), {
      authorizer: this.authorizer,
    });

    const connectionResource = connectionsApiResource.addResource('{connectionId}');
    connectionResource.addMethod('GET', new apigateway.LambdaIntegration(connectionsFunction), {
      authorizer: this.authorizer,
    });
    connectionResource.addMethod('PUT', new apigateway.LambdaIntegration(connectionsFunction), {
      authorizer: this.authorizer,
    });
    connectionResource.addMethod('DELETE', new apigateway.LambdaIntegration(connectionsFunction), {
      authorizer: this.authorizer,
    });

    // File Upload API
    const uploadResource = this.api.root.addResource('upload');
    uploadResource.addMethod('POST', new apigateway.LambdaIntegration(fileUploadFunction), {
      authorizer: this.authorizer,
    });

    const getSignedUrlResource = uploadResource.addResource('signed-url');
    getSignedUrlResource.addMethod('POST', new apigateway.LambdaIntegration(fileUploadFunction), {
      authorizer: this.authorizer,
    });

    // Health check endpoint (no auth required)
    const healthResource = this.api.root.addResource('health');
    const healthFunction = new lambda.Function(this, 'HealthFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async () => {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              status: 'healthy',
              environment: process.env.ENVIRONMENT,
              timestamp: new Date().toISOString(),
            }),
          };
        };
      `),
      environment: { ENVIRONMENT: environment },
    });

    healthResource.addMethod('GET', new apigateway.LambdaIntegration(healthFunction));

    // Usage Plan and API Key for rate limiting
    const usagePlan = new apigateway.UsagePlan(this, 'UsagePlan', {
      name: `jamii-connect-usage-plan-${environment}`,
      description: `Usage plan for Jamii Connect API - ${environment}`,
      throttle: {
        rateLimit: 100,
        burstLimit: 200,
      },
      quota: {
        limit: 10000,
        period: apigateway.Period.DAY,
      },
    });

    usagePlan.addApiStage({
      stage: this.api.deploymentStage,
    });

    // Tags
    cdk.Tags.of(this.api).add('Application', 'JamiiConnect');
    cdk.Tags.of(this.api).add('Environment', environment);
  }
}