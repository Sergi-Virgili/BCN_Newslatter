import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(dbClient);

export async function handler(event, context) {
  const body = JSON.parse(event.body);
  const email = body.email;

  if (!email) {
    return {
      statusCode: 400,
      body: "Email is requied",
    };
  }

  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
    return {
      statusCode: 400,
      body: "Invalid Email",
    };
  }

  const table = process.env.TABLE_NAME;

  const params = {
    TableName: table,
    Item: { email },
  };

  await docClient.send(new PutCommand(params));

  return {
    statusCode: 200,
    body: `Email: ${email} Registered`,
  };
}
