import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const cognito = new CognitoIdentityProviderClient({});

export const handler = async (event: any) => {
  const attrs = event.request.userAttributes as Record<string, string>;
  const role = (attrs['custom:role'] ?? 'user') as 'user' | 'admin' | 'tech';

  // Create or update DynamoDB user record (use Cognito sub as the user id)
  try {
    await dynamo.send(new PutCommand({
      TableName: process.env.USERS_TABLE!,
      Item: {
        id: attrs.sub,
        name: attrs.name || attrs.email,
        email: attrs.email,
        role,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    }));
  } catch (err: any) {
    // ConditionalCheckFailedException means user already exists — update name/role
    if (err.name === 'ConditionalCheckFailedException') {
      await dynamo.send(new UpdateCommand({
        TableName: process.env.USERS_TABLE!,
        Key: { id: attrs.sub },
        UpdateExpression: 'SET #n = :name, #r = :role',
        ExpressionAttributeNames: { '#n': 'name', '#r': 'role' },
        ExpressionAttributeValues: { ':name': attrs.name || attrs.email, ':role': role },
      }));
    } else {
      throw err;
    }
  }

  // Add user to the correct Cognito group
  try {
    await cognito.send(new AdminAddUserToGroupCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: role,
    }));
  } catch {
    // Non-fatal: user still confirmed, group assignment best-effort
  }

  return event;
};
