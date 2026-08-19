import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, X, MonitorPlay, Blocks, Power, PowerOff, ChevronsUpDown } from 'lucide-react';
import {
  BUMI_ACTIONS, BUMI_CLASSROOM_SAFE, BUMI_TOOL_EVENT, bumiCmd, bumiState, bumiBaseUrl,
  createBumiCuer, type BumiToolKind,
} from '../lib/bumi';

// Side-effect import for the legacy custom element
import '../legacy/ToddlerDrawingDreamer';

export default function Tools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isRobotConnected, setIsRobotConnected] = useState(false);
  const [robotHint, setRobotHint] = useState('未连接 · 上课电脑请先开 bumi_server.py');
  const [dockMore, setDockMore] = useState(false);

  const connectedRef = useRef(false);
  const toolSwitchSent = useRef(false);
  const sendQuietRef = useRef<(action: string) => Promise<unknown>>(async () => {});
  const cuerRef = useRef<ReturnType<typeof createBumiCuer> | null>(null);

  connectedRef.current = isRobotConnected;
  sendQuietRef.current = async (action: string) => {
    const data = await bumiCmd(action);
    const meta = BUMI_ACTIONS.find((a) => a.id === action || a.id.toUpperCase() === action);
    setRobotHint(`工具 ${meta?.name || action} · mode=${data.mode ?? '?'}`);
    return data;
  };
  if (!cuerRef.current) {
    cuerRef.current = createBumiCuer(
      () => connectedRef.current,
      (action) => sendQuietRef.current(action)
    );
  }
  const { cue } = cuerRef.current;

  useEffect(() => {
    const onCue = (e: Event) => {
      const kind = (e as CustomEvent<{ kind: BumiToolKind }>).detail?.kind;
      if (kind === 'draw' || kind === 'generate') cue('swing', 4000);
      if (kind === 'print') cue('cheer', 3000);
    };
    window.addEventListener(BUMI_TOOL_EVENT, onCue);
    return () => window.removeEventListener(BUMI_TOOL_EVENT, onCue);
  }, [cue]);

  useEffect(() => {
    if (activeTool === 'print-my-dream' && isRobotConnected && !toolSwitchSent.current) {
      toolSwitchSent.current = true;
      cue('switch', 0);
    }
    if (activeTool !== 'print-my-dream') toolSwitchSent.current = false;
  }, [activeTool, isRobotConnected, cue]);

  const handleConnectRobot = async () => {
    if (isRobotConnected) {
      setIsRobotConnected(false);
      setRobotHint('已断开');
      return;
    }
    try {
      const s = await bumiState();
      if (!s.ok) throw new Error('bumi_server 未就绪');
      setIsRobotConnected(true);
      setRobotHint(
        s.connected
          ? `已连接 ${bumiBaseUrl()} · Mode ${s.mode} (${s.mode_name || '?'}) · ${s.battery}%`
          : `服务在 ${bumiBaseUrl()}，机器人离线`
      );
    } catch (e: any) {
      setIsRobotConnected(false);
      alert(`连不上小布米。\n请在上课电脑运行: python scripts\\bumi_server.py\n默认地址 ${bumiBaseUrl()}\n${e?.message || e}`);
    }
  };

  const sendBumi = async (action: string | number) => {
    const meta = BUMI_ACTIONS.find(
      (a) => a.id === String(action).toLowerCase() || a.code === Number(action) || a.id.toUpperCase() === String(action)
    );
    if (meta?.danger && !confirm(`危险动作「${meta.name}」：地面平整、周围留空、有人在旁？`)) return null;
    const data = await bumiCmd(action);
    setRobotHint(
      `已发 ${meta?.name || action} · mode=${data.mode ?? '?'} ${data.ok ? '' : (data.error || '')}`
    );
    return data;
  };

  const tools = [
    {
      id: 'print-my-dream',
      title: '造梦打印机',
      subtitle: 'Print My Dream',
      desc: '用小探宝语音聊天，想好了说画出来；Ideogram 生成线稿，可打印给孩子涂色。',
      icon: Printer,
      color: 'bg-blue-500',
      bgImg: 'https://picsum.photos/seed/drawingart/400/300'
    },
    {
      id: 'ai-dance',
      title: '镜像伴舞',
      subtitle: 'AI Dance Mirroring',
      desc: '深度相机实时捕获孩子骨骼点，将律动映射到机器人关节，专属的艺术玩伴 (概念演示)。',
      icon: MonitorPlay,
      color: 'bg-orange-500',
      bgImg: 'https://picsum.photos/seed/dancekid/400/300'
    },
    {
      id: 'block-animator',
      title: '积木复活引擎',
      subtitle: 'Block Animator',
      desc: '将探奇积木作品拍照，AI 自动去除背景并将其融入动画童话场景中 (概念演示)。',
      icon: Blocks,
      color: 'bg-yellow-500',
      bgImg: 'https://picsum.photos/seed/blocks/400/300'
    }
  ];

  const dock = (
    <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-2xl px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 mb-1.5">
        <button
          type="button"
          onClick={handleConnectRobot}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shrink-0
            ${isRobotConnected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-600' : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'}`}
        >
          {isRobotConnected ? <PowerOff size={12} /> : <Power size={12} />}
          {isRobotConnected ? '断开小布米' : '外联小布米'}
        </button>
        <span className="text-[10px] text-slate-400 truncate">{robotHint}</span>
      </div>
      {isRobotConnected && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {(dockMore ? BUMI_ACTIONS : BUMI_ACTIONS.filter((a) => BUMI_CLASSROOM_SAFE.includes(a.id))).map((a) => (
            <button
              key={a.code}
              title={`${a.code}=${a.name}`}
              onClick={() => sendBumi(a.id).catch((err) => alert(err?.message || err))}
              className={`px-2 py-1 rounded-md text-[11px] font-bold border transition
                ${a.danger ? 'border-orange-800/80 bg-orange-950/40 text-orange-200 hover:bg-orange-900/50' : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
            >
              {a.code} {a.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDockMore((v) => !v)}
            className="px-2 py-1 rounded-md text-[11px] font-bold border border-slate-600 bg-slate-900 text-slate-300 hover:bg-slate-800 flex items-center gap-1"
          >
            <ChevronsUpDown size={12} />
            {dockMore ? '收起' : '更多'}
          </button>
        </div>
      )}
    </div>
  );

  if (activeTool === 'print-my-dream') {
    return (
      <div className="fixed inset-0 z-[100] bg-black">
        <button 
          onClick={() => setActiveTool(null)}
          className="absolute top-4 left-4 z-[999] bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
        <div className="absolute bottom-3 left-4 right-24 z-[999] max-w-2xl pointer-events-auto">
          {dock}
        </div>
        {/* Render the Web Component directly */}
        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: '<gdm-live-audio></gdm-live-audio>' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 w-full py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-4">赋能孩子的想象力</h1>
        <p className="text-xl text-slate-500 mb-6">探奇特色的多模态 AI 生成与交互体验矩阵</p>
        <div className="max-w-2xl mx-auto text-left">{dock}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className="relative group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 cursor-pointer h-96 flex flex-col"
              onClick={() => setActiveTool(tool.id)}
              whileHover={{ y: -8 }}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                <img src={tool.bgImg} alt={tool.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className={`absolute top-4 right-4 z-20 ${tool.color} text-white p-3 rounded-2xl shadow-lg`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{tool.title}</h3>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{tool.subtitle}</p>
                    <p className="text-slate-600 line-clamp-3">{tool.desc}</p>
                 </div>
                 <div className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    开始体验 &rarr;
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Alert modal when clicking concepts */}
      {activeTool && activeTool !== 'print-my-dream' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative"
            >
              <button 
                onClick={() => setActiveTool(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-blue-50 text-primary mx-auto rounded-full flex items-center justify-center mb-6">
                <Blocks size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">即将上线</h3>
              <p className="text-slate-500 mb-6">该功能模块正在研发中，敬请期待！请体验「造梦打印机」。</p>
              <button onClick={() => setActiveTool(null)} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90">
                知道了
              </button>
            </motion.div>
         </div>
      )}
    </div>
  );
}
