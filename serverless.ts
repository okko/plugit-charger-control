import type { AWS } from '@serverless/typescript'

import startCharging from '@functions/start-charging'

const serverlessConfiguration: AWS = {
  service: 'plugit-charger-control',
  resources: {
    Description: 'Plugit Charger Control',
    Resources: {
      StartChargingSchedule: {
        Type: 'AWS::Scheduler::Schedule',
        Properties: {
          Name: 'plugit-start-charging-daily',
          ScheduleExpression: 'cron(3 21 * * ? *)',
          ScheduleExpressionTimezone: 'Europe/Helsinki',
          FlexibleTimeWindow: { Mode: 'OFF' },
          Target: {
            Arn: { 'Fn::GetAtt': ['StartChargingLambdaFunction', 'Arn'] },
            RoleArn: { 'Fn::GetAtt': ['StartChargingSchedulerRole', 'Arn'] },
          },
        },
      },
      StartChargingSchedulerRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { Service: 'scheduler.amazonaws.com' },
                Action: 'sts:AssumeRole',
              },
            ],
          },
          Policies: [
            {
              PolicyName: 'InvokeStartChargingLambda',
              PolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Action: 'lambda:InvokeFunction',
                    Resource: { 'Fn::GetAtt': ['StartChargingLambdaFunction', 'Arn'] },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
  provider: {
    name: 'aws',
    region: 'eu-west-1',
    runtime: 'nodejs20.x',
    memorySize: 256,
    timeout: 30,
    environment: {
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      /**
       * Api key to require
       */
      API_KEY: process.env.API_KEY || '',
      VOICEMONKEY_ACCESS_TOKEN: process.env.VOICEMONKEY_ACCESS_TOKEN || '',
      VOICEMONKEY_SECRET_TOKEN: process.env.VOICEMONKEY_SECRET_TOKEN || '',
      VOICEMONKEY_MONKEY_ID: process.env.VOICEMONKEY_MONKEY_ID || '',
      PLUGIT_CHARGE_POINT_ID: process.env.PLUGIT_CHARGE_POINT_ID || '',
      PLUGIT_CHARGE_BOX_ID: process.env.PLUGIT_CHARGE_BOX_ID || '',
      PLUGIT_CHARGE_BOX_GROUP_ID: process.env.PLUGIT_CHARGE_BOX_GROUP_ID || '',
      PLUGIT_USERNAME: process.env.PLUGIT_USERNAME || '',
      PLUGIT_PASSWORD: process.env.PLUGIT_PASSWORD || '',
    },
  },
  functions: { startCharging },
  package: {
    individually: true,
  },
  build: {
    esbuild: {
      sourcemap: true,
    }
  },
}

module.exports = serverlessConfiguration
