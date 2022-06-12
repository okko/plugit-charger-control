import got from 'got'
import chromium from '@sparticuz/chrome-aws-lambda'

const startTransaction = 'https://plugitcloud.com/api/charge-points/' + process.env.PLUGIT_CHARGE_POINT_ID + '/charge-boxes/' + process.env.PLUGIT_CHARGE_BOX_ID + '/remote-start-transaction'
const chargeboxDashboard = 'https://plugitcloud.com/api/charge-boxes/' + process.env.PLUGIT_CHARGE_BOX_NUMBER + '/dashboard'
const plugitLogin = 'https://login.plugitcloud.com/authorize?client_id=k42exu3BFDixYFjROWlg6ycOigrJXHb7&protocol=oauth2&scope=openid&response_type=token&redirect_uri=https%3A%2F%2Fplugitcloud.com%2Fdashboard&audience=https%3A%2F%2Fcapi.plugitcloud.com'

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

  // Prevent https://plugitcloud.com/dashboard from evaluating the return URL hash so that we can capture access_token from it
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
  const result = await got(chargeboxDashboard, {
    headers: {
        'authorization': 'Bearer ' + accessToken,
        'accept': 'application/json, text/plain, */*',
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
  const result = await got.post(startTransaction, {
    headers: {
      'authorization': 'Bearer ' + accessToken,
      'accept': 'application/json, text/plain, */*',
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
