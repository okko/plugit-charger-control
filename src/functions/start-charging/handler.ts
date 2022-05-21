import { formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'

import { APIGatewayProxyEventV2, Handler } from 'aws-lambda'
import * as plugitClient from './plugitClient'
import * as alexaMonkey from './alexaMonkey'

const handler: Handler<APIGatewayProxyEventV2> = async (event) => {
  if (event.queryStringParameters?.apiKey !== process.env.API_KEY) {
    return { statusCode: 403, message: JSON.stringify({error: 'Forbidden'}),
    }
  }
  if (event.rawPath !== '/') {
    return { statusCode: 404, message: JSON.stringify({error: 'Not found'}),
    }
  }

  const plugitAccessToken = await plugitClient.login()
  if (await plugitClient.isCableConnected(plugitAccessToken)) {
    plugitClient.startCharging()
  }
  await alexaMonkey.announce('The car is charging, seriously')
  return formatJSONResponse({
    message: 'Done',
    event,
  })
};

export const main = middyfy(handler);
