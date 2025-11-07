#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { JamiiConnectStack } from '../lib/jamii-connect-stack';

const app = new cdk.App();

// Get environment from context
const environment = app.node.tryGetContext('environment') || 'dev';

// Environment-specific configuration
const config = {
  dev: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    domainName: 'dev.jamiiconnect.com',
    certificateArn: process.env.DEV_CERTIFICATE_ARN,
  },
  staging: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    domainName: 'staging.jamiiconnect.com',
    certificateArn: process.env.STAGING_CERTIFICATE_ARN,
  },
  prod: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    domainName: 'jamiiconnect.com',
    certificateArn: process.env.PROD_CERTIFICATE_ARN,
  },
};

const envConfig = config[environment as keyof typeof config];

new JamiiConnectStack(app, `JamiiConnectStack-${environment}`, {
  env: {
    account: envConfig.account,
    region: envConfig.region,
  },
  environment,
  domainName: envConfig.domainName,
  certificateArn: envConfig.certificateArn,
});

// Add tags to all resources
cdk.Tags.of(app).add('Project', 'JamiiConnect');
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');