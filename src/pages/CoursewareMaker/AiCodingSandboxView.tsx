import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, Code2, Terminal, 
  CheckCircle2, Sparkles, Layers 
} from 'lucide-react';
import { AICodingEngine } from './state';

interface AiCodingSandboxViewProps {
  prompt: string;
  isCompiling: boolean;
  setIsCompiling: (c: boolean) => void;
  compileProgress: number;
  setCompileProgress: (p: number) => void;
  compileLogs: string[];
  setCompileLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AiCodingSandboxView({
  prompt,
  isCompiling,
  setIsCompiling,
  compileProgress,
  setCompileProgress,
  compileLogs,
  setCompileLogs
}: AiCodingSandboxViewProps) {
  const [compilationFinished, setCompilationFinished] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCodeInspect, setShowCodeInspect] = useState(false);

  // States inside sandbox playground (directly mounted in Step 5 as custom reactive preview)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [checkedItems, setCheckedItems] = useState({ paint: false, board: false, cards: false });
  const [gameState, setGameState] = useState({
    score: 0,
    streak: 0,
    target: 'red' as 'red' | 'yellow' | 'blue',
    timer: 30,
    playing: false,
    feedback: '游戏已就绪！点击下方按钮放置彩色木塞对准消除。',
    best: 0
  });

  const timerRef = React.useRef<any>(null);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const colors = ['red', 'yellow', 'blue'] as const;
  const colorNames = { red: '🔴 红色', yellow: '🟡 黄色', blue: '🔵 蓝色' };

  const triggerConfetti = (count = 50) => {
    import('canvas-confetti').then((m) => {
      m.default({
        particleCount: count,
        spread: 60,
        colors: ['#EF4444', '#F59E0B', '#3B82F6']
      });
    });
  };

  const handleP7Check = (key: 'paint' | 'board' | 'cards', label: string) => {
    setCheckedItems(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (next[key]) {
        speakText(`幼儿判定：你找到了 ${label} 道具！`);
      }
      if (next.paint && next.board && next.cards) {
        speakText('超级棒！教具全部清点备齐！点击上方选择卡片进入页面2大消除游戏吧！');
        triggerConfetti(80);
      }
      return next;
    });
  };

  const startNewGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      streak: 0,
      timer: 30,
      playing: true,
      target: colors[Math.floor(Math.random() * 3)],
      feedback: '点击下方物理按钮，消除目标颜色！'
    }));
    speakText('游戏开始，请根据上方目标颜色，快速插木彩块对准消除！');
  };

  const handleInteract = (color: 'red' | 'yellow' | 'blue') => {
    if (!gameState.playing) {
      speakText('请先点击开始挑战按钮，模拟计时器！');
      return;
    }

    if (color === gameState.target) {
      const bonus = gameState.streak >= 2 ? 15 : 10;
      setGameState(prev => {
        const nextStreak = prev.streak + 1;
        const nextTarget = colors.filter(c => c !== color)[Math.floor(Math.random() * 2)];
        
        if (nextStreak % 3 === 0) {
          triggerConfetti(30);
        }

        const spoken = [
          '匹配成功，得分！',
          '插得真准，太棒了！',
          '完美对齐消除！'
        ];
        speakText(spoken[Math.floor(Math.random() * spoken.length)]);

        return {
          ...prev,
          score: prev.score + bonus,
          streak: nextStreak,
          target: nextTarget,
          feedback: `消除成功，积分 +${bonus}！暴击火焰持续燃烧中！🔥`
        };
      });
    } else {
      setGameState(prev => {
        speakText(`呀，配错槽了，这不符合目标色彩呢，再接再厉！`);
        return {
          ...prev,
          streak: 0,
          feedback: `配对偏颇！那是 ${colorNames[color]}，我们需要的是 ${colorNames[prev.target]}！`
        };
      });
    }
  };

  // Timer loop
  useEffect(() => {
    if (gameState.playing && gameState.timer > 0) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timer <= 1) {
            clearInterval(timerRef.current);
            speakText(`挑战倒计时结束！小朋友今天赢得了 ${prev.score} 分，大满贯！`);
            triggerConfetti(90);
            return { ...prev, timer: 0, playing: false, feedback: '游戏结束！你太厉害了！', best: Math.max(prev.best, prev.score) };
          }
          return { ...prev, timer: prev.timer - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.playing]);

  // Automated Progressive compiling simulation triggered upon entry
  useEffect(() => {
    if (isCompiling) {
      setCompilationFinished(false);
      setCompileProgress(0);
      setCompileLogs([]);
      
      AICodingEngine.executeCoding(
        prompt,
        (log) => {
          setCompileLogs(prev => [...prev, log]);
        },
        (p) => {
          setCompileProgress(p);
          if (p === 100) {
            setCompilationFinished(true);
            setIsCompiling(false);
            speakText('课件编译装配就绪，开始体验双极具身交互课件吧！');
            triggerConfetti(100);
          }
        }
      ).then((code) => {
        setGeneratedCode(code);
      });
    }
  }, [isCompiling]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* COMPILING LOADER TERMINAL PANEL */}
        {!compilationFinished && (
          <motion.div
            key="compiler"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-slate-900 border border-slate-800 text-slate-100 rounded-[2rem] p-6 shadow-2xl overflow-hidden font-mono text-[11px] leading-relaxed max-w-4xl mx-auto block text-left space-y-4"
          >
            <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="text-yellow-400 animate-pulse" size={14} />
                <span className="font-bold text-slate-300">探奇 Web 自动化物理课件编译中心</span>
              </div>
              <span className="text-xs font-bold text-yellow-400">{compileProgress}% 编译进度</span>
            </div>

            {/* Scrolling logs container */}
            <div className="bg-slate-950/80 rounded-xl p-4.5 border border-white/5 space-y-1.5 h-64 overflow-y-auto font-mono text-[10.5px]">
              {compileLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="text-slate-500 font-bold">[{idx + 1}]</span>
                  <span className={log.includes('编译成功') ? 'text-green-400 font-extrabold' : log.includes('AI') ? 'text-cyan-400' : 'text-slate-350 bg-transparent'}>{log}</span>
                </div>
              ))}
              {isCompiling && (
                <div className="flex items-center gap-1.5 text-blue-400 animate-pulse pt-2">
                  <span>●</span>
                  <span>正在合成神经网络指令并装配 HMR 离线资源中...</span>
                </div>
              )}
            </div>

            {/* Simulated progress slider bar */}
            <div className="space-y-1 pt-2">
              <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full"
                  style={{ width: `${compileProgress}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500 font-bold block text-right">COMPILE_LOG_STREAM: LIVE</span>
            </div>
          </motion.div>
        )}

        {/* COMPILED WORKING SANDBOX FRAME */}
        {compilationFinished && (
          <motion.div
            key="sandbox"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Visual Success Flag */}
            <div className="bg-emerald-50/50 border border-emerald-150 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center gap-4 text-left max-w-4xl mx-auto">
              <div className="bg-emerald-500 text-white rounded-full p-2 shrink-0">
                <CheckCircle2 size={24} className="animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black text-emerald-900 block">自动装配编译无警告通过 (HMR SUCCESS)</span>
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  已构建高保真自适应 Sandbox。请在下方自由切换页码并配合手中的**实物三色棋子**点按交互，检验心智消除逻辑及真人解说音轨。
                </p>
              </div>
            </div>

            {/* Playground layout block */}
            <div className="w-full bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm max-w-4xl mx-auto block text-slate-800 text-left">
              {/* Upper navigation */}
              <div className="flex justify-between items-center bg-slate-55 p-1.5 rounded-2xl mb-6 border">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest pl-3 font-mono">🔍 双页面装甲运行台</span>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => { setActiveStep(1); speakText('P一教具清点'); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeStep === 1 ? 'bg-white text-blue-600 shadow-sm border border-slate-150' : 'text-slate-600 hover:bg-slate-150'}`}
                  >
                    P1 - 探奇实操教具清点 (P7图)
                  </button>
                  <button 
                    onClick={() => { setActiveStep(2); speakText('P二具身颜色大闯关'); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeStep === 2 ? 'bg-white text-indigo-700 shadow-sm border border-slate-150' : 'text-slate-600 hover:bg-slate-150'}`}
                  >
                    P2 - 色彩空间站分类消除
                  </button>
                </div>
              </div>

              {/* VIEWPORTS */}
              {activeStep === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  <div className="md:col-span-8 relative aspect-video bg-indigo-50/10 rounded-3xl overflow-hidden border border-slate-200 shadow-inner p-1.5 bg-slate-100">
                    <img 
                      src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P7.png" 
                      className="w-full h-full object-contain rounded-2xl" 
                      alt="P7 map"
                    />
                    
                    {/* Ripple hotspots representing interactive layers */}
                    <button 
                      onClick={() => handleP7Check('paint', '① 三色画笔颜料')}
                      className={`absolute w-[18%] h-[20%] top-[16%] left-[18%] rounded-full border-2 border-dashed flex items-center justify-center transition-all animate-pulse ${checkedItems.paint ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600' : 'bg-red-500/10 border-red-550 text-red-500 hover:scale-105'}`}
                    >
                      <span className="text-[9px] bg-white px-2 py-0.5 rounded-full shadow-sm font-black text-slate-800">1.画笔色盘</span>
                    </button>
                    
                    <button 
                      onClick={() => handleP7Check('board', '② 双色多孔底板')}
                      className={`absolute w-[18%] h-[25%] top-[43%] left-[14%] rounded-full border-2 border-dashed flex items-center justify-center transition-all animate-pulse ${checkedItems.board ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600' : 'bg-red-500/10 border-red-550 text-red-500 hover:scale-105'}`}
                    >
                      <span className="text-[9px] bg-white px-2 py-0.5 rounded-full shadow-sm font-black text-slate-800">2.多孔插板</span>
                    </button>
                    
                    <button 
                      onClick={() => handleP7Check('cards', '③ 九宫十连卡纸')}
                      className={`absolute w-[18%] h-[20%] top-[49%] left-[38%] rounded-full border-2 border-dashed flex items-center justify-center transition-all animate-pulse ${checkedItems.cards ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600' : 'bg-red-500/10 border-red-550 text-red-500 hover:scale-105'}`}
                    >
                      <span className="text-[9px] bg-white px-2 py-0.5 rounded-full shadow-sm font-black text-slate-800">3.铺底卡纸</span>
                    </button>
                  </div>
                  
                  <div className="md:col-span-4 bg-blue-50/20 border border-blue-100 rounded-3xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                        <Layers size={14} className="text-blue-600" />
                        <span>手动教具核对气泡卡</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">
                        提示：点击左侧实物图中的闪烁圈，模拟手部拿取核对。
                      </p>

                      <div className="mt-4 space-y-2">
                        <button 
                          onClick={() => handleP7Check('paint', '① 三色画笔颜料')}
                          className={`w-full p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${checkedItems.paint ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white border-slate-150'}`}
                        >
                          <span>1. 三色画笔颜料</span>
                          <span className="text-[10px]">{checkedItems.paint ? '🟢 已校准' : '⏳ 找寻中'}</span>
                        </button>
                        
                        <button 
                          onClick={() => handleP7Check('board', '② 双色多孔底板')}
                          className={`w-full p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${checkedItems.board ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white border-slate-150'}`}
                        >
                          <span>2. 探奇双色插孔底板</span>
                          <span className="text-[10px]">{checkedItems.board ? '🟢 已校准' : '⏳ 找寻中'}</span>
                        </button>
                        
                        <button 
                          onClick={() => handleP7Check('cards', '③ 九宫十连卡纸')}
                          className={`w-full p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${checkedItems.cards ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white border-slate-150'}`}
                        >
                          <span>3. 十连色彩底纸卡</span>
                          <span className="text-[10px]">{checkedItems.cards ? '🟢 已校准' : '⏳ 找寻中'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] text-blue-900 font-extrabold flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-500" />
                        <span>教具清点通过 P7 大纲</span>
                      </span>
                      <button 
                        onClick={() => { setCheckedItems({ paint: false, board: false, cards: false }); speakText('重置完成，请重新备件！'); }}
                        className="text-[9px] text-slate-400 hover:text-red-500 font-bold transition flex items-center gap-1"
                      >
                        <RotateCcw size={10} />
                        <span>重新点算</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-white text-center flex flex-col items-center">
                  <div className="flex justify-between items-center w-full mb-4 border-b border-white/5 pb-3">
                    <h3 className="text-sm font-black text-yellow-300 tracking-wider flex items-center gap-1.5 animate-pulse">
                      <Sparkles size={14} />
                      <span>{gameState.playing ? `${gameState.timer}s 限时思维挑战中...` : '益智色彩大消除'}</span>
                    </h3>
                    
                    <div className="flex gap-3 text-xs text-slate-300 font-bold">
                      <span>🎯 连消积分: <strong className="text-green-400">{gameState.score}</strong></span>
                      <span>🔥 顺连步: <strong className="text-orange-400">{gameState.streak}</strong></span>
                    </div>
                  </div>

                  <div className="my-5 max-w-md w-full bg-slate-800/80 p-5 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1">物理感应对准靶向色</span>
                    {gameState.playing ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <motion.div 
                          key={gameState.target}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.1, opacity: 1 }}
                          className={`px-6 py-2 rounded-full text-xs font-black shadow-lg ${gameState.target === 'red' ? 'bg-red-500 text-white shadow-red-500/20' : gameState.target === 'yellow' ? 'bg-amber-400 text-slate-950 shadow-amber-400/20' : 'bg-blue-600 text-white shadow-blue-600/20'}`}
                        >
                          {colorNames[gameState.target]}
                        </motion.div>
                        <p className="text-[9px] text-emerald-400 font-bold mt-1">连击 3 次触发全域炫彩礼花！</p>
                      </div>
                    ) : (
                      <button 
                        onClick={startNewGame}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-550 hover:to-indigo-500 text-white text-xs font-black rounded-lg shadow-lg hover:shadow-xl transition active:scale-95 flex items-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <Play size={13} fill="currentColor" />
                        <span>开启颜色大消除</span>
                      </button>
                    )}
                    
                    <p className="text-[10px] text-slate-450 mt-4 leading-normal font-sans border-t border-white/5 pt-3">
                      {gameState.feedback}
                    </p>
                  </div>

                  <span className="text-[10px] text-yellow-250 font-mono mb-3 block">[ 具身对齐模拟：请根据多孔卡槽指示在电脑上点击以下相同色塞位置进行消除 ]</span>
                  <div className="flex gap-4.5 justify-center flex-wrap">
                    <button 
                      onClick={() => handleInteract('red')} 
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black hover:scale-105 active:scale-95 rounded-xl text-xs transition border border-red-500 shadow-md cursor-pointer"
                    >
                      🔴 消除红色孔 (Red)
                    </button>
                    <button 
                      onClick={() => handleInteract('yellow')} 
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black hover:scale-105 active:scale-95 rounded-xl text-xs transition border border-amber-350 shadow-md cursor-pointer"
                    >
                      🟡 消除黄色孔 (Yellow)
                    </button>
                    <button 
                      onClick={() => handleInteract('blue')} 
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black hover:scale-105 active:scale-95 rounded-xl text-xs transition border border-blue-550 shadow-md cursor-pointer"
                    >
                      🔵 消除蓝色孔 (Blue)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Generated clean code inspector block */}
            <div className="max-w-4xl mx-auto border rounded-2xl bg-neutral-50 overflow-hidden text-left">
              <button
                onClick={() => setShowCodeInspect(!showCodeInspect)}
                className="w-full text-slate-700 bg-slate-100 p-4 border-b text-xs font-bold flex justify-between items-center cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Code2 size={14} className="text-slate-600" />
                  <span>审查大模型自动装配完成的 TSX 核心打包代码</span>
                </div>
                <span>{showCodeInspect ? '收起 ▴' : '展开审查 ▾'}</span>
              </button>

              {showCodeInspect && (
                <div className="p-4 bg-slate-900 border-none rounded-b-2xl max-w-none text-[10.5px] font-mono leading-relaxed text-slate-300 max-h-96 overflow-y-auto">
                  <pre>{generatedCode || '// 装配打包解析完毕。'}</pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
