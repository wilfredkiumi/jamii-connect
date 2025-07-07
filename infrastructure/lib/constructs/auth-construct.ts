import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface AuthConstructProps {
  environment: string;
  domainName?: string;
}

export class AuthConstruct extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;
  public readonly authenticatedRole: iam.Role;
  public readonly unauthenticatedRole: iam.Role;

  constructor(scope: Construct, id: string, props: AuthConstructProps) {
    super(scope, id);

    const { environment } = props;

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `jamii-connect-users-${environment}`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
        preferredUsername: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        location: new cognito.StringAttribute({ minLen: 1, maxLen: 100, mutable: true }),
        bio: new cognito.StringAttribute({ minLen: 1, maxLen: 500, mutable: true }),
        heritage_country: new cognito.StringAttribute({ minLen: 1, maxLen: 50, mutable: true }),
        current_country: new cognito.StringAttribute({ minLen: 1, maxLen: 50, mutable: true }),
        skills: new cognito.StringAttribute({ minLen: 1, maxLen: 1000, mutable: true }),
        interests: new cognito.StringAttribute({ minLen: 1, maxLen: 1000, mutable: true }),
        profession: new cognito.StringAttribute({ minLen: 1, maxLen: 100, mutable: true }),
        company: new cognito.StringAttribute({ minLen: 1, maxLen: 100, mutable: true }),
        linkedin_url: new cognito.StringAttribute({ minLen: 1, maxLen: 200, mutable: true }),
        is_mentor: new cognito.StringAttribute({ minLen: 1, maxLen: 10, mutable: true }),
        is_seeking_mentorship: new cognito.StringAttribute({ minLen: 1, maxLen: 10, mutable: true }),
        created_at: new cognito.StringAttribute({ minLen: 1, maxLen: 50, mutable: false }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `jamii-connect-client-${environment}`,
      generateSecret: false,
      authFlows: {
        userSrp: true,
        userPassword: true,
        adminUserPassword: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:3000',
          ...(props.domainName ? [`https://${props.domainName}`] : []),
        ],
        logoutUrls: [
          'http://localhost:3000',
          ...(props.domainName ? [`https://${props.domainName}`] : []),
        ],
      },
      preventUserExistenceErrors: true,
      readAttributes: new cognito.ClientAttributes()
        .withStandardAttributes({
          email: true,
          emailVerified: true,
          givenName: true,
          familyName: true,
          preferredUsername: true,
        })
        .withCustomAttributes(
          'location',
          'bio',
          'heritage_country',
          'current_country',
          'skills',
          'interests',
          'profession',
          'company',
          'linkedin_url',
          'is_mentor',
          'is_seeking_mentorship',
          'created_at'
        ),
      writeAttributes: new cognito.ClientAttributes()
        .withStandardAttributes({
          email: true,
          givenName: true,
          familyName: true,
          preferredUsername: true,
        })
        .withCustomAttributes(
          'location',
          'bio',
          'heritage_country',
          'current_country',
          'skills',
          'interests',
          'profession',
          'company',
          'linkedin_url',
          'is_mentor',
          'is_seeking_mentorship'
        ),
    });

    // User Pool Domain (optional, for hosted UI)
    if (props.domainName) {
      new cognito.UserPoolDomain(this, 'UserPoolDomain', {
        userPool: this.userPool,
        cognitoDomain: {
          domainPrefix: `jamii-connect-auth-${environment}`,
        },
      });
    }

    // IAM Roles for Identity Pool
    this.authenticatedRole = new iam.Role(this, 'AuthenticatedRole', {
      roleName: `JamiiConnect-AuthenticatedRole-${environment}`,
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': '${cognito-identity.amazonaws.com:aud}',
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      inlinePolicies: {
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:BatchGetItem',
                'dynamodb:BatchWriteItem',
              ],
              resources: [
                `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:table/JamiiConnect-*-${environment}`,
                `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:table/JamiiConnect-*-${environment}/index/*`,
              ],
              conditions: {
                'ForAllValues:StringEquals': {
                  'dynamodb:LeadingKeys': ['${cognito-identity.amazonaws.com:sub}'],
                },
              },
            }),
          ],
        }),
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
              ],
              resources: [
                `arn:aws:s3:::jamii-connect-files-${environment}/private/\${cognito-identity.amazonaws.com:sub}/*`,
                `arn:aws:s3:::jamii-connect-files-${environment}/protected/\${cognito-identity.amazonaws.com:sub}/*`,
              ],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
              ],
              resources: [
                `arn:aws:s3:::jamii-connect-files-${environment}/public/*`,
              ],
            }),
          ],
        }),
      },
    });

    this.unauthenticatedRole = new iam.Role(this, 'UnauthenticatedRole', {
      roleName: `JamiiConnect-UnauthenticatedRole-${environment}`,
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': '${cognito-identity.amazonaws.com:aud}',
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      inlinePolicies: {
        S3PublicReadAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject'],
              resources: [`arn:aws:s3:::jamii-connect-files-${environment}/public/*`],
            }),
          ],
        }),
      },
    });

    // Cognito Identity Pool
    this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: `jamii_connect_identity_pool_${environment}`,
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });

    // Attach roles to Identity Pool
    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: this.authenticatedRole.roleArn,
        unauthenticated: this.unauthenticatedRole.roleArn,
      },
    });

    // Lambda trigger for post-confirmation (create user profile in DynamoDB)
    const postConfirmationTrigger = new cdk.aws_lambda.Function(this, 'PostConfirmationTrigger', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: cdk.aws_lambda.Code.fromInline(`
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Post-confirmation trigger:', JSON.stringify(event, null, 2));
  
  const { userName, request } = event;
  const { userAttributes } = request;
  
  // Create user profile in DynamoDB
  const userProfile = {
    PK: \`USER#\${userName}\`,
    SK: \`USER#\${userName}\`,
    entityType: 'USER',
    userId: userName,
    email: userAttributes.email,
    firstName: userAttributes.given_name,
    lastName: userAttributes.family_name,
    username: userAttributes.preferred_username,
    verified: userAttributes.email_verified === 'true',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    GSI1PK: 'USER',
    GSI1SK: new Date().toISOString(),
  };
  
  try {
    await dynamodb.put({
      TableName: process.env.USERS_TABLE,
      Item: userProfile,
    }).promise();
    
    console.log('User profile created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
  
  return event;
};
      `),
      environment: {
        USERS_TABLE: `JamiiConnect-Users-${environment}`,
      },
    });

    // Grant permissions to the Lambda function
    postConfirmationTrigger.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:PutItem'],
        resources: [`arn:aws:dynamodb:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:table/JamiiConnect-Users-${environment}`],
      })
    );

    // Add Lambda trigger to User Pool
    this.userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, postConfirmationTrigger);
  }
}