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

// lambda/tickets/update.ts
var update_exports = {};
__export(update_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(update_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({}));
var CORS = { "Access-Control-Allow-Origin": "*" };
var VALID_TRANSITIONS = {
  open: ["assigned"],
  assigned: ["in-progress"],
  "in-progress": ["completed"]
};
var handler = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ message: "Missing ticket id" }) };
  const body = JSON.parse(event.body ?? "{}");
  const { status, assignedTo } = body;
  if (!status) return { statusCode: 400, headers: CORS, body: JSON.stringify({ message: "Missing status" }) };
  const current = await client.send(new import_lib_dynamodb.GetCommand({
    TableName: process.env.TICKETS_TABLE,
    Key: { id }
  }));
  if (!current.Item) return { statusCode: 404, headers: CORS, body: JSON.stringify({ message: "Ticket not found" }) };
  const allowed = VALID_TRANSITIONS[current.Item.status] ?? [];
  if (!allowed.includes(status)) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ message: `Cannot transition from ${current.Item.status} to ${status}` })
    };
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const updateExpr = assignedTo ? "SET #s = :status, assignedTo = :assignedTo, updatedAt = :now" : "SET #s = :status, updatedAt = :now";
  const exprValues = { ":status": status, ":now": now };
  if (assignedTo) exprValues[":assignedTo"] = assignedTo;
  const result = await client.send(new import_lib_dynamodb.UpdateCommand({
    TableName: process.env.TICKETS_TABLE,
    Key: { id },
    UpdateExpression: updateExpr,
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: exprValues,
    ReturnValues: "ALL_NEW"
  }));
  return { statusCode: 200, headers: CORS, body: JSON.stringify(result.Attributes) };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
