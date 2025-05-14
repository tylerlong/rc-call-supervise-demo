# RingCentral call supervise demo

This app setup a softphone using the Softphone SDK to be the supervisor.

When there is call to another extension, we will setup two call supervision
session, each for one call party.

## How to test

Create an .env file with the following content:

```
SIP_INFO_OUTBOUND_PROXY=
SIP_INFO_DOMAIN=sip.ringcentral.com
SIP_INFO_USERNAME=
SIP_INFO_PASSWORD=
SIP_INFO_AUTHORIZATION_ID=

RINGCENTRAL_SERVER_URL=https://platform.ringcentral.com
RINGCENTRAL_CLIENT_ID=
RINGCENTRAL_CLIENT_SECRET=
RINGCENTRAL_JWT_TOKEN=

AGENT_EXTENSION_ID=
CALL_SESSION_ID=
```

This part is for softphone SDK, please refer to
https://github.com/ringcentral/ringcentral-softphone-ts:

```
SIP_INFO_OUTBOUND_PROXY=
SIP_INFO_DOMAIN=sip.ringcentral.com
SIP_INFO_USERNAME=
SIP_INFO_PASSWORD=
SIP_INFO_AUTHORIZATION_ID=
```

This part is for RingCentral Restful API, please refer to
https://developers.ringcentral.com/:

```
RINGCENTRAL_SERVER_URL=https://platform.ringcentral.com
RINGCENTRAL_CLIENT_ID=
RINGCENTRAL_CLIENT_SECRET=
RINGCENTRAL_JWT_TOKEN=
```

`AGENT_EXTENSION_ID` is the extension ID of agent that you want to supervise.

`CALL_SESSION_ID` will be covered later.

### How to get `CALL_SESSION_ID`?

Let agent login https://ringcentral.github.io/web-phone-demo/

Open browser console to watch then logs printed.

Let agent make a call with customer, and find a line like this in the console
`p-rc-api-ids: party-id=p-a0d7bc131844fz196cfb6059dz833984b0000-1;session-id=s-a0d7bc131844fz196cfb6059dz833984b0000`.

In the example above, `CALL_SESSION_ID` is
"s-a0d7bc131844fz196cfb6059dz833984b0000".

### run test

```
yarn install
yarn test
```

Call supervision will be inited. And we setup call supervision for two parties.
So there will be two inbound call to this app (powered by softphone SDK).

And two *.wav files will be saved to disk, containing the audios from two call
parties.
