# Plugit Charger Control

Automatically start charging at 21:03 if the charging cable is connected to the car.

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/C_RdafZ5Cr8/0.jpg)](https://www.youtube.com/watch?v=C_RdafZ5Cr8)


[Flow diagram](doc/plugit-charger-control.drawio.html)

# How it works

An AWS Lambda function authenticates with the Plugit API via Ory Kratos, checks the charger status, and starts charging if the cable is connected. It announces the result via Alexa using VoiceMonkey.

# Installation

```
yarn install
```

# Configuration

Create a `.env` file with the following variables:

```
API_KEY=your-api-key
PLUGIT_CHARGE_POINT_ID=your-charge-point-id
PLUGIT_CHARGE_BOX_ID=your-charge-box-id
PLUGIT_CHARGE_BOX_GROUP_ID=your-charge-box-group-id
PLUGIT_USERNAME=your-plugit-email
PLUGIT_PASSWORD=your-plugit-password
VOICEMONKEY_ACCESS_TOKEN=your-voicemonkey-access-token
VOICEMONKEY_SECRET_TOKEN=your-voicemonkey-secret-token
VOICEMONKEY_MONKEY_ID=your-monkey-name
```

# Deployment

```
set -a && source .env && set +a && yarn sls deploy
```

# Local test run

```
source .env && yarn run-local
```

# Features
- Runs every night at 21:00 Finnish time (with automatic DST handling via EventBridge Scheduler)
- Provides a Lambda URL for on-demand invocation, requires `?apiKey=your-api-key`
- Uses the Plugit mobile app API (Ory Kratos auth + app-gw) — no browser automation
- Announces charger status via Alexa using VoiceMonkey
- Zero runtime dependencies, ~6.5kB bundle size, 256MB Lambda

## This application is in no way authorized or maintained by Plugit.
