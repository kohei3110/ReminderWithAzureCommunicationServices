// @ts-check

const config = {
    endpoint: process.env["COSMOSDB_ENDPOINT"],
    key: process.env["COSMOSDB_KEY"],
    databaseId: "Tasks",
    containerId: "Items",
    partitionKey: { kind: "Hash", paths: ["/category"] }
};
  
module.exports = config;