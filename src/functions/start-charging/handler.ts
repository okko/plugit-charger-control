import { APIGatewayProxyEventV2, Handler } from 'aws-lambda'
import * as plugitClient from './plugitClient'
import * as alexaMonkey from './alexaMonkey'

const handler: Handler<APIGatewayProxyEventV2> = async (event) => {
  // Use rawPath to detect it's a HTTP request
  if (event.rawPath) {
    if (event.queryStringParameters?.apiKey !== process.env.API_KEY) {
      console.log('Invalid API key')
      console.log(event)
      return { statusCode: 403, body: JSON.stringify({error: 'Forbidden'}) }
    }
    if (event.rawPath !== '/') {
      return { statusCode: 404, body: JSON.stringify({error: 'Not found'}) }
    }
  } else {
    // Assume it's the developer running the Lambda by hand locally or in the AWS Console
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
