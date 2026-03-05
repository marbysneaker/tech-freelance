import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandler = async (event) => {
  const { status, submittedBy, assignedTo } = event.queryStringParameters ?? {};

  let items;

  if (status) {
    // Query by status GSI (e.g. all open tickets for marketplace)
    const result = await client.send(new QueryCommand({
      TableName: process.env.TICKETS_TABLE!,
      IndexName: 'status-index',
      KeyConditionExpression: '#s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': status },
    }));
    items = result.Items;
  } else if (submittedBy) {
    // Query tickets posted by a specific user
    const result = await client.send(new QueryCommand({
      TableName: process.env.TICKETS_TABLE!,
      IndexName: 'submittedBy-index',
      KeyConditionExpression: 'submittedBy = :sub',
      ExpressionAttributeValues: { ':sub': submittedBy },
    }));
    items = result.Items;
  } else if (assignedTo) {
    // Query tickets claimed by a specific tech
    const result = await client.send(new QueryCommand({
      TableName: process.env.TICKETS_TABLE!,
      IndexName: 'assignedTo-index',
      KeyConditionExpression: 'assignedTo = :tech',
      ExpressionAttributeValues: { ':tech': assignedTo },
    }));
    items = result.Items;
  } else {
    // Admin: full scan
    const result = await client.send(new ScanCommand({ TableName: process.env.TICKETS_TABLE! }));
    items = result.Items;
  }

  return { statusCode: 200, body: JSON.stringify(items ?? []) };
};
