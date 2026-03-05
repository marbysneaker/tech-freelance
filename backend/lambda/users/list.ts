import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandler = async (event) => {
  const { role } = event.queryStringParameters ?? {};

  let items;

  if (role) {
    const result = await client.send(new QueryCommand({
      TableName: process.env.USERS_TABLE!,
      IndexName: 'role-index',
      KeyConditionExpression: '#r = :role',
      ExpressionAttributeNames: { '#r': 'role' },
      ExpressionAttributeValues: { ':role': role },
    }));
    items = result.Items;
  } else {
    const result = await client.send(new ScanCommand({ TableName: process.env.USERS_TABLE! }));
    items = result.Items;
  }

  return { statusCode: 200, body: JSON.stringify(items ?? []) };
};
