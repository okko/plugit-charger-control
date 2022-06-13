import { handlerPath } from '@libs/handler-resolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  url: true,
  layers: [{
    "Ref": "ChromeLambdaLayer",
  }],
  timeout: 300,
  events: [
    // {
    //   'schedule': 'cron(0 19 * 1-2,11-12 ? *)',
    // },
    // {
    //   'schedule': 'cron(0 19 1-26 3 ? *)',
    // },
    // {
    //   'schedule': 'cron(0 18 27-31 3 ? *)',
    // },
    // {
    //   'schedule': 'cron(0 18 * 4-9 ? *)',
    // },
    // {
    //   'schedule': 'cron(0 18 1-29 10 ? *)',
    // },
    // {
    //   'schedule': 'cron(0 19 30-31 10 ? *)',
    // },
    //
    // {
    //   'schedule': 'cron(0 21 * * ? *)',
    // },
    //
    {
       'schedule': {
         rate: ['cron(0 21 * * ? *)'],
         timezone: 'Europe/Helsinki',
       }
    },
  ],
}
