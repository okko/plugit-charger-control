import { formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'

import { APIGatewayProxyEventV2, Handler } from 'aws-lambda'
import * as plugitClient from './plugitClient'
import * as alexaMonkey from './alexaMonkey'

const handler: Handler<APIGatewayProxyEventV2> = async (event) => {
  // Use rawPath to detect it's a HTTP request
  if (event.rawPath) {
    if (event.queryStringParameters?.apiKey !== process.env.API_KEY) {
      console.log('Invalid API key')
      console.log(event)
      return { statusCode: 403, message: JSON.stringify({error: 'Forbidden'}), }
    }  
    if (event.rawPath !== '/') {
      return { statusCode: 404, message: JSON.stringify({error: 'Not found'}), }  
    }
  } else {
    // Assume it's the developer running the Lambda by hand locally or in the AWS Console
  }

  const {page, browser } = await plugitClient.login()
  if (!page) {
    console.log('Unable to get page after Plugit login')
    return { statusCode: 500, message: JSON.stringify({error: 'Unable to get page after Plugit login'}), }
  }
  const plugitStatus = await plugitClient.getStatus(page)
  if (plugitStatus === 'Available') {
    await alexaMonkey.announce('Not charging the car, the cable is not connected')
  } else if (plugitStatus === 'Preparing') {
    const startResult = await plugitClient.startCharging(page)
    if (startResult) {
      await alexaMonkey.announce('The car is now charging')
    } else {
      await alexaMonkey.announce('The car charging was not started, something went wrong')
    }
  } else if (plugitStatus === 'SuspendedEVSE') {
    const startResult = await plugitClient.startCharging(page)
    if (startResult) {
      await alexaMonkey.announce('The charging was suspended, the car is now charging')
    } else {
      await alexaMonkey.announce('The charging was suspended and something went wrong when starting the charging')
    }
  } else {    
    await alexaMonkey.announce('The car charger status is ' + (plugitStatus === 'SuspendedEV' ? 'suspended by the car' : plugitStatus))
  }
  // await page.close()
  // await browser.close()
  return formatJSONResponse({
    message: 'Done',
    event,
  })
}

export const main = middyfy(handler)
