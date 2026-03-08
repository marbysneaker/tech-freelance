import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CORS = { 'Access-Control-Allow-Origin': '*' };

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ message: 'Missing ticket id' }) };

  const result = await client.send(new GetCommand({
    TableName: process.env.TICKETS_TABLE!,
    Key: { id },
  }));

  if (!result.Item) return { statusCode: 404, headers: CORS, body: JSON.stringify({ message: 'Ticket not found' }) };

  return { statusCode: 200, headers: CORS, body: JSON.stringify(result.Item) };
};
