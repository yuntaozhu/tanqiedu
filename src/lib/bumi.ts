/** Bumi ControlCmd — matches scripts/bumi_server.py / GitHub SDK v3.1.0 */

export type BumiActionId =
  | "walk" | "swing" | "shake" | "cheer" | "start" | "switch"
  | "startteach" | "saveteach" | "playteach" | "dance" | "falltostand"
  | "standtofall" | "dance1" | "dance2" | "tear" | "default";

export const BUMI_ACTIONS: {
  code: number;
  id: BumiActionId;
  name: string;
  danger: boolean;
}[] = [
  { code: 0,  id: "walk",        name: "走路",     danger: true },
  { code: 1,  id: "swing",       name: "挥手",     danger: false },
  { code: 2,  id: "shake",       name: "握手",     danger: false },
  { code: 3,  id: "cheer",       name: "欢呼",     danger: false },
  { code: 5,  id: "start",       name: "使能",     danger: false },
  { code: 6,  id: "switch",      name: "准备",     danger: false },
  { code: 7,  id: "startteach",  name: "开始示教", danger: true },
  { code: 8,  id: "saveteach",   name: "保存示教", danger: false },
  { code: 10, id: "playteach",   name: "播放示教", danger: true },
  { code: 11, id: "dance",       name: "舞蹈1",    danger: true },
  { code: 12, id: "falltostand", name: "起身",     danger: true },
  { code: 13, id: "standtofall", name: "躺下",     danger: true },
  { code: 14, id: "dance1",      name: "舞蹈2",    danger: true },
  { code: 15, id: "dance2",      name: "舞蹈3",    danger: true },
  { code: 16, id: "tear",        name: "擦泪",     danger: false },
  { code: 17, id: "default",     name: "停止",     danger: false },
];

const ALIAS: Record<string, BumiActionId> = Object.fromEntries(
  BUMI_ACTIONS.flatMap((a) => [
    [String(a.code), a.id],
    [a.id, a.id],
    [a.id.toUpperCase(), a.id],
    [a.name, a.id],
  ])
) as Record<string, BumiActionId>;

export function bumiBaseUrl(): string {
  try {
    const saved = localStorage.getItem("BUMI_URL");
    if (saved) return saved.replace(/\/$/, "");
  } catch {}
  const env = (import.meta as any).env?.VITE_BUMI_URL;
  return String(env || "http://127.0.0.1:9550").replace(/\/$/, "");
}

export function resolveBumiAction(raw: string | number): BumiActionId | number {
  if (typeof raw === "number") return raw;
  const key = String(raw).trim();
  return ALIAS[key] || ALIAS[key.toLowerCase()] || key.toLowerCase();
}

export async function bumiState(): Promise<any> {
  const r = await fetch(`${bumiBaseUrl()}/api/state`, {
    signal: AbortSignal.timeout(2500),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function bumiCmd(
  action: string | number,
  extra: { ver?: number; hor?: number } = {}
): Promise<any> {
  const body = {
    action: resolveBumiAction(action),
    ver: extra.ver ?? 0.3,
    hor: extra.hor ?? 0,
  };
  const r = await fetch(`${bumiBaseUrl()}/api/cmd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}
