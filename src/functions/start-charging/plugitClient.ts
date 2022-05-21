import got from 'got';
import chromium from '@sparticuz/chrome-aws-lambda'
// const chromium = require('@sparticuz/chrome-aws-lambda');

// const start_transaction = 'https://plugitcloud.com/api/charge-points/' + process.env.PLUGIT_CHARGE_POINT_ID + '/charge-boxes/' + process.env.PLUGIT_CHARGE_BOX_ID + '/remote-start-transaction';
const chargebox_dashboard = 'https://plugitcloud.com/api/charge-boxes/' + process.env.PLUGIT_CHARGE_BOX_NUMBER + '/dashboard'

export async function login() {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })

  // const browser = await chromium.puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://plugitcloud.com')
  // await page.screenshot({ path: 'step1.png' })
  await page.click('button.loginPage__loginActionButton')
  await page.waitForSelector('input[name="email"]', { visible: true })
  await page.focus('input[name="email"]')
  await page.keyboard.type(process.env.PLUGIT_USERNAME || '')
  await page.focus('input[name="password"]')
  await page.keyboard.type(process.env.PLUGIT_PASSWORD || '')
  // await page.screenshot({ path: 'step2.png' })
  await page.click('button[type="submit"][aria-label="Log in"]')
  await page.waitForNavigation({waitUntil: 'networkidle2'})
  const params = await page.evaluate(() => {
      return {
        accessToken: window.localStorage.accessToken,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        deviceScaleFactor: window.devicePixelRatio,
      };
    })
  // await page.screenshot({ path: 'step3.png' })
  await browser.close()
  return params.accessToken
  return 'dippa'
}

export async function isCableConnected(accessToken: string) {
  const result = await got(chargebox_dashboard, {
    headers: {
        'authorization': 'Bearer ' + accessToken,
        'accept': 'application/json, text/plain, */*',
    }
  })
  console.log(result)
  return {statusCode: result.statusCode, body: result.body }
}

export function startCharging() {
  return true
}
