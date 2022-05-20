import { formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'

import { Handler } from 'aws-lambda'
import * as plugitClient from './plugitClient'
import * as alexaMonkey from './alexaMonkey'

interface RequestEvent {
  apiKey: string
}

const handler: Handler<RequestEvent> = async (event) => {
  if (event.apiKey !== 'hunter42') {
    return {
      statusCode: 403,
      message: '{"error": "Forbidden"}',
    }
  }

  plugitClient.login()
  if (plugitClient.isCableConnected()) {
    plugitClient.startCharging()
  }
  alexaMonkey.announce('The car is charging')
  return formatJSONResponse({
    message: 'Done',
    event,
  })
};

export const main = middyfy(handler);
