import type { AWS } from '@serverless/typescript'

import startCharging from '@functions/start-charging'

const serverlessConfiguration: AWS = {
  service: 'plugit-charger-control',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  resources: {
    Description: 'Plugit Charger Control',
  },
  provider: {
    name: 'aws',
    region: 'eu-west-1',
    runtime: 'nodejs16.x',
    memorySize: 1600,
    stage: 'dev',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
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
      PLUGIT_CHARGE_BOX_NUMBER: process.env.PLUGIT_CHARGE_BOX_NUMBER || '',
      PLUGIT_USERNAME: process.env.PLUGIT_USERNAME || '',
      PLUGIT_PASSWORD: process.env.PLUGIT_PASSWORD || '',
    },
  },
  functions: { startCharging },
  package: { individually: true, },
  custom: {
    esbuild: {
      external: ['chrome-aws-lambda', '@sparticuz/chrome-aws-lambda'],
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      packager: 'yarn',
    },
  },
  layers: {
    chrome: {
      package: {
        artifact: 'chrome_aws_lambda.zip',
      },
    },
  },
}

module.exports = serverlessConfiguration
