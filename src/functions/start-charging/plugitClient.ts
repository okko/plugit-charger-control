import chromium from '@sparticuz/chrome-aws-lambda'
import { Page } from 'puppeteer-core'

const chargeboxInfo =    'https://app.plugitcloud.com/backend/charge-points/' + process.env.PLUGIT_CHARGE_POINT_ID + '/charge-boxes/' + process.env.PLUGIT_CHARGE_BOX_ID

export async function login() {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })

  const page = await browser.newPage()
  
  page.goto('https://app.plugitcloud.com/')
  // Click button that has visible label "Update"
  await page.waitForSelector('button.--accept', { visible: true })
  await page.click('button.--accept')
  // Click button to Reject all cookies
  await page.waitForSelector('button[aria-label="Reject All"]', { visible: true })
  await page.click('button[aria-label="Reject All"]')

  // Click Login button
  await page.waitForSelector('button.loginButton', { visible: true })
  await page.click('button.loginButton')

  // These happen in the Auth0 login page
  await page.waitForSelector('input[name="email"]', { visible: true })
  await page.waitForSelector('input[name="email"]', { visible: true })
  await page.focus('input[name="email"]')
  await page.keyboard.type(process.env.PLUGIT_USERNAME || '')
  await page.focus('input[name="password"]')
  await page.keyboard.type(process.env.PLUGIT_PASSWORD || '')

  await page.click('button[type="submit"][aria-label="Log in"]')

  // Wait until we return back to https://app.plugitcloud.com/
  await page.waitForNavigation({waitUntil: 'networkidle2'})

  return {browser, page}
}

export async function getStatus(page: Page): Promise<'Unavailable' | 'Available' | 'Preparing' | 'Charging' | 'SuspendedEV' | 'SuspendedEVSE' | 'Finishing' | 'ERROR'> {
  const result = await page.evaluate(async (chargeboxInfo) => {
    const inBrowserResult = await fetch(chargeboxInfo, {method: 'GET', credentials: 'include' }).then(res => res.json()).catch(err => {
      return { statusCode: 'ERROR', error: err}
    });
    return inBrowserResult?.statusCode ? inBrowserResult : { statusCode: 200, body: inBrowserResult }
  }, chargeboxInfo)
  const statusCode = result.statusCode
  if (statusCode != 200) {
    console.error('Error in plugitClient:getStatus, statusCode != 200')
    console.error(result)
    return 'ERROR'
  }
  const body = result.body
  return body.status
}

export async function startCharging(page: Page) {
  await page.waitForSelector('eu-enter-code-button', { visible: true, timeout: 50000 })
  await page.click('eu-enter-code-button')
  await page.waitForSelector('input.enter-code__input', { visible: true })
  await page.focus('input.enter-code__input')
  console.log('Typing code')
  await page.keyboard.type(process.env.PLUGIT_CHARGE_BOX_NUMBER || 'ENV PLUGIT_CHARGE_BOX_NUMBER IS MISSING', {delay: 20})
  await page.waitForTimeout(1000)
  console.log('Clicking accept')
  await page.waitForSelector('button.--accept', { visible: true }) as unknown as HTMLElement
  await page.click('button.--accept')
  await page.waitForTimeout(2000)
  console.log('checking status again')
  const status = await getStatus(page)
  if (status === 'Charging') {
    return true
  } else {
    return false
  }
  // // const startButton = startButtonCandidate?.innerText?.includes('Aloita lataus') ? startButtonCandidate : null
  // if (startButton) {
  //   if (startButton.className.includes('--disabled')) {
  //     console.log('plugitClient:startCharging button is disabled')
  //     console.log(startButton)
  //     return false
  //   } else {
  //     startButton.click()
  //     console.log('plugitClient:startCharging request made')
  //     return true
  //   }
  // } else {
  //   console.log('plugitClient:startCharging button not found')
  //   return false
  // }
}
