import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';

export class Database extends Construct {
  public readonly ticketsTable: dynamodb.Table;
  public readonly usersTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.ticketsTable = new dynamodb.Table(this, 'TicketsTable', {
      tableName: 'tech-freelance-tickets',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // change to RETAIN for production
    });

    // GSI to query tickets by status (e.g. list all open tickets for marketplace)
    this.ticketsTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    // GSI to query tickets by submitter (user's work orders)
    this.ticketsTable.addGlobalSecondaryIndex({
      indexName: 'submittedBy-index',
      partitionKey: { name: 'submittedBy', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    // GSI to query tickets by assignee (tech's jobs)
    this.ticketsTable.addGlobalSecondaryIndex({
      indexName: 'assignedTo-index',
      partitionKey: { name: 'assignedTo', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'tech-freelance-users',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // GSI to query users by role (e.g. list all techs)
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'role-index',
      partitionKey: { name: 'role', type: dynamodb.AttributeType.STRING },
    });
  }
}
