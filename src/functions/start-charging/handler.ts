import { APIGatewayProxyEventV2, Handler } from 'aws-lambda'
import * as plugitClient from './plugitClient'
import * as alexaMonkey from './alexaMonkey'

const handler: Handler<APIGatewayProxyEventV2> = async (event) => {
  // rawPath is present on Lambda Function URL requests — require API key for those.
  // Other invocations (EventBridge Scheduler, AWS Console, local dev) skip this check
  // and are trusted since only authorized IAM principals can invoke the function directly.
  if (event.rawPath) {
    if (event.queryStringParameters?.apiKey !== process.env.API_KEY) {
      console.log('Invalid API key')
      console.log(event)
      return { statusCode: 403, body: JSON.stringify({error: 'Forbidden'}) }
    }
    if (event.rawPath !== '/') {
      return { statusCode: 404, body: JSON.stringify({error: 'Not found'}) }
    }
  }

  const sessionToken = await plugitClient.login()
  if (!sessionToken) {
    console.log('Unable to get session token after Plugit login')
    return { statusCode: 500, body: JSON.stringify({error: 'Unable to get session token after Plugit login'}) }
  }
  const plugitStatus = await plugitClient.getStatus(sessionToken)
  if (plugitStatus === 'Available') {
    await alexaMonkey.announce('Not charging the car, the cable is not connected')
  } else if (plugitStatus === 'Preparing') {
    const startResult = await plugitClient.startCharging(sessionToken)
    if (startResult) {
      await alexaMonkey.announce('The car is now charging')
    } else {
      await alexaMonkey.announce('The car charging was not started, something went wrong')
    }
  } else if (plugitStatus === 'SuspendedEVSE') {
    await alexaMonkey.announce('The car charger status is suspended by the charger')
  } else {
    await alexaMonkey.announce('The car charger status is ' + (plugitStatus === 'SuspendedEV' ? 'suspended by the car' : plugitStatus))
  }
  return { statusCode: 200, body: JSON.stringify({ message: 'Done', event }) }
}

export const main = handler
