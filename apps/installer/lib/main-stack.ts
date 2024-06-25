import * as apprunner from '@aws-cdk/aws-apprunner-alpha'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import { Alarm, Metric, TreatMissingData, ComparisonOperator, Stats } from 'aws-cdk-lib/aws-cloudwatch'

import { Stack, StackProps, RemovalPolicy, CfnOutput, Duration } from 'aws-cdk-lib'
import { Table, AttributeType, BillingMode, ProjectionType, ITable } from 'aws-cdk-lib/aws-dynamodb'
import { Bucket, BucketAccessControl, IBucket } from 'aws-cdk-lib/aws-s3'
import { HttpApi, HttpMethod, HttpRoute, HttpRouteKey, IHttpApi } from 'aws-cdk-lib/aws-apigatewayv2'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Repository } from 'aws-cdk-lib/aws-ecr'
import { AnyPrincipal, Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { IKeyPair, IVpc, KeyPair, Vpc } from 'aws-cdk-lib/aws-ec2'
import { HttpUrlIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { CfnAutoScalingConfiguration, CfnService } from 'aws-cdk-lib/aws-apprunner'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { Construct } from 'constructs'

import { env, envName, withEnv } from './utils'

interface MainStackOutput {
  vpc: IVpc
  keyPair: IKeyPair

  tableData?: ITable
  tableNotification?: ITable
  tableTimeSeries?: ITable

  bucketLog?: IBucket
  bucketData?: IBucket
  bucketLanding?: IBucket
  bucketAccount?: IBucket
  bucketDocs?: IBucket
  bucketPayment?: IBucket
  bucketSupport?: IBucket

  cloudfrontLanding?: cloudfront.IDistribution
  cloudfrontAccount?: cloudfront.IDistribution
  cloudfrontDocs?: cloudfront.IDistribution
  cloudfrontPayment?: cloudfront.IDistribution
  cloudfrontSupport?: cloudfront.IDistribution

  cloudfrontRequestFunction?: cloudfront.IFunction
  cloudfrontResponseFunction?: cloudfront.IFunction

  httpApi?: HttpApi
  service?: apprunner.Service

  alarmMetricRango?: Metric
  alarmMetricRangoConversion?: Metric
  alarmMetricBitcoin?: Metric
}

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, withEnv(id, '-'), props)

    const output: MainStackOutput = {
      vpc: Vpc.fromLookup(this, withEnv('vpc'), {
        vpcId: env('VPC')
      }),
      keyPair: KeyPair.fromKeyPairName(this, withEnv('keypair'), env('KEY_PAIR_NAME'))
    }

    if (process.env.NODE_ENV !== 'local') {
      this.deployApiGateway(output)
      this.deployFrontend(output)
    }

    this.deployBackendAlarms(output)
    this.deployBackend(output)
    this.deployBackendSettings(output)

    if (process.env.NODE_ENV !== 'local') {
      this.deployFrontendSettings(output)
    }

    this.deployOutputs(output)
  }

  private deployApiGateway(output: MainStackOutput) {
    output.httpApi = new HttpApi(this, withEnv('api'))
  }

  private deployBackend(output: MainStackOutput) {
    this.deployDataBucket(output)
    this.deployDdb(output)

    if (process.env.NODE_ENV !== 'local') {
      this.deployService(output)
    }
  }

  private deployFrontend(output: MainStackOutput) {
    const cloudfrontRequestFunction = new cloudfront.Function(this, withEnv('cloudfront_function_request'), {
      functionName: withEnv('function_request'),
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request
  var uri = request.uri
  var paths = ['assets/', 'img/', '.png', '.ico', '.svg', '.xml', '.webmanifest', '.js', 'robots.txt']
  var isServerPath = (path) => uri.includes(path)

  if (!paths.some(isServerPath)) {
    request.uri = '/'
  }

  return request
}
      `)
    })

    const cloudfrontResponseFunction = new cloudfront.Function(this, withEnv('cloudfront_function_response'), {
      functionName: withEnv('function_response'),
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var response = event.response
  var headers = response.headers
  headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubdomains; preload'}
  headers['content-security-policy'] = { value: "default-src 'none'; object-src 'none'; img-src * data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/; font-src 'self' https://fonts.gstatic.com/; frame-src https://verify.walletconnect.com/ https://verify.walletconnect.org/; connect-src *" }
  headers['x-content-type-options'] = { value: 'nosniff'}
  headers['x-frame-options'] = {value: 'DENY'}
  headers['x-xss-protection'] = {value: '1; mode=block'}
  return response
}
      `)
    })

    const bucketLog = new Bucket(this, withEnv(`s3_${env('BUCKET_NAME_LOG')}`), {
      bucketName: withEnv(env('BUCKET_NAME_LOG'), '-'),
      accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const bucketLanding = this.deployBucket(env('BUCKET_NAME_HOSTING_LANDING'))
    const bucketAccount = this.deployBucket(env('BUCKET_NAME_HOSTING_ACCOUNT'))
    const bucketDocs = this.deployBucket(env('BUCKET_NAME_HOSTING_DOCS'))
    const bucketPayment = this.deployBucket(env('BUCKET_NAME_HOSTING_PAYMENT'))
    const bucketSupport = this.deployBucket(env('BUCKET_NAME_HOSTING_SUPPORT'))

    const cloudfrontLanding = this.deployCloudfront(env('BUCKET_NAME_HOSTING_LANDING'), bucketLanding, bucketLog, cloudfrontRequestFunction, cloudfrontResponseFunction)
    const cloudfrontAccount = this.deployCloudfront(env('BUCKET_NAME_HOSTING_ACCOUNT'), bucketAccount, bucketLog, cloudfrontRequestFunction, cloudfrontResponseFunction)
    const cloudfrontDocs = this.deployCloudfront(env('BUCKET_NAME_HOSTING_DOCS'), bucketDocs, bucketLog, cloudfrontRequestFunction, cloudfrontResponseFunction)
    const cloudfrontPayment = this.deployCloudfront(env('BUCKET_NAME_HOSTING_PAYMENT'), bucketPayment, bucketLog, cloudfrontRequestFunction, cloudfrontResponseFunction)
    const cloudfrontSupport = this.deployCloudfront(env('BUCKET_NAME_HOSTING_SUPPORT'), bucketSupport, bucketLog, cloudfrontRequestFunction, cloudfrontResponseFunction)

    output.cloudfrontRequestFunction = cloudfrontRequestFunction
    output.cloudfrontResponseFunction = cloudfrontResponseFunction

    output.bucketLog = bucketLog
    output.bucketLanding = bucketLanding
    output.bucketAccount = bucketAccount
    output.bucketDocs = bucketDocs
    output.bucketPayment = bucketPayment
    output.bucketSupport = bucketSupport

    output.cloudfrontLanding = cloudfrontLanding
    output.cloudfrontAccount = cloudfrontAccount
    output.cloudfrontDocs = cloudfrontDocs
    output.cloudfrontPayment = cloudfrontPayment
    output.cloudfrontSupport = cloudfrontSupport
  }

  private deployBackendSettings(output: MainStackOutput) {
    if (output.bucketData) {
      new BucketDeployment(this, withEnv(`s3_deployment_${env('BUCKET_NAME_DATA')}`), {
        sources: [
          Source.asset('./data/data-bucket'),
        ],
        destinationBucket: output.bucketData
      })
    }
  }

  private deployBackendAlarms(output: MainStackOutput) {
    const alarmMetricRango = new Metric({
      namespace: envName(),
      metricName: withEnv('rango_errors'),
      statistic: Stats.SUM,
      period: Duration.minutes(1),
    })

    new Alarm(this, withEnv('RangoAlarm'), {
      metric: alarmMetricRango,
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    })

    const alarmMetricRangoConversion = new Metric({
      namespace: envName(),
      metricName: withEnv('rango_conversion_errors'),
      statistic: Stats.SUM,
      period: Duration.minutes(1),
    })

    new Alarm(this, withEnv('RangoConversionAlarm'), {
      metric: alarmMetricRangoConversion,
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    })

    const alarmMetricBitcoin = new Metric({
      namespace: envName(),
      metricName: withEnv('bitcoin_errors'),
      statistic: Stats.SUM,
      period: Duration.minutes(1),
    })

    new Alarm(this, withEnv('BitcoinAlarm'), {
      metric: alarmMetricBitcoin,
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    })

    output.alarmMetricRango = alarmMetricRango
    output.alarmMetricRangoConversion = alarmMetricRangoConversion
    output.alarmMetricBitcoin = alarmMetricBitcoin
  }

  private deployFrontendSettings(output: MainStackOutput) {
    const config = {
      baseUrlApi: output.httpApi?.apiEndpoint,
      baseUrlAccount: `https://${output.cloudfrontAccount?.distributionDomainName}`,
      baseUrlDocs: `https://${output.cloudfrontDocs?.distributionDomainName}`,
      baseUrlPayment: `https://${output.cloudfrontPayment?.distributionDomainName}`,
      baseUrlSupport: `https://${output.cloudfrontSupport?.distributionDomainName}`,
      baseUrlLanding: `https://${output.cloudfrontLanding?.distributionDomainName}`
    }

    const configFile = `.config.${envName()}.json`

    if (output.bucketLanding) {
      new BucketDeployment(this, withEnv(`s3_deployment_${env('BUCKET_NAME_HOSTING_LANDING')}`), {
        sources: [
          Source.asset('../landing/dist'),
          Source.jsonData(configFile, config)
        ],
        destinationBucket: output.bucketLanding
      })
    }

    if (output.bucketAccount) {
      new BucketDeployment(this, withEnv(`s3_deployment_${env('BUCKET_NAME_HOSTING_ACCOUNT')}`), {
        sources: [
          Source.asset('../account/dist'),
          Source.jsonData(configFile, config)
        ],
        destinationBucket: output.bucketAccount
      })
    }

    if (output.bucketDocs) {
      new BucketDeployment(this, withEnv(`s3_deployment_${env('BUCKET_NAME_HOSTING_DOCS')}`), {
        sources: [
          Source.asset('../docs/dist'),
          Source.jsonData(configFile, config)
        ],
        destinationBucket: output.bucketDocs
      })
    }

    if (output.bucketPayment) {
      new BucketDeployment(this, withEnv(`s3_deployment_${env('BUCKET_NAME_HOSTING_PAYMENT')}`), {
        sources: [
          Source.asset('../payment/dist'),
          Source.jsonData(configFile, config)
        ],
        destinationBucket: output.bucketPayment
      })
    }

    if (output.bucketSupport) {
      new BucketDeployment(this, withEnv(`s3_deployment_${env('BUCKET_NAME_HOSTING_SUPPORT')}`), {
        sources: [
          Source.asset('../support/dist'),
          Source.jsonData(configFile, config)
        ],
        destinationBucket: output.bucketSupport
      })
    }
  }

  private deployOutputs(output: MainStackOutput) {
    if (output.httpApi) {
      new CfnOutput(this, withEnv('cloudformation_output_api'), {
        exportName: withEnv('api', '-'),
        value: output.httpApi.apiEndpoint,
        description: 'API URL'
      })
    }

    if (output.tableData) {
      new CfnOutput(this, withEnv('cloudformation_output_table_data'), {
        exportName: withEnv('table-data', '-'),
        value: output.tableData.tableName,
        description: 'Table Data name'
      })
    }

    if (output.tableNotification) {
      new CfnOutput(this, withEnv('cloudformation_output_table_notification'), {
        exportName: withEnv('table-notification', '-'),
        value: output.tableNotification.tableName,
        description: 'Table Notification name'
      })
    }

    if (output.tableTimeSeries) {
      new CfnOutput(this, withEnv('cloudformation_output_table_timeseries'), {
        exportName: withEnv('table-timeseries', '-'),
        value: output.tableTimeSeries.tableName,
        description: 'Table TimeSeries name'
      })
    }

    if (output.bucketLog) {
      new CfnOutput(this, withEnv('cloudformation_output_bucket_log'), {
        exportName: withEnv('bucket-log', '-'),
        value: output.bucketLog.bucketName,
        description: 'Bucket Log name'
      })
    }

    if (output.bucketData) {
      new CfnOutput(this, withEnv('cloudformation_output_bucket_data'), {
        exportName: withEnv('bucket-data', '-'),
        value: output.bucketData.bucketName,
        description: 'Bucket Data name'
      })
    }

    if (output.bucketLanding) {
      new CfnOutput(this, withEnv('cloudformation_output_bucket_landing'), {
        exportName: withEnv('bucket-landing', '-'),
        value: output.bucketLanding.bucketName,
        description: 'Bucket Landing name'
      })
    }

    if (output.bucketAccount) {
      new CfnOutput(this, withEnv('cloudformation_output_bucket_account'), {
        exportName: withEnv('bucket-account', '-'),
        value: output.bucketAccount.bucketName,
        description: 'Bucket Account name'
      })
    }

    if (output.bucketDocs) {
      new CfnOutput(this, withEnv('cloudformation_output_bucket_docs'), {
        exportName: withEnv('bucket-docs', '-'),
        value: output.bucketDocs.bucketName,
        description: 'Bucket Docs name'
      })
    }

    if (output.bucketPayment) {
      new CfnOutput(this, withEnv('cloudformation_output_bucket_payment'), {
        exportName: withEnv('bucket-payment', '-'),
        value: output.bucketPayment.bucketName,
        description: 'Bucket Payment name'
      })
    }

    if (output.cloudfrontLanding) {
      new CfnOutput(this, withEnv('cloudformation_output_cloudfront_landing'), {
        exportName: withEnv('cloudfront-landing', '-'),
        value: output.cloudfrontLanding.distributionDomainName,
        description: 'Cloudfront Landing name'
      })
    }

    if (output.cloudfrontAccount) {
      new CfnOutput(this, withEnv('cloudformation_output_cloudfront_account'), {
        exportName: withEnv('cloudfront-account', '-'),
        value: output.cloudfrontAccount.distributionDomainName,
        description: 'Cloudfront Account name'
      })
    }

    if (output.cloudfrontDocs) {
      new CfnOutput(this, withEnv('cloudformation_output_cloudfront_docs'), {
        exportName: withEnv('cloudfront-docs', '-'),
        value: output.cloudfrontDocs.distributionDomainName,
        description: 'Cloudfront Docs name'
      })
    }

    if (output.cloudfrontPayment) {
      new CfnOutput(this, withEnv('cloudformation_output_cloudfront_payment'), {
        exportName: withEnv('cloudfront-payment', '-'),
        value: output.cloudfrontPayment.distributionDomainName,
        description: 'Cloudfront Payment name'
      })
    }

    if (output.cloudfrontResponseFunction) {
      new CfnOutput(this, withEnv('cloudformation_output_cloudfront_function'), {
        exportName: withEnv('cloudfront-function', '-'),
        value: output.cloudfrontResponseFunction.functionName,
        description: 'Cloudfront function name'
      })
    }
  }

  private deployDataBucket(output: MainStackOutput) {
    const bucketData = this.deployBucket(env('BUCKET_NAME_DATA'))
    output.bucketData = bucketData
  }

  private deployDdb(output: MainStackOutput) {
    const tableData = new Table(this, withEnv(`ddb_${env('TABLE_NAME')}`), {
      tableName: withEnv(env('TABLE_NAME')),
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY
    })

    tableData.addGlobalSecondaryIndex({
      indexName: 'gsi_pk1-gsi_sk1-index',
      partitionKey: { name: 'gsi_pk1', type: AttributeType.STRING },
      sortKey: { name: 'gsi_sk1', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL
    })

    tableData.addGlobalSecondaryIndex({
      indexName: 'gsi_pk2-gsi_sk2-index',
      partitionKey: { name: 'gsi_pk2', type: AttributeType.STRING },
      sortKey: { name: 'gsi_sk2', type: AttributeType.NUMBER },
      projectionType: ProjectionType.ALL
    })

    const tableNotification = new Table(this, withEnv(`ddb_${env('TABLE_NAME_NOTIFICATION')}`), {
      tableName: withEnv(env('TABLE_NAME_NOTIFICATION')),
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.NUMBER },
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const tableTimeSeries = new Table(this, withEnv(`ddb_${env('TABLE_NAME_TIME_SERIES')}`), {
      tableName: withEnv(env('TABLE_NAME_TIME_SERIES')),
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.NUMBER },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl'
    })

    output.tableData = tableData
    output.tableNotification = tableNotification
    output.tableTimeSeries = tableTimeSeries
  }

  private deployService(output: MainStackOutput) {
    const jwtEncryptionKey = new Secret(this, withEnv('secret_jwt_encryption_key'), {
      secretName: withEnv('jwt_encryption_key'),
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ data: env('JWT_ENCRYPTION_KEY'), pwd: '' }),
        generateStringKey: 'pwd'
      }
    })

    const jwtInitVector = new Secret(this, withEnv(`secret_jwt_init_vector`), {
      secretName: withEnv('jwt_init_vector'),
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ data: env('JWT_INIT_VECTOR'), pwd: '' }),
        generateStringKey: 'pwd'
      }
    })

    const emailConfig = new Secret(this, withEnv('secret_email_config'), {
      secretName: withEnv('email_config'),
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ data: env('EMAIL_CONFIG'), pwd: '' }),
        generateStringKey: 'pwd'
      }
    })

    const exchangeRateApiKey = new Secret(this, withEnv('secret_exchangerate_api_key'), {
      secretName: withEnv('exchangerate_api_key'),
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ data: env('EXCHANGERATE_API_KEY'), pwd: '' }),
        generateStringKey: 'pwd'
      }
    })

    const rangoApiKey = new Secret(this, withEnv('secret_rango_api_key'), {
      secretName: withEnv('rango_api_key'),
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ data: env('RANGO_API_KEY'), pwd: '' }),
        generateStringKey: 'pwd'
      }
    })

    const rangoApiKeySwap = new Secret(this, withEnv('secret_rango_api_key_swap'), {
      secretName: withEnv('rango_api_key_swap'),
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ data: env('RANGO_API_KEY_SWAP'), pwd: '' }),
        generateStringKey: 'pwd'
      }
    })

    const bitcoinRpc = new Secret(this, withEnv('secret_bitcoin_rpc'), {
      secretName: withEnv('bitcoin_rpc'),
      generateSecretString: {
        secretStringTemplate: JSON.stringify(
          {
            data: env('BITCOIN_RPC'),
            pwd: ''
          }
        ),
        generateStringKey: 'pwd'
      }
    })

    const bitcoinFeeRpc = new Secret(this, withEnv('secret_bitcoin_fee_rpc'), {
      secretName: withEnv('bitcoin_fee_rpc'),
      generateSecretString: {
        secretStringTemplate: JSON.stringify(
          {
            data: env('BITCOIN_FEE_RPC'),
            pwd: ''
          }
        ),
        generateStringKey: 'pwd'
      }
    })

    const accessRole = new Role(this, withEnv('apprunner_instance_access_role_janedoe'), {
      roleName: withEnv('apprunner_instance_access_role_janedoe'),
      assumedBy: new ServicePrincipal('build.apprunner.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly')
      ]
    })

    const instanceRole = new Role(this, withEnv('apprunner_instance_role_janedoe'), {
      roleName: withEnv('apprunner_instance_role_janedoe'),
      assumedBy: new ServicePrincipal('tasks.apprunner.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')
      ]
    })

    const service = new apprunner.Service(this, withEnv('app_runner_janedoe'), {
      accessRole,
      instanceRole,
      serviceName: withEnv('janedoe'),
      autoDeploymentsEnabled: true,
      cpu: apprunner.Cpu.ONE_VCPU,
      memory: apprunner.Memory.TWO_GB,
      source: apprunner.Source.fromEcr({
        repository: Repository.fromRepositoryName(this, withEnv('repo_janedoe'), env('IMAGE_REPO')),
        imageConfiguration: {
          port: parseInt(env('PORT')),
          environmentVariables: {
            PORT: env('PORT'),
            IS_DEV: env('IS_DEV'),
            APP_NAME: env('APP_NAME'),
            APP_URL: `https://${output.cloudfrontLanding?.distributionDomainName}` ?? '',
            PAYMENT_URL: `https://${output.cloudfrontPayment?.distributionDomainName}` ?? '',
            SUPPORT_URL: `https://${output.cloudfrontSupport?.distributionDomainName}` ?? '',
            PINO_CONFIG: env('PINO_CONFIG'),
            TABLE_NAME: output.tableData?.tableName ?? '',
            TABLE_NAME_TIME_SERIES: output.tableTimeSeries?.tableName ?? '',
            TABLE_NAME_NOTIFICATION: output.tableNotification?.tableName ?? '',
            BUCKET_NAME_DATA: output.bucketData?.bucketName ?? '',
            METRIC_RANGO_NAMESPACE: output.alarmMetricRango?.namespace ?? '',
            METRIC_RANGO_NAME: output.alarmMetricRango?.metricName ?? '',
            METRIC_RANGO_CONVERSION_NAMESPACE: output.alarmMetricRangoConversion?.namespace ?? '',
            METRIC_RANGO_CONVERSION_NAME: output.alarmMetricRangoConversion?.metricName ?? '',
            METRIC_BITCOIN_NAMESPACE: output.alarmMetricBitcoin?.namespace ?? '',
            METRIC_BITCOIN_NAME: output.alarmMetricBitcoin?.metricName ?? ''
          },
          environmentSecrets: {
            EXCHANGERATE_API_KEY: apprunner.Secret.fromSecretsManager(exchangeRateApiKey, 'data'),
            RANGO_API_KEY: apprunner.Secret.fromSecretsManager(rangoApiKey, 'data'),
            RANGO_API_KEY_SWAP: apprunner.Secret.fromSecretsManager(rangoApiKeySwap, 'data'),
            JWT_ENCRYPTION_KEY: apprunner.Secret.fromSecretsManager(jwtEncryptionKey, 'data'),
            JWT_INIT_VECTOR: apprunner.Secret.fromSecretsManager(jwtInitVector, 'data'),
            EMAIL_CONFIG: apprunner.Secret.fromSecretsManager(emailConfig, 'data'),
            BITCOIN_RPC: apprunner.Secret.fromSecretsManager(bitcoinRpc, 'data'),
            BITCOIN_FEE_RPC: apprunner.Secret.fromSecretsManager(bitcoinFeeRpc, 'data')
          }
        }
      })
    })

    const autoScaling = new CfnAutoScalingConfiguration(this, withEnv('auto_scaling_janedoe'), {
      autoScalingConfigurationName: withEnv('janedoe_auto_scaling'),
      minSize: 1,
      maxSize: 1,
      maxConcurrency: 100
    })

    const cfnService = service.node.defaultChild as CfnService
    cfnService.autoScalingConfigurationArn = autoScaling.attrAutoScalingConfigurationArn

    new HttpRoute(this, withEnv('route'), {
      httpApi: output.httpApi as IHttpApi,
      integration: new HttpUrlIntegration(withEnv('integration'), `https://${service.serviceUrl}`, {
        method: HttpMethod.ANY
      }),
      routeKey: HttpRouteKey.DEFAULT
    })

    output.service = service
  }

  private deployBucket(bucketName: string) {
    return new Bucket(this, withEnv(`s3_${bucketName}`), {
      bucketName: withEnv(bucketName, '-'),
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }


  private deployCloudfront(cloudfrontName: string, bucket: IBucket, bucketLogs: Bucket, requestFunc: cloudfront.IFunction, responseFunc: cloudfront.IFunction) {
    const oac = new cloudfront.CfnOriginAccessControl(this, withEnv(`oac_${cloudfrontName}`), {
      originAccessControlConfig: {
        name: withEnv(cloudfrontName),
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
    })

    const distribution = new cloudfront.Distribution(this, withEnv(`cloudfront_${cloudfrontName}`), {
      logBucket: bucketLogs,
      logFilePrefix: cloudfrontName,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(bucket),
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: requestFunc,
          },
          {
            eventType: cloudfront.FunctionEventType.VIEWER_RESPONSE,
            function: responseFunc,
          }
        ]
      }
    })

    const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution
    cfnDistribution.addOverride('Properties.DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', "")
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', oac.getAtt('Id'))

    bucket.addToResourcePolicy(new PolicyStatement({
      principals: [new ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:GetObject'],
      resources: [bucket.arnForObjects('*')],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::${process.env.AWS_ACCOUNT}:distribution/${distribution.distributionId}`
        }
      }
    }))

    bucket.addToResourcePolicy(new PolicyStatement({
      effect: Effect.DENY,
      principals: [new AnyPrincipal()],
      actions: ['s3:*'],
      resources: [
        bucket.bucketArn,
        `${bucket.bucketArn}/*`
      ],
      conditions: {
        Bool: {
          'aws:SecureTransport': 'false'
        }
      }
    }))

    return distribution
  }
}
