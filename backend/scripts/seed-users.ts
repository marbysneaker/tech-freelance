/**
 * Seed test users into Cognito + DynamoDB.
 * Run from the backend/ directory:
 *   npx ts-node --prefer-ts-exts scripts/seed-users.ts
 *
 * Requires AWS credentials with Cognito + DynamoDB access.
 */

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const USER_POOL_ID = 'us-west-2_uzjnUduXW';
const USERS_TABLE = 'tech-freelance-users';
const REGION = 'us-west-2';

const cognito = new CognitoIdentityProviderClient({ region: REGION });
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'tech';
}

const SEED_USERS: SeedUser[] = [
  { name: 'John Customer', email: 'john@techfreelance.test', password: 'Test1234', role: 'user' },
  { name: 'Sarah Admin',   email: 'sarah@techfreelance.test', password: 'Test1234', role: 'admin' },
  { name: 'Mike Tech',     email: 'mike@techfreelance.test', password: 'Test1234', role: 'tech' },
  { name: 'Lisa Tech',     email: 'lisa@techfreelance.test', password: 'Test1234', role: 'tech' },
];

async function seedUser(u: SeedUser) {
  const id = randomUUID();

  // 1. Create Cognito user (suppress welcome email)
  await cognito.send(new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: u.email,
    MessageAction: 'SUPPRESS',
    TemporaryPassword: u.password,
    UserAttributes: [
      { Name: 'email', Value: u.email },
      { Name: 'email_verified', Value: 'true' },
      { Name: 'name', Value: u.name },
      { Name: 'custom:role', Value: u.role },
    ],
  }));

  // 2. Set permanent password (skips FORCE_CHANGE_PASSWORD state)
  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: USER_POOL_ID,
    Username: u.email,
    Password: u.password,
    Permanent: true,
  }));

  // 3. Add to role group (used in JWT cognito:groups claim)
  await cognito.send(new AdminAddUserToGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: u.email,
    GroupName: u.role,
  }));

  // 4. Write user record to DynamoDB
  await dynamo.send(new PutCommand({
    TableName: USERS_TABLE,
    Item: { id, name: u.name, email: u.email, role: u.role },
  }));

  console.log(`✓ ${u.name} (${u.role}) — ${u.email}`);
}

async function main() {
  console.log('Seeding users...\n');
  for (const u of SEED_USERS) {
    try {
      await seedUser(u);
    } catch (err: any) {
      if (err.name === 'UsernameExistsException') {
        console.log(`- ${u.email} already exists, skipping`);
      } else {
        throw err;
      }
    }
  }
  console.log('\nDone! Login credentials:');
  SEED_USERS.forEach(u => console.log(`  ${u.email}  /  ${u.password}  (${u.role})`));
}

main().catch(console.error);
