/**
 * Doubao (探奇 Railway) dialog client.
 * Voice/text chat only — drawing stays on Ideogram in the web app.
 */

export const TANQI_API =
  (import.meta.env.VITE_TANQI_API as string | undefined)?.replace(/\/$/, "") ||
  "https://tanqibot.up.railway.app";

export const TANQI_DEVICE_TOKEN =
  (import.meta.env.VITE_TANQI_DEVICE_TOKEN as string | undefined) || "web-tanqiedu";

export type DoubaoTurn = {
  text_response?: string;
  audio_base64?: string | null;
  requires_drawing?: boolean;
  drawing_prompt?: string;
  draft_prompt?: string;
  stt_empty?: boolean;
  action?: {
    type?: string;
    status?: string;
    prompt?: string;
    message?: string;
  } | null;
};

function deviceHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    "x-device-token": TANQI_DEVICE_TOKEN,
    Accept: "application/json",
    ...extra,
  };
}

export class DoubaoSilentError extends Error {
  constructor() {
    super("FIRST_TURN_SILENT");
    this.name = "DoubaoSilentError";
  }
}

export async function doubaoChat(text: string): Promise<DoubaoTurn> {
  const res = await fetch(`${TANQI_API}/api/device/v1/chat`, {
    method: "POST",
    headers: deviceHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`chat ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function doubaoVoice(wav: Blob): Promise<DoubaoTurn> {
  const res = await fetch(`${TANQI_API}/api/device/v1/voice`, {
    method: "POST",
    headers: deviceHeaders({ "Content-Type": "audio/wav" }),
    body: wav,
  });
  if (res.status === 422) {
    throw new DoubaoSilentError();
  }
  if (!res.ok) {
    throw new Error(`voice ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function doubaoResetConversation(): Promise<void> {
  try {
    await fetch(`${TANQI_API}/api/device/v1/conversation-reset`, {
      method: "POST",
      headers: deviceHeaders(),
    });
  } catch (e) {
    console.warn("conversation-reset failed", e);
  }
}

export function wantsDrawing(data: DoubaoTurn): boolean {
  return Boolean(data.requires_drawing || data.action?.type === "draw");
}

export function drawingPromptFromTurn(data: DoubaoTurn): string {
  return (
    (data.drawing_prompt || "").trim() ||
    (data.draft_prompt || "").trim() ||
    (data.action?.prompt || "").trim()
  );
}

export function floatToPcm16(float32: Float32Array): Int16Array {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

export function concatInt16(chunks: Int16Array[]): Int16Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Int16Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

export function pcm16ToWav(pcm: Int16Array, sampleRate = 16000): Blob {
  const n = pcm.byteLength;
  const buf = new ArrayBuffer(44 + n);
  const v = new DataView(buf);
  const write = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(offset + i, s.charCodeAt(i));
  };
  write(0, "RIFF");
  v.setUint32(4, 36 + n, true);
  write(8, "WAVE");
  write(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  write(36, "data");
  v.setUint32(40, n, true);
  new Int16Array(buf, 44).set(pcm);
  return new Blob([buf], { type: "audio/wav" });
}

export function rms(float32: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < float32.length; i++) sum += float32[i] * float32[i];
  return Math.sqrt(sum / Math.max(1, float32.length));
}

export function playTtsBase64(b64?: string | null): Promise<void> {
  if (!b64) return Promise.resolve();
  return new Promise((resolve) => {
    try {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const isWav = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
      const blob = new Blob([bytes], { type: isWav ? "audio/wav" : "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const done = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    } catch {
      resolve();
    }
  });
}
