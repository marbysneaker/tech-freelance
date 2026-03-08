"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lambda/cognito/post-confirmation.ts
var post_confirmation_exports = {};
__export(post_confirmation_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(post_confirmation_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var import_client_cognito_identity_provider = require("@aws-sdk/client-cognito-identity-provider");
var dynamo = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({}));
var cognito = new import_client_cognito_identity_provider.CognitoIdentityProviderClient({});
var handler = async (event) => {
  const attrs = event.request.userAttributes;
  const role = attrs["custom:role"] ?? "user";
  try {
    await dynamo.send(new import_lib_dynamodb.PutCommand({
      TableName: process.env.USERS_TABLE,
      Item: {
        id: attrs.sub,
        name: attrs.name || attrs.email,
        email: attrs.email,
        role
      },
      ConditionExpression: "attribute_not_exists(id)"
    }));
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      await dynamo.send(new import_lib_dynamodb.UpdateCommand({
        TableName: process.env.USERS_TABLE,
        Key: { id: attrs.sub },
        UpdateExpression: "SET #n = :name, #r = :role",
        ExpressionAttributeNames: { "#n": "name", "#r": "role" },
        ExpressionAttributeValues: { ":name": attrs.name || attrs.email, ":role": role }
      }));
    } else {
      throw err;
    }
  }
  try {
    await cognito.send(new import_client_cognito_identity_provider.AdminAddUserToGroupCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: role
    }));
  } catch {
  }
  return event;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
