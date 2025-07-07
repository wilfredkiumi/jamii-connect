import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthConstruct } from './constructs/auth-construct';
import { DatabaseConstruct } from './constructs/database-construct';
import { ApiConstruct } from './constructs/api-construct';
import { StorageConstruct } from './constructs/storage-construct';
import { FrontendConstruct } from './constructs/frontend-construct';

export interface JamiiConnectStackProps extends cdk.StackProps {
  environment: string;
  domainName?: string;
  certificateArn?: string;
}

export class JamiiConnectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: JamiiConnectStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // Storage (S3 bucket for file uploads)
    const storage = new StorageConstruct(this, 'Storage', {
      environment,
    });

    // Authentication (Cognito User Pool & Identity Pool)
    const auth = new AuthConstruct(this, 'Auth', {
      environment,
      domainName: props.domainName,
    });

    // Database (DynamoDB tables)
    const database = new DatabaseConstruct(this, 'Database', {
      environment,
    });

    // API (Lambda functions & API Gateway)
    const api = new ApiConstruct(this, 'Api', {
      environment,
      userPool: auth.userPool,
      identityPool: auth.identityPool,
      tables: database.tables,
      filesBucket: storage.filesBucket,
    });

    // Frontend hosting (optional - if you want to deploy frontend via CDK)
    if (props.domainName && props.certificateArn) {
      new FrontendConstruct(this, 'Frontend', {
        environment,
        domainName: props.domainName,
        certificateArn: props.certificateArn,
        api: api.api,
      });
    }

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: auth.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${id}-UserPoolId`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: auth.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${id}-UserPoolClientId`,
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: auth.identityPool.identityPoolId,
      description: 'Cognito Identity Pool ID',
      exportName: `${id}-IdentityPoolId`,
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.api.url,
      description: 'API Gateway endpoint URL',
      exportName: `${id}-ApiEndpoint`,
    });

    new cdk.CfnOutput(this, 'FilesBucketName', {
      value: storage.filesBucket.bucketName,
      description: 'S3 bucket for file uploads',
      exportName: `${id}-FilesBucketName`,
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'AWS Region',
      exportName: `${id}-Region`,
    });

    // Output all table names
    Object.entries(database.tables).forEach(([key, table]) => {
      new cdk.CfnOutput(this, `${key}TableName`, {
        value: table.tableName,
        description: `${key} DynamoDB table name`,
        exportName: `${id}-${key}TableName`,
      });
    });
  }
}