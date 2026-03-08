import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Duration } from 'aws-cdk-lib';
import * as path from 'path';

interface ApiProps {
  ticketsTable: dynamodb.Table;
  usersTable: dynamodb.Table;
  userPool: cognito.UserPool;
}

export class Api extends Construct {
  public readonly restApi: apigw.RestApi;

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    const { ticketsTable, usersTable, userPool } = props;

    this.restApi = new apigw.RestApi(this, 'RestApi', {
      restApiName: 'tech-freelance-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool],
    });

    const authOptions: apigw.MethodOptions = {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    };

    const commonEnv = {
      TICKETS_TABLE: ticketsTable.tableName,
      USERS_TABLE: usersTable.tableName,
    };

    // Helper — NodejsFunction bundles + transpiles TypeScript automatically
    const addRoute = (
      resource: apigw.Resource,
      method: string,
      handlerPath: string,
      handler: string,
      tables: dynamodb.Table[],
      readOnly = false,
    ) => {
      const fn = new lambdaNodejs.NodejsFunction(this, `${method}${handlerPath}${handler}Fn`, {
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(10),
        environment: commonEnv,
        entry: path.join(__dirname, '../../lambda', handlerPath, `${handler}.ts`),
        handler: 'handler',
      });
      tables.forEach(t => readOnly ? t.grantReadData(fn) : t.grantReadWriteData(fn));
      resource.addMethod(method, new apigw.LambdaIntegration(fn), authOptions);
      return fn;
    };

    // /tickets
    const tickets = this.restApi.root.addResource('tickets');
    addRoute(tickets, 'GET', 'tickets', 'list', [ticketsTable], true);
    addRoute(tickets, 'POST', 'tickets', 'create', [ticketsTable]);

    // /tickets/{id}
    const ticket = tickets.addResource('{id}');
    addRoute(ticket, 'GET', 'tickets', 'get', [ticketsTable], true);
    addRoute(ticket, 'PATCH', 'tickets', 'update', [ticketsTable]);

    // /users
    const users = this.restApi.root.addResource('users');
    addRoute(users, 'GET', 'users', 'list', [usersTable], true);

    // CORS headers on gateway error responses (4xx and 5xx)
    const corsHeaders = {
      'Access-Control-Allow-Origin': "'*'",
      'Access-Control-Allow-Headers': "'Content-Type,Authorization'",
    };
    this.restApi.addGatewayResponse('Unauthorized', {
      type: apigw.ResponseType.UNAUTHORIZED,
      responseHeaders: corsHeaders,
    });
    this.restApi.addGatewayResponse('AccessDenied', {
      type: apigw.ResponseType.ACCESS_DENIED,
      responseHeaders: corsHeaders,
    });
    this.restApi.addGatewayResponse('Default4xx', {
      type: apigw.ResponseType.DEFAULT_4XX,
      responseHeaders: corsHeaders,
    });
    this.restApi.addGatewayResponse('Default5xx', {
      type: apigw.ResponseType.DEFAULT_5XX,
      responseHeaders: corsHeaders,
    });
  }
}
