// Fake OpenAI voice backend: records starts and hang-ups, never calls the network.
export const calls = { started: [], hungUp: [], failNextStart: false };

export const voiceConfigured = () => true;

export async function startVoiceCall(opts) {
  if (calls.failNextStart) {
    calls.failNextStart = false;
    throw new Error("fake provider failure");
  }
  const remoteId = `rtc_fake_${calls.started.length + 1}`;
  calls.started.push({ ...opts, remoteId });
  return { answerSdp: "v=0\r\no=fake answer", remoteId };
}

export async function hangupVoiceCall(model, remoteId) {
  if (remoteId) calls.hungUp.push({ model, remoteId });
}
