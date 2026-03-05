import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const VALID_TRANSITIONS: Record<string, string[]> = {
  open: ['assigned'],
  assigned: ['in-progress'],
  'in-progress': ['completed'],
};

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ message: 'Missing ticket id' }) };

  const body = JSON.parse(event.body ?? '{}');
  const { status, assignedTo } = body;

  if (!status) return { statusCode: 400, body: JSON.stringify({ message: 'Missing status' }) };

  const current = await client.send(new GetCommand({
    TableName: process.env.TICKETS_TABLE!,
    Key: { id },
  }));

  if (!current.Item) return { statusCode: 404, body: JSON.stringify({ message: 'Ticket not found' }) };

  const allowed = VALID_TRANSITIONS[current.Item.status] ?? [];
  if (!allowed.includes(status)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `Cannot transition from ${current.Item.status} to ${status}` }),
    };
  }

  const now = new Date().toISOString();
  const updateExpr = assignedTo
    ? 'SET #s = :status, assignedTo = :assignedTo, updatedAt = :now'
    : 'SET #s = :status, updatedAt = :now';

  const exprValues: Record<string, string> = { ':status': status, ':now': now };
  if (assignedTo) exprValues[':assignedTo'] = assignedTo;

  const result = await client.send(new UpdateCommand({
    TableName: process.env.TICKETS_TABLE!,
    Key: { id },
    UpdateExpression: updateExpr,
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: exprValues,
    ReturnValues: 'ALL_NEW',
  }));

  return { statusCode: 200, body: JSON.stringify(result.Attributes) };
};
