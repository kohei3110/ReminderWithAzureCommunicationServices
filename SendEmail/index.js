const { EmailClient } = require("@azure/communication-email");

module.exports = async function (context, req) {

    const connectionString = process.env["communicationServicesConnectionString"]
    const client = new EmailClient(connectionString);
    const sender = process.env["emailSender"]
    const emailContent = {
        subject: "【リマインダー】もうすぐレッスンの時間です",
        plainText: "このメールは、レッスンのリマインダーです。",
        html: "<html><head><title>レッスンリマインダー！</title></head><body><h1>レッスンがもうすぐ始まります！</h1><h2>もうすぐ予約したレッスンが始まります。</h2></body></html>",
    };
    const toRecipients = {
        to: req.body.recepients
    };
    
    try {
        const emailMessage = {
            sender: sender,
            content: emailContent,
            recipients: toRecipients,
        };

        const sendResult = await client.send(emailMessage);
    
        if (sendResult && sendResult.messageId) {
            const messageId = sendResult.messageId;
            if (messageId === null) {
                context.log("Message Id not found.");
                return;
            }
    
            context.log("Send email success, MessageId :", sendResult.messageId);
    
            let counter = 0;
            const statusInterval = setInterval(async function () {
                counter++;
                try {
                    const response = await client.getSendStatus(messageId);
                    if (response) {
                        context.log(`Email status for {${messageId}} : [${response.status}]`);
                        if (response.status.toLowerCase() !== "queued" || counter > 12) {
                            clearInterval(statusInterval);
                        }
                    }
                } catch (e) {
                    context.log("Error in checking send mail status: ",e);
                }
            }, 5000);
        } else {
            context.log("Something went wrong when trying to send this email: ", sendResult);
        }
        } catch (e) {
            context.log("################### Exception occoured while sending email #####################", e);
        }

        context.res = {
            body: toRecipients
        }            
}