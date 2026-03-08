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

// lambda/tickets/list.ts
var list_exports = {};
__export(list_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(list_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({}));
var CORS = { "Access-Control-Allow-Origin": "*" };
var handler = async (event) => {
  const { status, submittedBy, assignedTo } = event.queryStringParameters ?? {};
  let items;
  if (status) {
    const result = await client.send(new import_lib_dynamodb.QueryCommand({
      TableName: process.env.TICKETS_TABLE,
      IndexName: "status-index",
      KeyConditionExpression: "#s = :status",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":status": status }
    }));
    items = result.Items;
  } else if (submittedBy) {
    const result = await client.send(new import_lib_dynamodb.QueryCommand({
      TableName: process.env.TICKETS_TABLE,
      IndexName: "submittedBy-index",
      KeyConditionExpression: "submittedBy = :sub",
      ExpressionAttributeValues: { ":sub": submittedBy }
    }));
    items = result.Items;
  } else if (assignedTo) {
    const result = await client.send(new import_lib_dynamodb.QueryCommand({
      TableName: process.env.TICKETS_TABLE,
      IndexName: "assignedTo-index",
      KeyConditionExpression: "assignedTo = :tech",
      ExpressionAttributeValues: { ":tech": assignedTo }
    }));
    items = result.Items;
  } else {
    const result = await client.send(new import_lib_dynamodb.ScanCommand({ TableName: process.env.TICKETS_TABLE }));
    items = result.Items;
  }
  return { statusCode: 200, headers: CORS, body: JSON.stringify(items ?? []) };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
