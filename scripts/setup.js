'use strict';
const db = require('@arangodb').db;
const collectionName = 'myFoxxCollection';

if (!db._collection(collectionName)) {
  db._createDocumentCollection(collectionName);
}

const users = module.context.collectionName("users");
if (!db._collection(users)) {
  db._createDocumentCollection(users);
}
const sessions = module.context.collectionName("sessions");
if (!db._collection(sessions)) {
  db._createDocumentCollection(sessions);
}
module.context.collection("users").ensureIndex({
  type: "hash",
  unique: true,
  fields: ["username"]
});
