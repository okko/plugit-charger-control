import got from 'got'
import chromium from '@sparticuz/chrome-aws-lambda'

const startTransaction = 'https://app.plugitcloud.com/backend/charge-points/' + process.env.PLUGIT_CHARGE_POINT_ID + '/charge-boxes/' + process.env.PLUGIT_CHARGE_BOX_ID + '/remote-start-transaction'
const chargeboxInfo =    'https://app.plugitcloud.com/backend/charge-points/' + process.env.PLUGIT_CHARGE_POINT_ID + '/charge-boxes/' + process.env.PLUGIT_CHARGE_BOX_ID

// Take the /authorize URL and replace "response_type=code&" with "response_type=token" in it
const plugitLogin = 'https://login.plugitcloud.com/authorize?response_type=token&client_id=7QgIcJZwbxHRLfY0wQk188mWAPWbzwEp&redirect_uri=https://app.plugitcloud.com/backend/login/auth0/callback&scope=email%20openid%20profile%20offline_access%20&audience=https://capi.plugitcloud.com&state=d32b07545e38d1f329da8d8a18d9fa9e&ui_locales=en&environment=plugit'
export async function login() {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })

  const page = await browser.newPage()
  page.goto(plugitLogin)
  await page.waitForSelector('input[name="email"]', { visible: true })
  await page.focus('input[name="email"]')
  await page.keyboard.type(process.env.PLUGIT_USERNAME || '')
  await page.focus('input[name="password"]')
  await page.keyboard.type(process.env.PLUGIT_PASSWORD || '')

  // Prevent https://app.plugitcloud.com/ from evaluating the return URL hash so that we can capture access_token from it
  await page.setRequestInterception(true);
  page.on('request', interceptedRequest => {
    if (interceptedRequest.url().endsWith('.js'))
      interceptedRequest.abort();
    else
      interceptedRequest.continue();
    }
  );

  await page.click('button[type="submit"][aria-label="Log in"]')
  await page.waitForNavigation({waitUntil: 'networkidle2'})

  // Bridge function to get data from the browser to us
  const params = await page.evaluate(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    return {
        accessToken: hashParams.get('access_token'),
      };
    })
  await browser.close()
  return params.accessToken
}

export async function getStatus(accessToken: string): Promise<'Unavailable' | 'Available' | 'Preparing' | 'Charging' | 'SuspendedEV' | 'SuspendedEVSE' | 'Finishing' | 'ERROR'> {
  console.log('Access token: ' + accessToken)
  console.error(chargeboxInfo)
  const result = await got(chargeboxInfo, {
    headers: {
        'authorization': 'Bearer ' + accessToken,
        'accept': 'application/json, text/plain, */*',
    },
    hooks: {
      beforeRequest: [function(options) {
          console.log(options);
      }]
    },
  })
  const statusCode = result.statusCode
  if (statusCode != 200) {
    console.error('Error in plugitClient:isCableconnected, statusCode != 200')
    console.error(result)
    return 'ERROR'
  }
  const body = JSON.parse(result.body)
  console.log(body)
  return body.chargeBoxes?.[0]?.status
}

export async function startCharging(accessToken: string) {
  const headers = {
    'authorization': 'Bearer ' + accessToken,
    'accept': 'application/json, text/plain, */*',
  }
  const result = await got.post(startTransaction, {
    headers,
    json: {},
    hooks: {
      beforeRequest: [function(options) {
          console.log(options);
      }]
    },
  })
  const statusCode = result.statusCode
  if (statusCode != 200) {
    console.error('Error in plugitClient:startCharging, statusCode != 200')
    console.error(result)
    return false
  }
  const body = JSON.parse(result.body)
  console.log('plugitClient:startCharging request got 200')
  console.log(body)
  if (body.status === 'Accepted') {
    return true
  } else {
    return false
  }
}
