const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config/config");
const axios = require("axios").default;

/**
 * 毎日午前 9 時 30 分に、未完了のタスクをメールでリマインドする関数
 * @param {context} context バインディング データの送受信、ログ記録、ランタイムとの通信に使用される `context` オブジェクト。
 */
module.exports = async function (context) {
    const { endpoint, key, databaseId, containerId } = config;
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const querySpec = {
        query: "SELECT * from c WHERE c.isComplete = false"
    };
        
    try {
        context.log(`Querying container: Items`);

        const { resources: items } = await container.items
            .query(querySpec)
            .fetchAll();
            
        items.forEach(item => {
            axios.post(process.env["SENDER_API_ENDPOINT"] + process.env["SENDER_API_PATH"], {
                "recepients": item.assignees,
                "title": item.name
            })
        });
    } catch (err) {
        context.log(err.message);
    }    
}