import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as path from 'path';

interface AuthProps {
  usersTable: dynamodb.Table;
}

export class Auth extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id);

    const { usersTable } = props;

    // Post-confirmation trigger: writes new user into DynamoDB and assigns group
    const postConfirmFn = new lambdaNodejs.NodejsFunction(this, 'PostConfirmFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      environment: { USERS_TABLE: usersTable.tableName },
      entry: path.join(__dirname, '../../lambda/cognito/post-confirmation.ts'),
      handler: 'handler',
    });

    usersTable.grantReadWriteData(postConfirmFn);

    // Allow the Lambda to add users to Cognito groups
    postConfirmFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:AdminAddUserToGroup'],
      resources: ['*'],
    }));

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'tech-freelance-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        fullname: { required: true, mutable: true },
      },
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      lambdaTriggers: {
        postConfirmation: postConfirmFn,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Groups map to roles
    new cognito.CfnUserPoolGroup(this, 'UserGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'user',
      description: 'Service companies that post work orders',
    });

    new cognito.CfnUserPoolGroup(this, 'TechGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'tech',
      description: 'Technicians that claim and complete work orders',
    });

    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admin',
      description: 'Admins with full oversight',
    });

    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: 'tech-freelance-web',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
    });
  }
}
