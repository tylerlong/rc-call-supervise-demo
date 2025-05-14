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

  // init call supervision
  await rc.authorize({
    jwt: process.env.RINGCENTRAL_JWT_TOKEN!,
  });
  console.log(rc.token.access_token);
  await rc.revoke();
};
main();
