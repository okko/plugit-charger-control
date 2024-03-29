# Plugit Charger Control

Automatically start charging at 21:00 if the charcing cable is connected to the car

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/C_RdafZ5Cr8/0.jpg)](https://www.youtube.com/watch?v=C_RdafZ5Cr8)


![Flow diagram](doc/plugit-charger-control.png)

# Installation

- Run `yarn` to install the project dependencies

# Deployment

`API_KEY=webapikey PLUGIT_CHARGE_POINT_ID=123123 PLUGIT_CHARGE_BOX_ID=123123 PLUGIT_CHARGE_BOX_NUMBER=1234 PLUGIT_USERNAME='email@example.com' PLUGIT_PASSWORD='password' VOICEMONKEY_ACCESS_TOKEN=x VOICEMONKEY_SECRET_TOKEN=y VOICEMONKEY_MONKEY_ID=your-monkey-name AWS_PROFILE=default yarn sls --verbose deploy`

# Local test run
```
yarn install
node ./node_modules/puppeteer-core/install.js
API_KEY=webapikey PLUGIT_CHARGE_POINT_ID=123123 PLUGIT_CHARGE_BOX_ID=123123 PLUGIT_CHARGE_BOX_NUMBER=1234 PLUGIT_USERNAME='email@example.com' PLUGIT_PASSWORD='password' VOICEMONKEY_ACCESS_TOKEN=x VOICEMONKEY_SECRET_TOKEN=y VOICEMONKEY_MONKEY_ID=your-monkey-name AWS_PROFILE=default yarn run-local
```

# Features
- Runs every night at 21:00 Finnish time
- Provides a URL for additional executions, requires `?apiKey=webapikey`
- PLUGIT_* env values you need to reverse engineer from app.plugitcloud.com
- Voicemonkey values you need to get by registering at voicemonkey.io

## This application is in no way authorized or maintained by Plugit.
