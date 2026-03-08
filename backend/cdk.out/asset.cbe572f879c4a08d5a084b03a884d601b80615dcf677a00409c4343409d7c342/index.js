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

// lambda/tickets/create.ts
var create_exports = {};
__export(create_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(create_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var import_crypto = require("crypto");
var client = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({}));
var CORS = { "Access-Control-Allow-Origin": "*" };
var handler = async (event) => {
  const body = JSON.parse(event.body ?? "{}");
  const { title, description, category, location, submittedBy } = body;
  if (!title || !description || !category || !location || !submittedBy) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ message: "Missing required fields" }) };
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const ticket = {
    id: (0, import_crypto.randomUUID)(),
    title,
    description,
    category,
    location,
    status: "open",
    submittedBy,
    createdAt: now,
    updatedAt: now
  };
  await client.send(new import_lib_dynamodb.PutCommand({
    TableName: process.env.TICKETS_TABLE,
    Item: ticket
  }));
  return { statusCode: 201, headers: CORS, body: JSON.stringify(ticket) };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
