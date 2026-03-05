import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body ?? '{}');
  const { title, description, category, location, submittedBy } = body;

  if (!title || !description || !category || !location || !submittedBy) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Missing required fields' }) };
  }

  const now = new Date().toISOString();
  const ticket = {
    id: randomUUID(),
    title,
    description,
    category,
    location,
    status: 'open',
    submittedBy,
    createdAt: now,
    updatedAt: now,
  };

  await client.send(new PutCommand({
    TableName: process.env.TICKETS_TABLE!,
    Item: ticket,
  }));

  return { statusCode: 201, body: JSON.stringify(ticket) };
};
