import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Pause, Play, FastForward, Volume2, Hand, Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PLANE_NODES, PLANE_ROBOT, parsePlaneMedia, type PlaneNode, type PlaneMedia,
} from '../data/planeLauncher';

type Props = {
  robotConnected: boolean;
  onRobotCue: (actionId: string) => void;
};

function speak(text: string, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (!text || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.95;
    const done = () => resolve();
    u.onend = done;
    u.onerror = done;
    const onAbort = () => {
      window.speechSynthesis.cancel();
      done();
    };
    if (signal.aborted) {
      done();
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
    window.speechSynthesis.speak(u);
  });
}

function waitMs(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (ms <= 0 || signal.aborted) {
      resolve();
      return;
    }
    const t = window.setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      window.clearTimeout(t);
      resolve();
    }, { once: true });
  });
}

function PaperPlanes({ racing }: { racing?: boolean }) {
  const items = racing ? 10 : 5;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl md:text-5xl"
          style={{ top: `${8 + (i * 9) % 70}%` }}
          initial={{ x: '-15vw', rotate: -12, opacity: 0.35 }}
          animate={{ x: '115vw', rotate: 18, opacity: [0.2, 0.7, 0.2] }}
          transition={{
            duration: racing ? 4 + (i % 3) : 10 + (i % 5),
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'linear',
          }}
        >
          ✈️
        </motion.div>
      ))}
    </div>
  );
}

export default function PlaneLauncherCourse({ robotConnected, onRobotCue }: Props) {
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [remain, setRemain] = useState(0);
  const [status, setStatus] = useState('点击开始上课');
  const [hands, setHands] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [parts, setParts] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pausedRef = useRef(false);
  const autoRef = useRef(true);

  const node = PLANE_NODES[idx];
  const medias = (node.media || []).map(parsePlaneMedia);
  const image = medias.find((m) => m.kind === 'image');
  const video = medias.find((m) => m.kind === 'video');

  pausedRef.current = paused;
  const cueRef = useRef(onRobotCue);
  cueRef.current = onRobotCue;

  const stopAll = useCallback(() => {
    abortRef.current?.abort();
    window.speechSynthesis?.cancel();
    const v = videoRef.current;
    if (v) {
      v.pause();
    }
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.removeAttribute('src');
      a.load();
    }
  }, []);

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(PLANE_NODES.length - 1, next));
    stopAll();
    setPicked(null);
    setRemain(0);
    setIdx(clamped);
  }, [stopAll]);

  useEffect(() => {
    if (!started) return;
    const ac = new AbortController();
    abortRef.current = ac;
    const { signal } = ac;
    const n = PLANE_NODES[idx];
    const clip = (n.media || []).map(parsePlaneMedia);
    const videoClip = clip.find((m) => m.kind === 'video');
    const audioClip = clip.find((m) => m.kind === 'audio');
    autoRef.current = true;
    setStatus(n.title);

    if (n.robotAction) {
      const action = PLANE_ROBOT[n.robotAction];
      if (action) cueRef.current(action);
      if (n.robotAction === 3 || n.robotAction === 1) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: ['#38bdf8', '#fbbf24', '#f97316'] });
      }
    }

    const playAudioLoops = (m: PlaneMedia, loops: number) =>
      new Promise<void>((resolve) => {
        const el = audioRef.current;
        if (!el) {
          resolve();
          return;
        }
        let played = 0;
        const playOnce = () => {
          if (signal.aborted) {
            resolve();
            return;
          }
          el.src = m.url;
          el.loop = false;
          el.play().catch(() => resolve());
        };
        el.onended = () => {
          played += 1;
          if (played >= loops || signal.aborted) resolve();
          else playOnce();
        };
        el.onerror = () => resolve();
        signal.addEventListener('abort', () => resolve(), { once: true });
        playOnce();
      });

    const playVideo = () =>
      new Promise<void>((resolve) => {
        const el = videoRef.current;
        if (!el) {
          resolve();
          return;
        }
        const done = () => resolve();
        el.onended = done;
        el.onerror = done;
        signal.addEventListener('abort', done, { once: true });
        const tryPlay = () => {
          el.play().catch(() => {});
        };
        if (el.readyState >= 2) tryPlay();
        else el.onloadeddata = tryPlay;
      });

    const countdown = async (seconds: number) => {
      for (let s = seconds; s > 0; s--) {
        if (signal.aborted) return;
        while (pausedRef.current && !signal.aborted) await waitMs(200, signal);
        setRemain(s);
        await waitMs(1000, signal);
      }
      setRemain(0);
    };

    (async () => {
      try {
        if (n.tts) await speak(n.tts, signal);
        if (signal.aborted) return;
        if (videoClip) await playVideo();
        if (signal.aborted) return;
        if (audioClip) await playAudioLoops(audioClip, audioClip.loops);
        if (signal.aborted) return;
        if (n.wait > 0) await countdown(n.wait);
        if (signal.aborted || !autoRef.current) return;
        if (idx < PLANE_NODES.length - 1) go(idx + 1);
        else setStatus('课程结束，挥挥手说再见');
      } catch {
        /* skip */
      }
    })();

    return () => {
      ac.abort();
      window.speechSynthesis?.cancel();
    };
  }, [started, idx, go]);

  const replayTts = () => {
    if (node.tts) {
      const ac = new AbortController();
      void speak(node.tts, ac.signal);
    }
  };

  if (!started) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100">
        <PaperPlanes />
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 backdrop-blur-md rounded-[2.5rem] px-10 py-12 shadow-2xl border-4 border-white max-w-2xl"
          >
            <div className="text-6xl mb-4">✈️</div>
            <h1 className="text-4xl md:text-5xl font-black text-sky-800 mb-3">神奇的飞机发射器</h1>
            <p className="text-lg text-slate-600 mb-8">幼儿 STEAM · 41 步互动课堂 · 可外联小布米</p>
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="px-10 py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-2xl font-black shadow-lg active:scale-95 transition"
            >
              开始上课
            </button>
            <p className="mt-4 text-sm text-slate-500">
              {robotConnected ? '小布米已连接，开场会挥手问好' : '先点底部「外联小布米」，再点准备，机器人才会跟着做动作'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-sky-500 via-sky-300 to-emerald-100 text-slate-900">
      <PaperPlanes racing={node.id === 27} />

      <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-3">
        <span className="bg-sky-900/80 text-white text-xs font-bold px-3 py-1 rounded-full">{node.phase}</span>
        <div className="flex-1 h-2 bg-white/40 rounded-full overflow-hidden">
          <div className="h-full bg-orange-400" style={{ width: `${((idx + 1) / PLANE_NODES.length) * 100}%` }} />
        </div>
        <span className="text-sky-950 font-mono text-sm font-bold bg-white/70 px-2 py-0.5 rounded-lg">
          {idx + 1}/{PLANE_NODES.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={node.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="absolute inset-0 pt-14 pb-36 px-4 md:px-10 flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 min-h-0 bg-white/85 backdrop-blur rounded-3xl shadow-2xl border-4 border-white overflow-hidden flex items-center justify-center relative">
            {video ? (
              <video
                ref={videoRef}
                key={video.url}
                src={video.url}
                className="w-full h-full object-contain bg-black"
                playsInline
                controls
              />
            ) : image ? (
              <img src={image.url} alt={image.file} className="max-w-full max-h-full object-contain" draggable={false} />
            ) : (
              <div className="text-8xl">✈️</div>
            )}
            <audio ref={audioRef} className="hidden" />
            {remain > 0 && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white font-black rounded-2xl px-4 py-2 text-xl shadow-lg">
                {remain >= 60 ? `${Math.floor(remain / 60)}:${String(remain % 60).padStart(2, '0')}` : `${remain}s`}
              </div>
            )}
          </div>

          <div className="md:w-[38%] flex flex-col gap-3 min-h-0">
            <div className="bg-white/90 rounded-3xl p-5 shadow-xl border-4 border-white flex-1 overflow-auto">
              <h2 className="text-2xl font-black text-sky-800 mb-3">{node.title}</h2>
              <p className="text-xl leading-relaxed text-slate-700">{node.tts || '看大屏幕，跟着老师一起做。'}</p>
              {node.robotAction && (
                <p className="mt-3 text-sm font-bold text-emerald-700">
                  小布米：{node.robotAction === 1 ? '挥手' : node.robotAction === 2 ? '握手' : node.robotAction === 3 ? '欢呼' : node.robotAction === 11 ? '舞蹈1' : node.robotAction === 14 ? '舞蹈2' : node.robotAction === 15 ? '舞蹈3' : '动作'}
                  {robotConnected ? ' · 已发送' : ' · 未连接'}
                </p>
              )}
            </div>

            {node.id === 5 && (
              <div className="flex gap-2">
                {['支架', '发射装置'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setParts((prev) => (prev.includes(p) ? prev : [...prev, p]))}
                    className={`flex-1 py-3 rounded-2xl font-black border-2 ${parts.includes(p) ? 'bg-emerald-400 border-emerald-600 text-emerald-950' : 'bg-white border-sky-300 text-sky-800'}`}
                  >
                    {p}{parts.includes(p) ? ' ✓' : ''}
                  </button>
                ))}
              </div>
            )}

            {node.quiz && (
              <div className="flex flex-col gap-2">
                {node.quiz.options.map((opt, i) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setPicked(i);
                      if (i === node.quiz!.answer) {
                        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                        onRobotCue('cheer');
                      }
                    }}
                    className={`py-3 px-4 rounded-2xl font-bold text-left border-2 ${
                      picked === i
                        ? i === node.quiz!.answer
                          ? 'bg-emerald-400 border-emerald-700'
                          : 'bg-rose-300 border-rose-600'
                        : 'bg-white border-sky-200 hover:bg-sky-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {node.wait >= 60 && remain > 0 && (
              <button
                type="button"
                onClick={() => go(idx + 1)}
                className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black"
              >
                找齐了，继续上课
              </button>
            )}

            {node.id === 29 && (
              <button
                type="button"
                onClick={() => {
                  setHands((h) => h + 1);
                  confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
                }}
                className="py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 font-black text-xl flex items-center justify-center gap-2"
              >
                <Hand /> 我飞得最远！举手 {hands > 0 ? `×${hands}` : ''}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center gap-2 bg-sky-950/80 backdrop-blur text-white rounded-2xl px-3 py-2">
        <button type="button" className="p-2 rounded-lg hover:bg-white/10" onClick={() => go(idx - 1)} disabled={idx === 0} title="上一步">
          <ChevronLeft />
        </button>
        <button type="button" className="p-2 rounded-lg hover:bg-white/10" onClick={() => setPaused((p) => !p)} title={paused ? '继续' : '暂停等待'}>
          {paused ? <Play /> : <Pause />}
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 font-bold flex items-center gap-1"
          onClick={() => go(idx + 1)}
        >
          <FastForward size={16} /> 下一步
        </button>
        <button type="button" className="p-2 rounded-lg hover:bg-white/10" onClick={replayTts} title="再读一遍">
          <Volume2 />
        </button>
        <span className="text-sm text-sky-100 truncate flex-1">{status}{paused ? ' · 已暂停计时' : ''}</span>
        <span className="text-xs text-sky-300 flex items-center gap-1"><Sparkles size={12} /> 老师可随时跳步</span>
      </div>
    </div>
  );
}
