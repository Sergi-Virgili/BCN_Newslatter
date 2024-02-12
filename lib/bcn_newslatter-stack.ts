import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


export class BcnNewslatterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create dynamo
    const emailTable = new cdk.aws_dynamodb.Table(this, "EmailsTable", {
      partitionKey: {name: 'email', type: cdk.aws_dynamodb.AttributeType.STRING},
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })
    // create lambda
    const registerEmailLambda = new cdk.aws_lambda.Function(this, "RegisterEmailLambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      code: cdk.aws_lambda.Code.fromAsset('lambda'),
      handler: 'registerEmail.handler',
      environment: {
        TABLE_NAME: emailTable.tableName
      }
    })
    // create API Http
    const httpApi = new cdk.aws_apigatewayv2.HttpApi(this, "RegisterEmailApi", {
      corsPreflight: {
        allowHeaders: ['Content-Type'],
        allowMethods: [cdk.aws_apigatewayv2.CorsHttpMethod.POST],
        allowOrigins: ['*']
      }
    })
    // ADD Route to API
    httpApi.addRoutes({
      path: '/register',
      methods: [cdk.aws_apigatewayv2.HttpMethod.POST],
      integration: new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration('LambdaIntegration', registerEmailLambda)
    })

    // Grant lambda to write dynamoTable
    emailTable.grantReadWriteData(registerEmailLambda)
  }
}
