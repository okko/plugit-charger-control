import got from 'got'

export function announce(text: string) {
  const url = new URL('https://api.voicemonkey.io/trigger')
  url.searchParams.set('access_token', process.env.VOICEMONKEY_ACCESS_TOKEN)
  url.searchParams.set('secret_token', process.env.VOICEMONKEY_SECRET_TOKEN)
  url.searchParams.set('monkey', process.env.VOICEMONKEY_MONKEY_ID)
  url.searchParams.set('announcement', text)
  return got(url).json()
}
