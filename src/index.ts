import Softphone from "ringcentral-softphone";
import type { RtpPacket } from "werift-rtp";
import fs from "fs";
import RingCentral from "@rc-ex/core";

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL!,
  clientId: process.env.RINGCENTRAL_CLIENT_ID!,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET!,
});

const softphone = new Softphone({
  outboundProxy: process.env.SIP_INFO_OUTBOUND_PROXY!,
  username: process.env.SIP_INFO_USERNAME!,
  password: process.env.SIP_INFO_PASSWORD!,
  authorizationId: process.env.SIP_INFO_AUTHORIZATION_ID!,
  domain: process.env.SIP_INFO_DOMAIN!,
  codec: "PCMU/8000",
});
softphone.enableDebugMode(); // print all SIP messages

const main = async () => {
  await softphone.register();
  softphone.on("invite", async (inviteMessage) => {
    // answer the call
    const callSession = await softphone.answer(inviteMessage);

    // receive audio
    const writeStream = fs.createWriteStream(`${callSession.callId}.wav`, {
      flags: "a",
    });
    callSession.on("audioPacket", (rtpPacket: RtpPacket) => {
      writeStream.write(rtpPacket.payload);
    });

    // either you or the peer hang up
    callSession.once("disposed", () => {
      writeStream.close();
    });
  });

  // generate an access token
  await rc.authorize({
    jwt: process.env.RINGCENTRAL_JWT_TOKEN!,
  });

  // init the call supervision
  const callSessionId = process.env.CALL_SESSION_ID!;
  const partyId1 = `p-${callSessionId.substring(2)}-1`;
  const partyId2 = `p-${callSessionId.substring(2)}-2`;
  await rc.restapi().account().telephony().sessions(callSessionId).parties(
    partyId1,
  )
    .supervise().post({
      mode: "Listen",
      supervisorDeviceId: process.env.SIP_INFO_AUTHORIZATION_ID!,
      agentExtensionId: process.env.AGENT_EXTENSION_ID!,
    });
  await rc.restapi().account().telephony().sessions(callSessionId).parties(
    partyId2,
  )
    .supervise().post({
      mode: "Listen",
      supervisorDeviceId: process.env.SIP_INFO_AUTHORIZATION_ID!,
      agentExtensionId: process.env.AGENT_EXTENSION_ID!,
    });

  // we don't need the access token anymore
  await rc.revoke();
};
main();
