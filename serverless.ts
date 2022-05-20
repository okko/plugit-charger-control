import type { AWS } from '@serverless/typescript';

import startCharging from '@functions/start-charging';

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
    stage: 'dev',
    profile: 'okko',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  functions: { startCharging },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
