import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


export class BcnNewslatterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create dynamo
    const emailTable = new cdk.aws_dynamodb.Table(this, "EmailsTable", {
      partitionKey: {name: 'email', type: cdk.aws_dynamodb.AttributeType.STRING},
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY // ONLY TEST
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

    // Create an S3 Bucket static web
    const formWebBucket = new cdk.aws_s3.Bucket(this, 'FormWebBucket', {
      blockPublicAccess: new cdk.aws_s3.BlockPublicAccess({ restrictPublicBuckets: false }),
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // ONLY DEV
      autoDeleteObjects: true // ONLY FOR TEST
    })

    // Deploy Web Register Form
    new cdk.aws_s3_deployment.BucketDeployment(this, 'WebFormDeploy', {
      sources: [cdk.aws_s3_deployment.Source.asset('./web')],
      destinationBucket: formWebBucket
    })

    // Output API URL
    new cdk.CfnOutput(this, 'ApiuRL', {
      value: httpApi.url!
    })

    // Out Form Register Web
    new cdk.CfnOutput(this, 'WebUrl', {
      value: formWebBucket.bucketWebsiteUrl
    })

    // Create SendEmailsLambda
    const sendEmailsLambda = new cdk.aws_lambda.Function(this, "SendEmailsLambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      code: cdk.aws_lambda.Code.fromAsset('lambda'),
      handler: 'sendEmails.handler',
      environment: {
        TABLE_NAME: emailTable.tableName
      }
    })

    // crete Lamnda Send Policy
    sendEmailsLambda.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      actions: ["ses:SendEmail", "ses:SendRawEmail"],
      resources: ["*"]
    }))

    // creat an Event 
    const sendNewslatterEvent = new cdk.aws_events.Rule(this, "NewslatterEvent", {
      schedule: cdk.aws_events.Schedule.expression('rate(2 minutes)')
    })

    // Add Event Target to Send Email Lambda
    sendNewslatterEvent.addTarget(new cdk.aws_events_targets.LambdaFunction(sendEmailsLambda))

  }
}
