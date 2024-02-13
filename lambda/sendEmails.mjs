import { SES, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SES({ region: "eu-west-1" });

export async function handler() {
  // EMAIL DE DYNAMO

  const params = {
    Destination: {
      ToAddresses: ["your@email.com"],
    },
    Message: {
      Body: {
        Text: { Data: "Hello from AWS SES! AWS Restar BCN eiiii" },
      },
      Subject: { Data: "Eiii tu newslatter Email" },
    },
    Source: "svirgilif@gmail.com", // verificada en SES
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log("Email Sended");
  } catch (error) {
    console.log(error);
  }
}
