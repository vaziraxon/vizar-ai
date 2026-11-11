import "server-only";
import OpenAI from "openai";
import { SidebandWS } from "openai/resources/live/sideband/ws";
import type { VoiceModel } from "@/lib/ai/pricing";
import type { VoiceLang } from "@/lib/voice/instructions";

/**
 * The two OpenAI voice backends behind one shape. The browser's WebRTC offer
 * comes to our server, which adds the API key and the session settings and
 * returns OpenAI's answer — the key never reaches the browser. The server
 * keeps the call / session id so it can end the call itself.
 *
 *   gpt-realtime-2.1-mini — Realtime API: POST /v1/realtime/calls, ended
 *     with POST /v1/realtime/calls/{id}/hangup
 *   gpt-live-1 — Live API: POST /v1/live/sessions, ended by sending
 *     session.close over a server-side sideband connection; the browser's
 *     data channel may only close or mute the session, so it can't rewrite
 *     the interviewer's instructions
 * Neither stores the session on OpenAI's side for later download (Live:
 * store false; Realtime calls have no recording).
 */

export const voiceConfigured = () => Boolean(process.env.OPENAI_API_KEY?.trim());

function client() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20_000, maxRetries: 1 });
}

const VOICE = "marin";

export async function startVoiceCall(opts: {
  model: VoiceModel;
  sdp: string;
  instructions: string;
  language: VoiceLang;
}): Promise<{ answerSdp: string; remoteId: string }> {
  const openai = client();
  if (opts.model === "gpt-live-1") {
    const live = await openai.live.create({
      session: {
        model: "gpt-live-1",
        instructions: opts.instructions,
        store: false,
        audio: { output: { voice: VOICE } },
        client: {
          data_channel: {
            allowed_client_events: ["session.close", "session.input_audio.mute", "session.input_audio.unmute"],
          },
        },
      },
      transport: { type: "webrtc", sdp: opts.sdp },
    });
    return { answerSdp: live.transport.sdp, remoteId: live.session.id };
  }

  const response = await openai.realtime.calls.create({
    sdp: opts.sdp,
    session: {
      type: "realtime",
      model: "gpt-realtime-2.1-mini",
      instructions: opts.instructions,
      max_output_tokens: 1024,
      audio: {
        input: {
          transcription: { model: "gpt-4o-mini-transcribe", language: opts.language },
          turn_detection: { type: "semantic_vad" },
        },
        output: { voice: VOICE },
      },
    },
  });
  const answerSdp = await response.text();
  // Location: /v1/realtime/calls/rtc_...
  const remoteId = (response.headers.get("location") ?? "").split("/").filter(Boolean).pop() ?? "";
  if (!answerSdp.startsWith("v=") || !remoteId) throw new Error("OpenAI returned no SDP answer or call id");
  return { answerSdp, remoteId };
}

/** Ends the call on OpenAI's side. Safe to call twice; never throws. */
export async function hangupVoiceCall(model: string, remoteId: string | null): Promise<void> {
  if (!remoteId || !voiceConfigured()) return;
  const openai = client();
  try {
    if (model === "gpt-live-1") {
      await new Promise<void>((resolve) => {
        const ws = new SidebandWS(openai, { session_id: remoteId });
        const done = () => {
          clearTimeout(timer);
          try {
            ws.close();
          } catch {
            /* already closed */
          }
          resolve();
        };
        const timer = setTimeout(done, 5000);
        ws.on("event", (event) => {
          if (event.type === "session.closed") done();
        });
        ws.on("error", done);
        ws.send({ type: "session.close" });
      });
      return;
    }
    await openai.realtime.calls.hangup(remoteId);
  } catch (error) {
    // 404 / already ended is fine: the call is over either way
    console.error("[voice] hangup", model, error instanceof Error ? error.message : error);
  }
}
