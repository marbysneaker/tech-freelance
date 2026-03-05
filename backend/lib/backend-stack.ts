import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Database } from './constructs/database';
import { Auth } from './constructs/auth';
import { Api } from './constructs/api';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const db = new Database(this, 'Database');
    const auth = new Auth(this, 'Auth');
    const api = new Api(this, 'Api', {
      ticketsTable: db.ticketsTable,
      usersTable: db.usersTable,
      userPool: auth.userPool,
    });

    // Outputs — useful when wiring up the frontend later
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.restApi.url,
      description: 'REST API base URL',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: auth.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: auth.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });
  }
}
