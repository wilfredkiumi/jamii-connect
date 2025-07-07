import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface FrontendConstructProps {
  environment: string;
  domainName: string;
  certificateArn: string;
  api: apigateway.RestApi;
}

export class FrontendConstruct extends Construct {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FrontendConstructProps) {
    super(scope, id);

    const { environment, domainName, certificateArn, api } = props;

    // S3 Bucket for hosting the Next.js static files
    this.bucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `jamii-connect-frontend-${environment}-${cdk.Stack.of(this).account}`,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Import the SSL certificate
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'Certificate',
      certificateArn
    );

    // Origin Access Control
    const oac = new cloudfront.OriginAccessControl(this, 'FrontendOAC', {
      originAccessControlName: `jamii-connect-frontend-oac-${environment}`,
      description: `OAC for Jamii Connect frontend - ${environment}`,
      originAccessControlOriginType: cloudfront.OriginAccessControlOriginType.S3,
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    });

    // CloudFront Function for URL rewriting (SPA support)
    const urlRewriteFunction = new cloudfront.Function(this, 'UrlRewriteFunction', {
      functionName: `jamii-connect-url-rewrite-${environment}`,
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var uri = request.uri;
          
          // Check if the URI is requesting a file (has an extension)
          if (uri.includes('.')) {
            return request;
          }
          
          // Check if it's an API request
          if (uri.startsWith('/api/')) {
            return request;
          }
          
          // For all other requests (SPA routes), serve index.html
          request.uri = '/index.html';
          return request;
        }
      `),
    });

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      domainNames: [domainName],
      certificate,
      comment: `Jamii Connect Frontend - ${environment}`,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          {
            function: urlRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
        '/_next/static/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
            originAccessControl: oac,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: new cloudfront.CachePolicy(this, 'StaticAssetsCachePolicy', {
            cachePolicyName: `jamii-connect-static-cache-${environment}`,
            defaultTtl: cdk.Duration.days(30),
            maxTtl: cdk.Duration.days(365),
            minTtl: cdk.Duration.seconds(0),
            headerBehavior: cloudfront.CacheHeaderBehavior.none(),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
            cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          }),
        },
        '/static/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
            originAccessControl: oac,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: new cloudfront.CachePolicy(this, 'PublicAssetsCachePolicy', {
            cachePolicyName: `jamii-connect-public-cache-${environment}`,
            defaultTtl: cdk.Duration.days(7),
            maxTtl: cdk.Duration.days(365),
            minTtl: cdk.Duration.seconds(0),
            headerBehavior: cloudfront.CacheHeaderBehavior.none(),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
            cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          }),
        },
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enabled: true,
    });

    // Grant CloudFront access to S3 bucket
    this.bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [new cdk.aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [`${this.bucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${this.distribution.distributionId}`,
          },
        },
      })
    );

    // Route 53 Record (if hosted zone exists)
    try {
      const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: domainName.split('.').slice(-2).join('.'), // Get root domain
      });

      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        recordName: domainName,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(this.distribution)
        ),
      });
    } catch (error) {
      // Hosted zone not found, skip creating DNS record
      console.warn(`Hosted zone not found for ${domainName}, skipping DNS record creation`);
    }

    // Outputs
    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${domainName}`,
      description: 'Frontend URL',
      exportName: `${cdk.Stack.of(this).stackName}-FrontendUrl`,
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: `${cdk.Stack.of(this).stackName}-CloudFrontDistributionId`,
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.bucket.bucketName,
      description: 'Frontend S3 Bucket Name',
      exportName: `${cdk.Stack.of(this).stackName}-FrontendBucketName`,
    });

    // Tags
    cdk.Tags.of(this.bucket).add('Application', 'JamiiConnect');
    cdk.Tags.of(this.bucket).add('Environment', environment);
    cdk.Tags.of(this.distribution).add('Application', 'JamiiConnect');
    cdk.Tags.of(this.distribution).add('Environment', environment);
  }
}