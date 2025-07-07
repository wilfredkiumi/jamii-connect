import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface StorageConstructProps {
  environment: string;
}

export class StorageConstruct extends Construct {
  public readonly filesBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: StorageConstructProps) {
    super(scope, id);

    const { environment } = props;

    // S3 Bucket for file uploads (images, documents, etc.)
    this.filesBucket = new s3.Bucket(this, 'FilesBucket', {
      bucketName: `jamii-connect-files-${environment}-${cdk.Stack.of(this).account}`,
      versioned: environment === 'prod',
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
      lifecycleRules: [
        {
          id: 'DeleteIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
        {
          id: 'TransitionToIA',
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: [
            'http://localhost:3000',
            'https://*.jamiiconnect.com',
          ],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
    });

    // CloudFront Origin Access Control
    const oac = new cloudfront.OriginAccessControl(this, 'OAC', {
      originAccessControlName: `jamii-connect-oac-${environment}`,
      description: `OAC for Jamii Connect files bucket - ${environment}`,
      originAccessControlOriginType: cloudfront.OriginAccessControlOriginType.S3,
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    });

    // CloudFront Distribution for S3 bucket
    this.distribution = new cloudfront.Distribution(this, 'FilesDistribution', {
      comment: `Jamii Connect Files CDN - ${environment}`,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.filesBucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
      },
      additionalBehaviors: {
        '/public/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.filesBucket, {
            originAccessControl: oac,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        },
        '/protected/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.filesBucket, {
            originAccessControl: oac,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        },
        '/private/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.filesBucket, {
            originAccessControl: oac,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        },
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enabled: true,
    });

    // S3 Bucket Policy for CloudFront OAC
    this.filesBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [`${this.filesBucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${this.distribution.distributionId}`,
          },
        },
      })
    );

    // Create folder structure in S3 bucket
    new s3.BucketDeployment(this, 'BucketDeployment', {
      sources: [
        s3.Source.data(
          'public/.keep',
          'This folder contains public files accessible to everyone'
        ),
        s3.Source.data(
          'protected/.keep',
          'This folder contains protected files accessible to authenticated users'
        ),
        s3.Source.data(
          'private/.keep',
          'This folder contains private files accessible only to the owner'
        ),
      ],
      destinationBucket: this.filesBucket,
    });

    // Output CloudFront domain name
    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name for files',
      exportName: `${cdk.Stack.of(this).stackName}-CloudFrontDomain`,
    });

    // Tags
    cdk.Tags.of(this.filesBucket).add('Application', 'JamiiConnect');
    cdk.Tags.of(this.filesBucket).add('Environment', environment);
    cdk.Tags.of(this.distribution).add('Application', 'JamiiConnect');
    cdk.Tags.of(this.distribution).add('Environment', environment);
  }
}