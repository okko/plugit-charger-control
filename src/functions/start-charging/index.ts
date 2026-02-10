import { handlerPath } from '@libs/handler-resolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  url: true,
  // layers: [{
  //   "Ref": "ChromeLambdaLayer",
  // }],
  timeout: 300,
  events: [
    {
      schedule: {
        rate: ['cron(0 21 * * ? *)'],
        timezone: 'Europe/Helsinki',
      },
    },
  ],
}
