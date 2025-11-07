import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DatabaseConstructProps {
  environment: string;
}

export interface DatabaseTables {
  users: dynamodb.Table;
  posts: dynamodb.Table;
  jobs: dynamodb.Table;
  events: dynamodb.Table;
  services: dynamodb.Table;
  connections: dynamodb.Table;
}

export class DatabaseConstruct extends Construct {
  public readonly tables: DatabaseTables;

  constructor(scope: Construct, id: string, props: DatabaseConstructProps) {
    super(scope, id);

    const { environment } = props;

    // Common table configuration
    const removalPolicy = environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;
    const pointInTimeRecovery = environment === 'prod' ? true : false;

    // Users Table
    this.tables = {} as DatabaseTables;
    
    this.tables.users = new dynamodb.Table(this, 'UsersTable', {
      tableName: `JamiiConnect-Users-${environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy,
      pointInTimeRecovery,
    });

    this.tables.users.addGlobalSecondaryIndex({
      indexName: 'ByTimestamp',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.users.addGlobalSecondaryIndex({
      indexName: 'ByLocation',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
    });

    // Posts Table
    this.tables.posts = new dynamodb.Table(this, 'PostsTable', {
      tableName: `JamiiConnect-Posts-${environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy,
      pointInTimeRecovery,
    });

    this.tables.posts.addGlobalSecondaryIndex({
      indexName: 'ByTimestamp',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.posts.addGlobalSecondaryIndex({
      indexName: 'ByUser',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.posts.addGlobalSecondaryIndex({
      indexName: 'ByCategory',
      partitionKey: { name: 'GSI3PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI3SK', type: dynamodb.AttributeType.STRING },
    });

    // Jobs Table
    this.tables.jobs = new dynamodb.Table(this, 'JobsTable', {
      tableName: `JamiiConnect-Jobs-${environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy,
      pointInTimeRecovery,
    });

    this.tables.jobs.addGlobalSecondaryIndex({
      indexName: 'ByStatus',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.jobs.addGlobalSecondaryIndex({
      indexName: 'ByLocation',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.jobs.addGlobalSecondaryIndex({
      indexName: 'ByCompany',
      partitionKey: { name: 'GSI3PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI3SK', type: dynamodb.AttributeType.STRING },
    });

    // Events Table
    this.tables.events = new dynamodb.Table(this, 'EventsTable', {
      tableName: `JamiiConnect-Events-${environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy,
      pointInTimeRecovery,
    });

    this.tables.events.addGlobalSecondaryIndex({
      indexName: 'ByStatus',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.events.addGlobalSecondaryIndex({
      indexName: 'ByCategory',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.events.addGlobalSecondaryIndex({
      indexName: 'ByDate',
      partitionKey: { name: 'GSI3PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI3SK', type: dynamodb.AttributeType.STRING },
    });

    // Services Table
    this.tables.services = new dynamodb.Table(this, 'ServicesTable', {
      tableName: `JamiiConnect-Services-${environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy,
      pointInTimeRecovery,
    });

    this.tables.services.addGlobalSecondaryIndex({
      indexName: 'ByCategory',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.services.addGlobalSecondaryIndex({
      indexName: 'ByLocation',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.services.addGlobalSecondaryIndex({
      indexName: 'ByProvider',
      partitionKey: { name: 'GSI3PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI3SK', type: dynamodb.AttributeType.STRING },
    });

    // Connections Table
    this.tables.connections = new dynamodb.Table(this, 'ConnectionsTable', {
      tableName: `JamiiConnect-Connections-${environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy,
      pointInTimeRecovery,
    });

    this.tables.connections.addGlobalSecondaryIndex({
      indexName: 'ByConnectedUser',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    this.tables.connections.addGlobalSecondaryIndex({
      indexName: 'ByStatus',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
    });

    // Add tags to all tables
    Object.values(this.tables).forEach((table) => {
      cdk.Tags.of(table).add('Application', 'JamiiConnect');
      cdk.Tags.of(table).add('Environment', environment);
    });
  }
}