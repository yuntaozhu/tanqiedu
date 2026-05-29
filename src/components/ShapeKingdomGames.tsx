import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, CheckCircle2, RefreshCw, Trophy, ArrowRight, ArrowLeft,
  PenTool
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ==========================================
// AUDIO SYNTHESIZER FOR SOUND EFFECTS
// ==========================================
const playSynthSound = (type: 'success' | 'fail' | 'click' | 'popup') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
      osc.frequency.setValueAtTime(440.00, audioCtx.currentTime + 0.1); // A4
      osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.2); // C#5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.3); // E5
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'popup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(293.66, audioCtx.currentTime); // D4
      osc.frequency.exponentialRampToValueAtTime(587.33, audioCtx.currentTime + 0.15); // D5
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    console.warn("Web Audio API blocked or unsupported:", e);
  }
};

const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

// ==========================================
// 1. INTRO GALAXY ANIMATION
// ==========================================
export function ShapeIntroScene({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    speakText("欢迎来到形状王国！让我们一起开启奇妙的几何探秘之旅，发现藏在身边的各种形状吧！");
  }, []);

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_60%)] animate-pulse" />
      {[...Array(25)].map((_, i) => (
        <div 
          key={i} 
          className="absolute rounded-full bg-white opacity-40 animate-ping" 
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 4 + 2}s`
          }}
        />
      ))}
      
      {/* Floating neon shapes in background */}
      <div className="absolute top-20 left-1/4 w-12 h-12 border-4 border-dashed border-sky-400/30 rounded-full animate-spin duration-10000" />
      <div className="absolute bottom-20 right-1/4 w-16 h-16 border-4 border-dotted border-purple-500/30 animate-pulse" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      <div className="absolute top-1/3 right-10 w-14 h-14 border-4 border-double border-amber-400/30 rounded-lg animate-bounce" />

      <motion.div 
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="z-10 flex flex-col items-center max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md shadow-2xl relative"
      >
        <span className="text-purple-400 font-mono text-sm uppercase tracking-widest mb-3 font-black">思维建模 第1级 —— 第五课</span>
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-sky-400 via-purple-300 to-amber-400 bg-clip-text text-transparent mb-6 tracking-tight drop-shadow">
          几何图形记
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed mb-8">
          欢迎小朋友们来到神奇的【几何形状王国】！
          在这里，三角形、圆形、正方形都变成了奇妙的道具。好玩的形状寻宝、太空拼搭和数独谜题正等待你来探索！
        </p>
        
        <button 
          onClick={() => {
            playSynthSound('success');
            onComplete();
          }}
          className="group relative px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-450 hover:to-indigo-500 rounded-full font-black text-2xl text-white shadow-xl hover:shadow-purple-500/20 transition-all duration-300 transform active:scale-95 flex items-center gap-3"
        >
          <Play className="fill-current text-white w-7 h-7 group-hover:scale-110 transition-transform" />
          开启几何探秘
        </button>
      </motion.div>
    </div>
  );
}

// ==========================================
// 2. 16 LESSONS GRID SELECTOR
// ==========================================
export function ShapeLessonSelectorGrid({ onSelectLesson }: { onSelectLesson: (id: string) => void }) {
  const lessons = [
    { num: "01", name: "辨色识趣", active: true },
    { num: "02", name: "辨形知思", active: true },
    { num: "03", name: "求同思维", active: false },
    { num: "04", name: "集合初步", active: false },
    { num: "05", name: "一个接一个", active: false },
    { num: "06", name: "数字的秘密", active: false },
    { num: "07", name: "数物对应思维", active: false },
    { num: "08", name: "一眼识数", active: false },
    { num: "09", name: "数量比较", active: false },
    { num: "10", name: "大小序列思维", active: false },
    { num: "11", name: "多维比较", active: false },
    { num: "12", name: "白天与黑夜", active: false },
    { num: "13", name: "单一属性分类", active: false },
    { num: "14", name: "AB式推理", active: false },
    { num: "15", name: "里外辨识", active: false },
    { num: "16", name: "空间推理", active: false },
  ];

  return (
    <div className="w-full h-full bg-indigo-50/50 flex flex-col p-6 items-center justify-center relative">
      <div className="w-full max-w-6xl flex flex-col flex-1 min-h-0 bg-white rounded-3xl border border-indigo-200/60 shadow-xl p-8 relative">
        <div className="flex justify-between items-center mb-6 border-b border-indigo-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">玩搭探思</span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">思维建模 —— 第1级</h1>
          </div>
          <span className="text-purple-500 text-sm font-bold font-mono">16节核心课程</span>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pr-2 animate-fadeIn">
          {lessons.map((lesson) => (
            <motion.button
              key={lesson.num}
              whileHover={lesson.active ? { y: -3, scale: 1.02 } : {}}
              onClick={() => {
                if (lesson.active) {
                  playSynthSound('click');
                  onSelectLesson(lesson.num);
                } else {
                  playSynthSound('fail');
                }
              }}
              className={`rounded-2xl p-4 flex flex-col justify-between text-left transition-all relative overflow-hidden border
                ${lesson.num === '02' 
                  ? 'bg-purple-500 border-purple-400 text-white shadow-lg cursor-pointer hover:bg-purple-450' 
                  : lesson.active 
                  ? 'bg-amber-400 border-amber-300 text-slate-900 shadow-md cursor-pointer hover:bg-amber-300' 
                  : 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <div className="text-xs font-black tracking-wider opacity-60 mb-2">LESSON {lesson.num}</div>
              <div className="text-lg md:text-xl font-extrabold pr-2">{lesson.name}</div>
              {lesson.active && (
                <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. SUB TRACK SELECTOR (CAMP or HOUSE)
// ==========================================
export function ShapeSubLessonSelector({ onSelectTrack, onBack }: { onSelectTrack: (track: 'camp' | 'house') => void, onBack: () => void }) {
  const tracks = [
    { 
      id: 'camp', 
      tag: '02-1',
      title: '思维点点营', 
      desc: '探索丛林形状、魔法神箱分类以及动物守护拼搭。',
      color: 'from-purple-500 to-indigo-600 shadow-indigo-500/20 text-white',
      descColor: 'text-indigo-50'
    },
    { 
      id: 'house', 
      tag: '02-2',
      title: '游戏玩玩屋', 
      desc: '挑战创意积木拼搭设计，解密经典的形状九宫格谜题。',
      color: 'from-amber-400 to-orange-500 shadow-orange-500/20 text-white',
      descColor: 'text-amber-50'
    }
  ];

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col p-6 items-center justify-center relative">
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1 bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-full font-bold text-slate-700 text-sm transition"
      >
        <ArrowLeft size={16} /> 返回课程级别
      </button>
      
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 mt-8">
        {tracks.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => {
              playSynthSound('success');
              onSelectTrack(t.id as any);
            }}
            className={`cursor-pointer rounded-3xl bg-gradient-to-br ${t.color} p-10 flex flex-col justify-between h-96 shadow-xl relative overflow-hidden border border-white/15`}
          >
            <div>
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-lg font-black font-mono tracking-wider mb-6">{t.tag}</span>
              <h2 className="text-4xl font-black tracking-tight mb-4">{t.title}</h2>
              <p className={`text-lg leading-relaxed ${t.descColor} font-medium`}>{t.desc}</p>
            </div>
            
            <div className="flex items-center gap-2 font-black text-xl hover:translate-x-1 duration-200 pointer-events-none">
              开始探索 <ArrowRight size={22} className="stroke-[3]" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. SHAPE FOREST SEARCH GAME
// ==========================================
export function ShapeForestSearchGame() {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [complete, setComplete] = useState(false);

  const forestTargets = [
    { id: 0, name: '圆形红太阳', shape: '圆形', sound: '看！高高挂在天空中金黄色圆圆的太阳！', emoji: '☀️', x: '82%', y: '12%', size: 'w-16 h-16' },
    { id: 1, name: '三角形松树顶', shape: '三角形', sound: '哇！松树的尖尖顶是个漂亮的三角形！', emoji: '🌲', x: '15%', y: '45%', size: 'w-20 h-24' },
    { id: 2, name: '方形安全警示牌', shape: '正方形', sound: '这里有一个正方形的安全小路牌！', emoji: '🚏', x: '46%', y: '68%', size: 'w-14 h-18' },
    { id: 3, name: '三角形小风筝', shape: '三角形', sound: '有一只彩色的三角形小风筝卡在树梢啦！', emoji: '🪁', x: '68%', y: '32%', size: 'w-14 h-14' },
    { id: 4, name: '圆圆的小野莓', shape: '圆形', sound: '草丛里藏着一串圆溜溜的红色小浆果！', emoji: '🍒', x: '30%', y: '80%', size: 'w-16 h-12' },
  ];

  useEffect(() => {
    speakText("请你在美丽的丛林中，点一点，找出藏在各处的五种几何形状物体吧！");
  }, []);

  const handleReveal = (index: number) => {
    if (revealed[index]) return;
    playSynthSound('popup');
    const update = { ...revealed, [index]: true };
    setRevealed(update);
    speakText(forestTargets[index].sound);

    if (Object.keys(update).length === forestTargets.length) {
      setTimeout(() => {
        setComplete(true);
        playSynthSound('success');
        confetti({ particleCount: 70, spread: 50 });
        speakText("你真棒！五种形状全部找齐啦！你用明亮的小眼睛辨认出了身边的几何物品！");
      }, 1200);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col p-6 items-center justify-between select-none relative overflow-hidden">
      {/* Wave Background and glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 opacity-80" />
      
      {/* Main Container */}
      <div className="w-full max-w-5xl flex flex-col flex-1 bg-slate-800/60 border border-slate-700/50 rounded-3xl p-6 relative z-10 shadow-2xl min-h-0">
        
        {/* Top bar indicators */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white font-bold px-3 py-1 rounded-full text-xs">实操课时 02-1</span>
            <h2 className="text-xl font-extrabold text-white">图形森林寻宝</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold text-sm">已找到:</span>
            <div className="flex gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-700">
              {forestTargets.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${revealed[idx] ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-700 text-slate-400'}`}
                >
                  {revealed[idx] ? '✓' : idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Forest Canvas Scene */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-950 to-indigo-950/80 rounded-2xl overflow-hidden border border-slate-700/60 flex items-center justify-center">
          
          {/* Nature Background Atmosphere */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-emerald-950/40 blur-md rounded-t-full" />
          <div className="absolute top-10 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-10 right-20 w-32 h-32 bg-sky-500/15 rounded-full blur-3xl" />

          {/* Interactive target pins on the board */}
          {forestTargets.map((target, idx) => {
            const isFound = revealed[idx];
            return (
              <motion.button
                key={target.id}
                onClick={() => handleReveal(idx)}
                className={`absolute ${target.size} flex flex-col items-center justify-center cursor-pointer select-none transition-all focus:outline-none`}
                style={{ left: target.x, top: target.y }}
                whileHover={{ scale: isFound ? 1 : 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative flex items-center justify-center">
                  {/* Neon pulsing ring helper if not found */}
                  {!isFound && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400/20 opacity-75 animate-ping" />
                  )}
                  
                  {/* The interactive emoji sprite */}
                  <span className={`text-4xl md:text-5xl select-none transition-all duration-500 ${isFound ? 'filter-none scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'brightness-45 grayscale-35 hover:brightness-100 hover:grayscale-0'}`}>
                    {target.emoji}
                  </span>

                  {/* Solved floating tag */}
                  {isFound && (
                    <motion.div 
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: -15 }}
                      className="absolute -top-6 px-2.5 py-0.5 bg-emerald-500 text-white rounded-md text-[10px] font-black tracking-wider flex items-center gap-1 shadow-md border border-emerald-300"
                    >
                      <CheckCircle2 size={10} className="stroke-[3]" />
                      {target.shape}
                    </motion.div>
                  )}
                </div>
                
                {/* Visual title guide (only visible when found) */}
                {isFound && (
                  <span className="text-[11px] font-black text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded mt-1 border border-slate-700">
                    {target.name}
                  </span>
                )}
              </motion.button>
            );
          })}

          {/* Prompt banner bottom */}
          <div className="absolute bottom-4 inset-x-0 mx-auto w-fit bg-slate-900/90 border border-purple-500/30 px-5 py-2.5 rounded-full shadow-lg text-xs md:text-sm text-center text-slate-200 backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <span>小指示：动动小手，在森林里找出带有 <b>圆形、三角形、正方形</b> 的神奇物品吧！</span>
          </div>

          {/* Final Congratulations Modal overlaid on forest */}
          <AnimatePresence>
            {complete && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm z-30"
              >
                <div className="bg-gradient-to-b from-purple-600 to-indigo-700 p-8 rounded-3xl border border-purple-300/40 shadow-2xl max-w-md flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-5 translate-x-5" />
                  
                  <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-lg mb-4 animate-bounce">
                    <Trophy className="text-slate-950 w-10 h-10" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-2">寻宝大圆满！</h3>
                  <p className="text-purple-50 mb-6 text-sm leading-relaxed">
                    太棒了！小朋友，你在丛林里精确定定位了所有的几何物体。你的“形状搜寻雷达”非常灵敏哦！
                  </p>
                  
                  <button 
                    onClick={() => {
                      playSynthSound('click');
                      setRevealed({});
                      setComplete(false);
                      speakText("请你在美丽的丛林中，重新点一点，找出藏在各处的五种几何形状物体吧！");
                    }}
                    className="px-6 py-2.5 bg-white text-indigo-700 rounded-full font-black text-sm hover:bg-slate-100 shadow-md transition active:scale-95 flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} className="stroke-[3]" />
                    再玩一次
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. SHAPE MAGIC CHEST GAME (PORTAL SORTER)
// ==========================================
interface SorterItem {
  id: number;
  name: string;
  shape: 'circle' | 'triangle' | 'square';
  shapeLabel: string;
  emoji: string;
  bgGrad: string;
}

export function ShapeMagicChestGame() {
  const [items, setItems] = useState<SorterItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [complete, setComplete] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [shakeActive, setShakeActive] = useState(false);
  const [flyDirection, setFlyDirection] = useState<'none' | 'left' | 'center' | 'right'>('none');

  const database: SorterItem[] = [
    { id: 101, name: '美味甜甜圈', shape: 'circle', shapeLabel: '圆形', emoji: '🍩', bgGrad: 'from-amber-200 to-yellow-300' },
    { id: 102, name: '探险三角铁', shape: 'triangle', shapeLabel: '三角形', emoji: '📐', bgGrad: 'from-sky-200 to-cyan-300' },
    { id: 103, name: '神秘魔方', shape: 'square', shapeLabel: '正方形', emoji: '🟨', bgGrad: 'from-rose-200 to-orange-300' },
    { id: 104, name: '数字圆壁钟', shape: 'circle', shapeLabel: '圆形', emoji: '⏰', bgGrad: 'from-emerald-200 to-teal-300' },
    { id: 105, name: '野餐三明治', shape: 'triangle', shapeLabel: '三角形', emoji: '🥪', bgGrad: 'from-orange-200 to-yellow-300' },
    { id: 106, name: '精美正方相框', shape: 'square', shapeLabel: '正方形', emoji: '🖼️', bgGrad: 'from-pink-200 to-rose-305' },
  ];

  useEffect(() => {
    // Shuffle items
    const shuffled = [...database].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setCurrentIndex(0);
    setComplete(false);
    setStats({ correct: 0, total: 0 });
    speakText("形状分拣魔法箱来啦！请看箱子冒出来的是什么物品，把它送入对应的形状传送门里面吧！");
  }, []);

  const handleSort = (chosenShape: 'circle' | 'triangle' | 'square') => {
    if (complete || items.length === 0) return;
    
    const currentItem = items[currentIndex];
    const isCorrect = currentItem.shape === chosenShape;

    if (isCorrect) {
      playSynthSound('success');
      // Fly animation direction
      if (chosenShape === 'circle') setFlyDirection('left');
      if (chosenShape === 'triangle') setFlyDirection('center');
      if (chosenShape === 'square') setFlyDirection('right');
      
      setStats(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      speakText(`真聪明！把${currentItem.name}放入了${currentItem.shapeLabel}传送门！`);
      
      setTimeout(() => {
        setFlyDirection('none');
        if (currentIndex < items.length - 1) {
          setCurrentIndex(p => p + 1);
        } else {
          setComplete(true);
          playSynthSound('success');
          confetti({ particleCount: 90, spread: 60 });
          speakText("哇，太棒啦！魔法箱里的物品全部分拣完毕！你是优秀的形状收纳整理师！");
        }
      }, 500);
    } else {
      playSynthSound('fail');
      setShakeActive(true);
      speakText(`噢，${currentItem.name}塞不进去，它不是${chosenShape === 'circle' ? '圆形' : chosenShape === 'triangle' ? '三角形' : '正方形'}的物体哦，再仔细观察一下吧。`);
      setTimeout(() => setShakeActive(false), 500);
    }
  };

  const currentItem = items[currentIndex];

  return (
    <div className="w-full h-full bg-[#0a0f24] flex flex-col p-6 items-center justify-between relative overflow-hidden select-none">
      {/* Space portal bg layer */}
      <div className="absolute inset-x-0 top-0 h-40 bg-purple-900/10 rounded-b-full filter blur-xl" />
      
      <div className="w-full max-w-4xl flex flex-col flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative z-10 shadow-2xl min-h-0 justify-between">
        
        {/* Statistics Head */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-xs">实操课时 02-2</span>
            <h2 className="text-xl font-extrabold text-white">魔法箱分类整理</h2>
          </div>
          
          <div className="flex gap-4 items-center">
            <span className="text-slate-400 text-xs md:text-sm font-bold">
              分类进度: <span className="text-white font-black">{items.length > 0 ? currentIndex + 1 : 0}</span> / {items.length}
            </span>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-black text-emerald-400">
              分拣准确: {stats.correct} 次
            </div>
          </div>
        </div>

        {/* Center: The Magic Chest dispensing items */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 py-4">
          <AnimatePresence mode="wait">
            {!complete && currentItem && (
              <motion.div
                key={currentItem.id}
                initial={{ scale: 0.1, y: 150, opacity: 0 }}
                animate={
                  flyDirection !== 'none'
                    ? { 
                        scale: 0.2, 
                        y: 200, 
                        x: flyDirection === 'left' ? -250 : flyDirection === 'right' ? 250 : 0, 
                        opacity: 0,
                        transition: { duration: 0.4, ease: 'easeIn' }
                      }
                    : shakeActive 
                    ? { x: [0, -15, 15, -15, 15, 0], scale: 1 }
                    : { scale: 1, y: 0, opacity: 1, transition: { type: 'spring', damping: 15 } }
                }
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                {/* Dispensing glow aura */}
                <div className="absolute -z-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
                
                {/* The actual item card */}
                <div className={`w-40 h-40 md:w-44 md:h-44 rounded-[2.5rem] bg-gradient-to-br ${currentItem.bgGrad} flex items-center justify-center border-4 border-white/40 shadow-2xl relative cursor-pointer group`}>
                  <span className="text-7xl md:text-8xl select-none group-hover:scale-110 duration-300">
                    {currentItem.emoji}
                  </span>
                  
                  {/* Floating magic spark particles */}
                  <span className="absolute top-2 right-2 text-yellow-405 text-lg select-none">✨</span>
                </div>
                
                <h3 className="text-white text-lg font-black mt-3 bg-slate-950/60 px-4 py-1.5 rounded-full border border-slate-800">
                  {currentItem.name}
                </h3>
              </motion.div>
            )}
          </AnimatePresence>

          {complete && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center p-4 max-w-sm"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-slate-950 text-3xl font-black shadow-lg mb-3 animate-bounce">
                🎉
              </div>
              <h3 className="text-white text-2xl font-black mb-1">分拣整理大师！</h3>
              <p className="text-slate-400 text-xs text-center mb-4 leading-relaxed">
                完美的属性整合！小朋友不仅辨认了圆和方，还完成了高难度的实物属性抽象匹配！
              </p>
              
              <button
                onClick={() => {
                  const shuffled = [...database].sort(() => Math.random() - 0.5);
                  setItems(shuffled);
                  setCurrentIndex(0);
                  setComplete(false);
                  setStats({ correct: 0, total: 0 });
                  speakText("形状分拣魔法箱来啦！请看箱子冒出来的是什么物品，把它送入对应的形状传送门里面吧！");
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-black text-xs transition flex items-center gap-1"
              >
                <RefreshCw size={12} className="stroke-[3]" /> 再试一遍
              </button>
            </motion.div>
          )}
        </div>

        {/* Bottom Panel: Portal bins (Portals to interact with) */}
        {!complete && (
          <div className="grid grid-cols-3 gap-3 md:gap-6 mt-4">
            {/* PORTAL 1: CIRCLE */}
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSort('circle')}
              className="flex flex-col items-center p-4 md:p-6 bg-gradient-to-b from-blue-950/50 to-blue-900/60 border border-blue-500/40 rounded-3xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-500/20 border-3 border-blue-400 flex items-center justify-center text-white mb-2 shadow-inner">
                <span className="text-2xl md:text-4xl">🔴</span>
              </div>
              <span className="text-blue-300 font-extrabold text-xs md:text-sm">圆形门</span>
            </motion.button>

            {/* PORTAL 2: TRIANGLE */}
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSort('triangle')}
              className="flex flex-col items-center p-4 md:p-6 bg-gradient-to-b from-purple-950/50 to-purple-900/60 border border-purple-500/40 rounded-3xl hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/20 border-3 border-purple-400 flex items-center justify-center text-white mb-2 shadow-inner" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
                <span className="text-2xl md:text-4xl translate-y-1.5">🔺</span>
              </div>
              <span className="text-purple-300 font-extrabold text-xs md:text-sm">三角形门</span>
            </motion.button>

            {/* PORTAL 3: SQUARE */}
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSort('square')}
              className="flex flex-col items-center p-4 md:p-6 bg-gradient-to-b from-amber-950/50 to-amber-900/60 border border-amber-500/40 rounded-3xl hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-amber-500/20 border-3 border-amber-400 flex items-center justify-center text-white mb-2 shadow-inner">
                <span className="text-2xl md:text-4xl">🟨</span>
              </div>
              <span className="text-amber-300 font-extrabold text-xs md:text-sm">正方形门</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 6. ANIMAL SHAPE CONNECT GAME
// ==========================================
export function ShapeAnimalConnectGame() {
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [connections, setConnections] = useState<Record<number, number>>({}); // animalId -> shieldId
  const [complete, setComplete] = useState(false);

  const animals = [
    { id: 1, name: '小章鱼', desc: '触角圆圆的！最喜欢拿着圆形的饼干！', emoji: '🐙', wants: 'circle', color: 'border-cyan-300' },
    { id: 2, name: '大耳象', desc: '鼻子翘高高！要把苹果放在高高的三角形帽！', emoji: '🐘', wants: 'triangle', color: 'border-fuchsia-300' },
    { id: 3, name: '小粉猪', desc: '耳朵胖乎乎！最爱盖四四方方的被子！', emoji: '🐷', wants: 'square', color: 'border-pink-300' },
  ];

  const shields = [
    { id: 10, type: 'triangle', name: '三角顶帽', emoji: '🔺', wantsLabel: '三角形' },
    { id: 20, type: 'square', name: '正方软垫', emoji: '🟨', wantsLabel: '正方形' },
    { id: 30, type: 'circle', name: '圆形气泡', emoji: '🔴', wantsLabel: '圆形' },
  ];

  useEffect(() => {
    speakText("三个可爱的小动物想要拿回属于它们的特定形状护盾！请先点一个小动物，然后再点击它所期盼的形状盾牌，帮它们守护自己吧！");
  }, []);

  const handleAnimalClick = (animalId: number) => {
    // If completed connection, ignore
    if (connections[animalId]) return;
    playSynthSound('click');
    setSelectedAnimal(animalId);
    const anim = animals.find(a => a.id === animalId);
    if (anim) speakText(`${anim.name}说：我想找到适合我的${anim.wants === 'circle' ? '圆形' : anim.wants === 'triangle' ? '三角形' : '正方形'}护盾！`);
  };

  const handleShieldClick = (shieldId: number, shieldType: string) => {
    if (selectedAnimal === null) {
      speakText("请先选一个左边可爱的小动物，再选形状盾牌！");
      return;
    }

    const currentAnimal = animals.find(a => a.id === selectedAnimal);
    if (!currentAnimal) return;

    if (currentAnimal.wants === shieldType) {
      playSynthSound('success');
      const updated = { ...connections, [selectedAnimal]: shieldId };
      setConnections(updated);
      setSelectedAnimal(null);
      speakText(`太棒啦！选对啦！给${currentAnimal.name}匹配了它的${shieldId === 30 ? '圆形' : shieldId === 10 ? '三角形' : '正方形'}！`);

      if (Object.keys(updated).length === animals.length) {
        setTimeout(() => {
          setComplete(true);
          playSynthSound('success');
          confetti({ particleCount: 80, spread: 45 });
          speakText("太优秀啦！你将每一个动物都和它们喜爱的几何护盾连在一起了！小动物们向你敬礼！");
        }, 1000);
      }
    } else {
      playSynthSound('fail');
      speakText(`${currentAnimal.name}说：呜呜，这个形状不对哦，我要找的是${currentAnimal.wants === 'circle' ? '圆形' : currentAnimal.wants === 'triangle' ? '三角形' : '正方形'}！再试一次！`);
    }
  };

  return (
    <div className="w-full h-full bg-[#0b132b] flex flex-col p-6 items-center justify-between select-none relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/20 via-slate-950 to-cyan-950/20" />
      
      <div className="w-full max-w-5xl flex flex-col flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative z-10 shadow-2xl min-h-0 justify-between">
        
        {/* Header indicator */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white font-bold px-3 py-1 rounded-full text-xs">实操课时 02-3</span>
            <h2 className="text-xl font-extrabold text-white">守护者形状配对</h2>
          </div>
          <div className="text-xs text-slate-400 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-full font-bold">
            匹配进度: {Object.keys(connections).length} / {animals.length}
          </div>
        </div>

        {/* Central visual workspace */}
        <div className="flex-1 grid md:grid-cols-2 gap-8 items-center justify-center relative min-h-0 overflow-y-auto">
          
          {/* Left Column: Animals */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-slate-400 tracking-wider text-center md:text-left">🐾 第一步：选一个动物伙伴</h3>
            <div className="grid gap-3">
              {animals.map((anim) => {
                const isMatched = !!connections[anim.id];
                const isSelected = selectedAnimal === anim.id;
                return (
                  <motion.div
                    key={anim.id}
                    onClick={() => handleAnimalClick(anim.id)}
                    className={`rounded-2xl p-4 border flex items-center justify-between gap-4 cursor-pointer transition-all relative overflow-hidden
                      ${isMatched 
                        ? 'bg-emerald-950/30 border-emerald-500/40 opacity-70 cursor-not-allowed' 
                        : isSelected 
                        ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/10 scale-102 ring-2 ring-purple-400' 
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                      }`}
                    whileHover={!isMatched ? { scale: 1.02 } : {}}
                    whileTap={!isMatched ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">{anim.emoji}</div>
                      <div>
                        <h4 className="text-white text-base font-black">{anim.name}</h4>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{anim.desc}</p>
                      </div>
                    </div>
                    
                    {isMatched && (
                      <div className="bg-emerald-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold shadow-md">
                        ✓
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Shape Shields */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-slate-400 tracking-wider text-center md:text-left">🛡️ 第二步：选择正确的形状盾牌</h3>
            <div className="grid gap-3">
              {shields.map((shld) => {
                // Check if any animal is linked with this shield
                const isLinked = Object.values(connections).includes(shld.id);
                return (
                  <motion.button
                    key={shld.id}
                    onClick={() => handleShieldClick(shld.id, shld.type)}
                    disabled={isLinked}
                    className={`rounded-2xl p-4 border text-left flex items-center justify-between gap-4 transition-all relative overflow-hidden
                      ${isLinked 
                        ? 'bg-emerald-950/20 border-slate-800 opacity-40 cursor-not-allowed' 
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 cursor-pointer hover:bg-slate-750'
                      }`}
                    whileHover={!isLinked ? { scale: 1.02 } : {}}
                    whileTap={!isLinked ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-4">
                      {/* Shield Icon styling */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl hover:rotate-12 duration-300
                        ${shld.type === 'circle' ? 'bg-blue-500/10 border border-blue-400/40 text-blue-400' :
                          shld.type === 'triangle' ? 'bg-purple-500/10 border border-purple-400/40 text-purple-400' :
                          'bg-amber-500/10 border border-amber-400/40 text-amber-400'
                        }`}
                        style={shld.type === 'triangle' ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } : {}}
                      >
                        <span className={shld.type === 'triangle' ? 'translate-y-1' : ''}>{shld.emoji}</span>
                      </div>
                      <div>
                        <h4 className="text-white text-base font-black">{shld.name}</h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded mt-1 inline-block
                          ${shld.type === 'circle' ? 'bg-blue-500/10 text-blue-300' :
                            shld.type === 'triangle' ? 'bg-purple-500/10 text-purple-300' :
                            'bg-amber-500/10 text-amber-300'
                          }`}
                        >
                          属性：{shld.wantsLabel}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Success Modal overlays */}
        <AnimatePresence>
          {complete && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30"
            >
              <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl shadow-2xl max-w-sm flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-md mb-4 animate-bounce text-2xl font-black">
                  ✓
                </div>
                <h3 className="text-white text-2xl font-black mb-1">守护契约达成！</h3>
                <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                  小朋友！你成功的帮助了小章鱼、大耳象和小粉猪带回完美的护盾！让我们继续前进吧！
                </p>
                <button
                  onClick={() => {
                    setConnections({});
                    setSelectedAnimal(null);
                    setComplete(false);
                    speakText("守护者形状配对重置！请先点一个小动物，然后再点击它所期盼的形状盾牌，帮它们守护自己吧！");
                  }}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-full text-xs font-black transition flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className="stroke-[3]" /> 重新挑战
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// 7. SHAPE COLORING GAME (SHAPE PAINTBRUSH)
// ==========================================
interface OutlineShape {
  id: string;
  name: string;
  type: 'circle' | 'triangle' | 'square';
  color: string;
  phrase: string;
  sound: string;
}

export function ShapeColoringGame() {
  const [selectedBrush, setSelectedBrush] = useState<'circle' | 'triangle' | 'square' | null>(null);
  const [coloredShapes, setColoredShapes] = useState<Record<string, boolean>>({});
  const [complete, setComplete] = useState(false);

  const shapes: OutlineShape[] = [
    { id: 'c', name: '大圆形', type: 'circle', color: 'bg-indigo-500 shadow-indigo-505/50 border-indigo-400', phrase: '蓝印圆形', sound: '圆溜溜的圆形被漆上了透亮的蓝色！' },
    { id: 't', name: '大三角形', type: 'triangle', color: 'bg-rose-500 shadow-rose-505/50 border-rose-400', phrase: '绯红三角', sound: '火红高昂的三角形被漆上了绚丽的红色！' },
    { id: 's', name: '大正方形', type: 'square', color: 'bg-amber-500 shadow-amber-505/50 border-amber-400', phrase: '金黄方形', sound: '稳稳当当的正方形被涂上了亮丽的黄色！' },
  ];

  useEffect(() => {
    speakText("形状魔法填色来啦！请看最下方的三个魔力画笔（圆形画笔、三角形画笔和正方形画笔）。选一把画笔，然后轻轻点在白板上形状相同的轮廓中，给它注入美丽的魔法色彩吧！");
  }, []);

  const handleShapeClick = (shapeType: 'circle' | 'triangle' | 'square', shapeId: string, shapeSound: string) => {
    if (selectedBrush === null) {
      speakText("请先自下方的工具箱里拿取一把带有几何形状符号的魔法画笔哟！");
      return;
    }

    if (selectedBrush === shapeType) {
      playSynthSound('success');
      const updated = { ...coloredShapes, [shapeId]: true };
      setColoredShapes(updated);
      setSelectedBrush(null);
      speakText(`棒极了！ ${shapeSound}`);

      if (Object.keys(updated).length === shapes.length) {
        setTimeout(() => {
          setComplete(true);
          playSynthSound('success');
          confetti({ particleCount: 100, spread: 55 });
          speakText("哇塞，小朋友，你太有艺术天赋了！所有苍白的形状都被你用合适的几何笔刷画上了最漂亮的底色！大功告成！");
        }, 1100);
      }
    } else {
      playSynthSound('fail');
      speakText(`噢，画笔 shapes 形状不合拍哦！你拿的是${selectedBrush === 'circle' ? '圆形' : selectedBrush === 'triangle' ? '三角形' : '正方形'}画笔，无法跟${shapeType === 'circle' ? '圆形' : shapeType === 'triangle' ? '三角形' : '正方形'}契合。请换一把对应的形状画笔吧！`);
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col p-6 items-center justify-between select-none relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60" />
      
      <div className="w-full max-w-4xl flex flex-col flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative z-10 shadow-2xl min-h-0 justify-between">
        
        {/* Top Header info */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white font-bold px-3 py-1 rounded-full text-xs">实操课时 02-4</span>
            <h2 className="text-xl font-extrabold text-white">图形色彩填染</h2>
          </div>
          <div className="text-xs text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full flex items-center gap-1">
            <PenTool size={12} />
            填涂: {Object.keys(coloredShapes).length} / {shapes.length}
          </div>
        </div>

        {/* Studio Blackboard canvas */}
        <div className="flex-1 relative bg-slate-950/70 rounded-2xl border border-slate-805 p-6 flex flex-col md:flex-row gap-6 items-center justify-around min-h-0">
          
          {shapes.map((s) => {
            const isColored = coloredShapes[s.id];
            return (
              <motion.button
                key={s.id}
                onClick={() => handleShapeClick(s.type, s.id, s.sound)}
                className="relative flex flex-col items-center justify-center group focus:outline-none"
                whileHover={!isColored ? { scale: 1.05 } : {}}
              >
                {/* Shapes outlines and filled representations */}
                <div 
                  className={`w-32 h-32 md:w-36 md:h-36 flex items-center justify-center transition-all duration-1000 border-4 border-dashed relative
                    ${isColored 
                      ? `${s.color} border-transparent scale-110 rotate-360 rounded-full-after shadow-xl` 
                      : 'border-slate-650 hover:border-slate-500 bg-slate-900/30'
                    }
                  `}
                  style={{
                    borderRadius: s.type === 'circle' ? '9999px' : s.type === 'square' ? '1.5rem' : '0px',
                    clipPath: s.type === 'triangle' 
                      ? (isColored ? 'none' : 'polygon(50% 0%, 0% 100%, 100% 100%)') 
                      : undefined,
                  }}
                >
                  {/* Underly custom triangle container for coloring to preserve gradient behavior */}
                  {s.type === 'triangle' && isColored && (
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-600 rounded-none shadow-2xl" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                  )}

                  <span className={`text-[13px] font-black z-10 transition-colors uppercase duration-500
                    ${isColored ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {isColored ? s.phrase : s.name}
                  </span>
                </div>

                {isColored && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="absolute -bottom-3 px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold"
                  >
                    🎨 填涂达标
                  </motion.div>
                )}
              </motion.button>
            );
          })}

          {/* Success Canvas overlay */}
          <AnimatePresence>
            {complete && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-6 text-center z-20 rounded-2xl"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl shadow-lg mb-3 animate-pulse">
                  🔮
                </div>
                <h3 className="text-white text-2xl font-black mb-1">形状实验室圆满！</h3>
                <p className="text-slate-400 text-xs max-w-xs mb-4 leading-relaxed">
                  真是巧夺天工！三种属性轮廓在一一对应的彩绘中重新复苏！现在准备好去太空进行积木组装拼搭了吗？
                </p>
                <button
                  onClick={() => {
                    setColoredShapes({});
                    setComplete(false);
                    speakText("魔法填色重置！选一把形状画笔，给匹配的轮廓注入色彩吧！");
                  }}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-full text-xs font-black transition"
                >
                  清空白板
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Paintbrushes palette Bottom */}
        {!complete && (
          <div className="mt-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center mb-3">🛠️ 主动拿取调色画笔：</h4>
            <div className="flex justify-center gap-4">
              {[
                { type: 'circle', label: '圆形画笔 (蓝)', color: 'bg-blue-600 hover:bg-blue-500 text-blue-50 border-blue-400', icon: '🔵' },
                { type: 'triangle', label: '三角形画笔 (红)', color: 'bg-rose-600 hover:bg-rose-500 text-rose-50 border-rose-400', icon: '🔺' },
                { type: 'square', label: '正方形画笔 (黄)', color: 'bg-amber-500 hover:bg-amber-450 text-amber-950 border-amber-300', icon: '🟨' },
              ].map((brush) => {
                const isSelected = selectedBrush === brush.type;
                return (
                  <motion.button
                    key={brush.type}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playSynthSound('click');
                      setSelectedBrush(brush.type as any);
                      speakText(`你拿取了带有 ${brush.type === 'circle' ? '圆形' : brush.type === 'triangle' ? '三角形' : '正方形'} 标记的魔法画笔，现在请去白板上寻找匹配的几何轮廓，点击它吧！`);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-black text-xs md:text-sm shadow-md transition-all cursor-pointer
                      ${brush.color} 
                      ${isSelected ? 'ring-4 ring-white border-transparent scale-108 shadow-xl shadow-white/10' : 'opacity-85'}
                    `}
                  >
                    <span>{brush.icon}</span>
                    <span>{brush.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 8. SHAPE BUILDING BLOCKS GAME (SPACE CAD)
// ==========================================
interface ShapePart {
  id: string;
  name: string;
  shape: 'circle' | 'triangle' | 'square' | 'rectangle';
  emoji: string;
  colorClass: string;
  targetSlotId: string; // The specific slot on blueprint
}

interface BluePrint {
  id: string;
  title: string;
  desc: string;
  illustration: string;
  parts: ShapePart[];
  slots: { id: string; name: string; x: string; y: string; shape: string; size: string; bg: string }[];
}

export function ShapeBuildingBlocksGame() {
  const [activeBlueprintId, setActiveBlueprintId] = useState<'house' | 'rocket'>('house');
  const [placedParts, setPlacedParts] = useState<Record<string, boolean>>({}); // slotId -> placed
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const blueprints: Record<'house' | 'rocket', BluePrint> = {
    house: {
      id: 'house',
      title: '温馨魔法屋',
      desc: '使用三角形做屋顶，正方形做屋身，圆形做小烟囱和魔法气泡。',
      illustration: '🏠',
      parts: [
        { id: 'hp1', name: '三角红屋顶', shape: 'triangle', emoji: '🔺', colorClass: 'bg-red-500 text-white', targetSlotId: 'roof' },
        { id: 'hp2', name: '方形大屋身', shape: 'square', emoji: '🟨', colorClass: 'bg-amber-400 text-amber-950', targetSlotId: 'body' },
        { id: 'hp3', name: '圆形亮气球', shape: 'circle', emoji: '🔴', colorClass: 'bg-blue-500 text-white', targetSlotId: 'balloon' },
      ],
      slots: [
        { id: 'roof', name: '屋顶槽', x: '50%', y: '28%', shape: 'triangle', size: 'w-24 h-20', bg: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
        { id: 'body', name: '屋身槽', x: '50%', y: '62%', shape: 'square', size: 'w-28 h-24', bg: 'square' },
        { id: 'balloon', name: '云朵气泡槽', x: '75%', y: '25%', shape: 'circle', size: 'w-14 h-14', bg: 'circle' },
      ]
    },
    rocket: {
      id: 'rocket',
      title: '极速号太空火箭',
      desc: '用三角形做火箭头和护翼，长方形/正方形做主喷射舱，圆形做宇航员驾驶视窗。',
      illustration: '🚀',
      parts: [
        { id: 'rp1', name: '冲天红弹头', shape: 'triangle', emoji: '🔺', colorClass: 'bg-red-500 text-white', targetSlotId: 'cone' },
        { id: 'rp2', name: '稳固主机舱', shape: 'square', emoji: '🟨', colorClass: 'bg-blue-500 text-white', targetSlotId: 'hull' },
        { id: 'rp3', name: '圆形领航窗', shape: 'circle', emoji: '🔴', colorClass: 'bg-yellow-400 text-amber-950', targetSlotId: 'window' },
        { id: 'rp4', name: '左侧定风翼', shape: 'triangle', emoji: '🔺', colorClass: 'bg-indigo-500 text-white', targetSlotId: 'left_fin' },
      ],
      slots: [
        { id: 'cone', name: '火箭头舱', x: '50%', y: '20%', shape: 'triangle', size: 'w-16 h-14', bg: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
        { id: 'hull', name: '喷射主舱', x: '50%', y: '52%', shape: 'square', size: 'w-20 h-24', bg: 'square' },
        { id: 'window', name: '副驾驶员窗', x: '50%', y: '48%', shape: 'circle', size: 'w-10 h-10', bg: 'circle' },
        { id: 'left_fin', name: '航向尾舵', x: '28%', y: '65%', shape: 'triangle', size: 'w-12 h-14', bg: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      ]
    }
  };

  const currentBp = blueprints[activeBlueprintId];

  useEffect(() => {
    setPlacedParts({});
    setSelectedBlockId(null);
    setComplete(false);
    speakText(`太空建筑大拼搭来啦！我们今天拼装【${currentBp.title}】。请先点击底部的几何积木模块，然后再点白板上带虚线的灰色对应槽位，来进行完美组装吧！`);
  }, [activeBlueprintId]);

  const handleBlockSelection = (partId: string, partShape: string) => {
    playSynthSound('click');
    setSelectedBlockId(partId);
    speakText(`这块积木是一个 ${partShape === 'circle' ? '圆形' : partShape === 'triangle' ? '三角形' : '正方形'} 零件，让我们寻找可以容纳它的阴影轮廓吧！`);
  };

  const handleSlotClick = (slotId: string, slotShape: string) => {
    if (selectedBlockId === null) {
      speakText("请先从最底下的积木盒子里选中一块你想要的几何建筑积木块零件！");
      return;
    }

    const currentPart = currentBp.parts.find(p => p.id === selectedBlockId);
    if (!currentPart) return;

    if (currentPart.targetSlotId === slotId) {
      playSynthSound('success');
      const updated = { ...placedParts, [slotId]: true };
      setPlacedParts(updated);
      setSelectedBlockId(null);
      speakText(`组合成功！把 ${currentPart.name} 卡入到了 ${currentPart.shape === 'circle' ? '圆形' : currentPart.shape === 'triangle' ? '三角形' : '正方形'} 槽位！`);

      if (Object.keys(updated).length === currentBp.slots.length) {
        setTimeout(() => {
          setComplete(true);
          playSynthSound('success');
          confetti({ particleCount: 110, spread: 60 });
          speakText(`太牛了！神仙手笔！小朋友完成了高难度的【${currentBp.title}】创意搭建！看啊，图形组装好之后全亮了起来，生机蓬勃！`);
        }, 1100);
      }
    } else {
      playSynthSound('fail');
      speakText(`噢，不搭调哦，放不进去。这个槽轮廓大小是 ${slotShape === 'triangle' ? '三角形' : slotShape === 'circle' ? '圆形' : '正方形'} 的，和你手上拿的积木插口合不上哦！请寻找匹配的槽。`);
    }
  };

  return (
    <div className="w-full h-full bg-[#030712] flex flex-col p-6 items-center justify-between select-none relative overflow-hidden">
      {/* CAD grids background style */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="w-full max-w-5xl flex flex-col flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative z-10 shadow-2xl min-h-0 justify-between">
        
        {/* Header menu selector to toggling Blueprints */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white font-bold px-3 py-1 rounded-full text-xs">实战大作 02-5</span>
            <h2 className="text-xl font-extrabold text-white">3D 创意图形拼搭</h2>
          </div>
          
          <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveBlueprintId('house')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1
                ${activeBlueprintId === 'house' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <span>🏠</span> 神奇小屋
            </button>
            <button
              onClick={() => setActiveBlueprintId('rocket')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1
                ${activeBlueprintId === 'rocket' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <span>🚀</span> 太空火箭
            </button>
          </div>
        </div>

        {/* CAD Blueprint canvas center */}
        <div className="flex-1 relative bg-slate-950/80 rounded-2xl border border-slate-805 flex items-center justify-center min-h-200">
          
          {/* Neon grid border indicators */}
          <div className="absolute top-4 left-4 font-mono text-[9px] text-orange-500/60 uppercase tracking-widest flex items-center gap-1.5 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            <span>BLUEPRINT: MODEL_{currentBp.id.toUpperCase()}_v1</span>
          </div>

          {!complete ? (
            <div className="absolute inset-0 w-full h-full relative">
              {currentBp.slots.map((slot) => {
                const isPlaced = !!placedParts[slot.id];
                const matchingPart = currentBp.parts.find(p => p.targetSlotId === slot.id);

                return (
                  <motion.button
                    key={slot.id}
                    onClick={() => handleSlotClick(slot.id, slot.shape)}
                    disabled={isPlaced}
                    className={`absolute flex items-center justify-center transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                      ${isPlaced 
                        ? 'cursor-not-allowed filter drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] border-transparent' 
                        : 'border-2 border-dashed border-slate-600 hover:border-orange-500 bg-slate-800/10 hover:bg-orange-500/5'
                      }`}
                    style={{ 
                      left: slot.x, 
                      top: slot.y,
                      borderRadius: slot.shape === 'circle' ? '9999px' : slot.shape === 'square' ? '0.75rem' : '0px',
                      clipPath: slot.shape === 'triangle'
                        ? (isPlaced ? 'none' : slot.bg)
                        : undefined,
                    }}
                  >
                    {/* Size boundaries override */}
                    <div className={`${slot.size} flex items-center justify-center relative`}>
                      {isPlaced && matchingPart ? (
                        // Render full color matched model inside slot boundaries
                        <motion.div 
                          key="placed"
                          initial={{ scale: 0.1, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className={`w-full h-full ${matchingPart.colorClass} flex items-center justify-center text-4xl shadow-2xl relative duration-500`}
                          style={{
                            borderRadius: slot.shape === 'circle' ? '9999px' : slot.shape === 'square' ? '0.75rem' : '0px',
                            clipPath: slot.shape === 'triangle' ? slot.bg : 'none',
                          }}
                        >
                          <span className={slot.shape === 'triangle' ? 'translate-y-2' : ''}>
                            {matchingPart.emoji}
                          </span>
                        </motion.div>
                      ) : (
                        // Gray dotted skeleton layout outline representation
                        <span className="text-[10px] font-bold text-slate-500 text-center select-none leading-none p-1 pointer-events-none">
                          {slot.name}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            // Complete rendering: Shows final composite beautifully illustrated cartoon emoji scaling and pulsing
            <motion.div 
              initial={{ scale: 0.3, y: 30, opacity: 0 }}
              animate={{ scale: 1.05, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 rounded-3xl z-10"
            >
              <div className="text-[120px] select-none filter drop-shadow-[0_0_20px_rgba(249,115,22,0.5)] animate-bounce duration-3000">
                {currentBp.illustration}
              </div>
              
              <h3 className="text-white text-3xl font-black mb-1 mt-4">{currentBp.title}组装大成功！</h3>
              <p className="text-orange-200 text-xs text-center max-w-sm mb-6 leading-relaxed">
                你拼出了优雅的几何骨架，并且完全掌握了高级的三维实物空间拼搭模式！
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPlacedParts({});
                    setSelectedBlockId(null);
                    setComplete(false);
                    speakText(`太空建筑大拼搭重置！大家一起来重新拼装【${currentBp.title}】吧！`);
                  }}
                  className="px-5 py-2 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-black transition cursor-pointer"
                >
                  重拆零件
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* CAD Builder toolbox Bottom (The Block Selection Drawer) */}
        {!complete && (
          <div className="mt-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center mb-3">🧰 积木零件槽 (先点击选中，再贴放)：</h4>
            <div className="flex justify-center gap-3 flex-wrap">
              {currentBp.parts.map((part) => {
                const isUsed = Object.keys(placedParts).some(
                  key => currentBp.slots.find(s => s.id === key)?.shape === part.shape && placedParts[key] && part.targetSlotId === key
                );
                const isSelected = selectedBlockId === part.id;
                
                return (
                  <motion.button
                    key={part.id}
                    disabled={isUsed}
                    whileHover={!isUsed ? { y: -3, scale: 1.03 } : {}}
                    whileTap={!isUsed ? { scale: 0.96 } : {}}
                    onClick={() => handleBlockSelection(part.id, part.shape)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs md:text-sm font-black shadow transition-all cursor-pointer
                      ${isUsed 
                        ? 'bg-slate-900 border-slate-805 text-slate-600 opacity-20 cursor-not-allowed line-through' 
                        : isSelected
                        ? 'bg-orange-500 border-transparent text-white ring-4 ring-orange-400 font-extrabold scale-106 shadow-lg shadow-orange-500/20'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                      }
                    `}
                  >
                    <span className="text-base select-none">{part.emoji}</span>
                    <span>{part.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 9. SHAPE SUDOKU GAME (SHAPE MATRIX)
// ==========================================
type ShapeType = 'circle' | 'triangle' | 'square';

export function ShapeSudokuGame() {
  const [board, setBoard] = useState<Record<number, ShapeType | null>>({
    0: null, 1: null, 2: null,
    3: null, 4: null, 5: null,
    6: null, 7: null, 8: null
  });
  const [complete, setComplete] = useState(false);
  const [errorCells, setErrorCells] = useState<number[]>([]);

  // Fixed initials representing sudoku puzzle parameters to guide kids layout logically
  useEffect(() => {
    setBoard({
      0: 'circle',   1: null,       2: null,
      3: null,       4: 'triangle', 5: null,
      6: null,       7: null,       8: 'square'
    });
    setComplete(false);
    setErrorCells([]);
    speakText("形状九宫格终极挑战来啦！这是一个高级几何逻辑数独。有些格子藏有圆形、三角形和正方形。在空出的格子里，放上合适的形状，让每一横排、每一竖列都没有重复！");
  }, []);

  const handleSelectShape = (index: number, shape: ShapeType) => {
    // 0, 4, 8 are locked locked initials presets
    if (index === 0 || index === 4 || index === 8) return;

    playSynthSound('click');
    const updated = { ...board, [index]: shape };
    setBoard(updated);

    // Validate rows, cols and duplicates
    const errorList: number[] = [];

    // Check rows: [0,1,2], [3,4,5], [6,7,8]
    const rowIndexes = [[0,1,2], [3,4,5], [6,7,8]];
    rowIndexes.forEach((row) => {
      const vals = row.map(i => updated[i]).filter(Boolean);
      const set = new Set(vals);
      if (vals.length !== set.size) { // duplicate values found in the same row
        row.forEach(i => { if (updated[i]) errorList.push(i); });
      }
    });

    // Check columns: [0,3,6], [1,4,7], [2,5,8]
    const colIndexes = [[0,3,6], [1,4,7], [2,5,8]];
    colIndexes.forEach((col) => {
      const vals = col.map(i => updated[i]).filter(Boolean);
      const set = new Set(vals);
      if (vals.length !== set.size) { // duplicate values found in the same col
        col.forEach(i => { if (updated[i]) errorList.push(i); });
      }
    });

    setErrorCells(Array.from(new Set(errorList)));

    // Check complete correctness criteria
    let isFinished = true;
    for (let i = 0; i < 9; i++) {
       if (!updated[i]) isFinished = false;
    }

    if (isFinished && errorList.length === 0) {
      setComplete(true);
      playSynthSound('success');
      confetti({ particleCount: 120, spread: 90 });
      speakText("我宣布，你就是最强大脑！形状九宫格填装得完美无瑕！在横向、纵向全部都做到了不重复，给你的智慧和记忆力点赞！");
    } else if (errorList.length > 0) {
      speakText("噢，亮起红色警报标志了！说明有横排或竖排里的形状撞衫重复啦！请重整一下试试吧！");
    } else {
      speakText(`你在第 ${Math.floor(index / 3) + 1} 行放了一个形状。继续填满其余格子吧！`);
    }
  };

  const handleCellClear = (index: number) => {
    if (index === 0 || index === 4 || index === 8) return;
    playSynthSound('click');
    const updated = { ...board, [index]: null };
    setBoard(updated);

    // Re-check linter errors
    const errorList: number[] = [];
    const rowIndexes = [[0,1,2], [3,4,5], [6,7,8]];
    rowIndexes.forEach((row) => {
      const vals = row.map(i => updated[i]).filter(Boolean);
      const set = new Set(vals);
      if (vals.length !== set.size) row.forEach(i => { if (updated[i]) errorList.push(i); });
    });
    const colIndexes = [[0,3,6], [1,4,7], [2,5,8]];
    colIndexes.forEach((col) => {
      const vals = col.map(i => updated[i]).filter(Boolean);
      const set = new Set(vals);
      if (vals.length !== set.size) col.forEach(i => { if (updated[i]) errorList.push(i); });
    });
    setErrorCells(Array.from(new Set(errorList)));
    setComplete(false);
  };

  return (
    <div className="w-full h-full bg-[#070b19] flex flex-col p-6 items-center justify-between select-none relative overflow-hidden">
      {/* Laser stars overlay */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-teal-500/5 rounded-full filter blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/5 rounded-full filter blur-xl" />

      <div className="w-full max-w-4xl flex flex-col flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative z-10 shadow-2xl min-h-0 justify-between">
        
        {/* Statistics title */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-indigo-950">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-full text-xs">玩玩屋 02-6</span>
            <h2 className="text-xl font-extrabold text-white">智慧九宫格数独</h2>
          </div>
          
          <div className="flex items-center gap-1.5">
            {complete ? (
              <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-black flex items-center gap-1 shadow animate-bounce">
                🎉 无懈可击
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-850 border border-slate-800 text-slate-300 rounded-full text-xs font-bold leading-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                逻辑数理关卡
              </span>
            )}
          </div>
        </div>

        {/* Sudoku game area */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 min-h-0 py-2">
          
          {/* Main 3x3 Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-[2rem] border-3 border-slate-850 shadow-inner max-w-sm w-full aspect-square">
            {[...Array(9)].map((_, idx) => {
              const val = board[idx];
              const isLocked = idx === 0 || idx === 4 || idx === 8;
              const hasError = errorCells.includes(idx);

              return (
                <div 
                  key={idx}
                  className={`rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative border overflow-hidden
                    ${isLocked 
                      ? 'bg-slate-900 border-slate-800 text-indigo-400 cursor-not-allowed font-black' 
                      : hasError 
                      ? 'bg-rose-950/40 border-rose-500 text-red-100 hover:bg-rose-900/30'
                      : val 
                      ? 'bg-slate-850 border-slate-700 text-white hover:bg-slate-800' 
                      : 'bg-slate-900/30 border-dashed border-slate-800 hover:border-indigo-800 cursor-pointer hover:bg-indigo-950/10'
                    }
                  `}
                >
                  {/* Lock Indicator badge for kids */}
                  {isLocked && (
                    <span className="absolute top-1 right-1 text-[7px] bg-slate-950 text-indigo-300 border border-slate-800 px-1 py-0.5 rounded leading-none select-none uppercase font-semibold">
                      🔒 提示
                    </span>
                  )}

                  {/* Draw Shapes representations inside cells */}
                  {val ? (
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 flex items-center justify-center text-2xl md:text-3xl hover:scale-110 duration-200
                        ${val === 'circle' ? 'text-blue-400' :
                          val === 'triangle' ? 'text-rose-400' :
                          'text-amber-400'
                        }`}
                        style={val === 'triangle' ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } : {}}
                      >
                        <span className={val === 'triangle' ? 'translate-y-1' : ''}>
                          {val === 'circle' ? '🔴' : val === 'triangle' ? '🔺' : '🟨'}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 tracking-wider uppercase">{val === 'circle' ? '圆形' : val === 'triangle' ? '三角' : '方形'}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold select-none italic text-center">点选填装</span>
                  )}

                  {/* Non-locked deletable helper trigger for kids */}
                  {!isLocked && val && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCellClear(idx);
                      }}
                      className="absolute bottom-1 right-1 bg-slate-950/80 hover:bg-slate-900 border border-slate-850 text-[8px] text-slate-400 px-1 py-0.5 rounded shadow cursor-pointer font-black"
                    >
                      清除
                    </button>
                  )}

                  {/* Simple invisible overlay button for empty cell targeting */}
                  {!val && !isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                      <div className="grid grid-cols-3 gap-0.5 p-1 w-full h-full">
                        {['circle', 'triangle', 'square'].map((sh) => (
                          <button
                            key={sh}
                            onClick={() => handleSelectShape(idx, sh as any)}
                            className="bg-indigo-500/5 hover:bg-indigo-500/20 active:bg-indigo-500/35 rounded-md flex items-center justify-center text-[11px] font-black transition cursor-pointer"
                          >
                            {sh === 'circle' ? '🔴' : sh === 'triangle' ? '🔺' : '🟨'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Guidelines on the Right */}
          <div className="flex flex-col max-w-xs justify-center gap-3">
            <h3 className="text-sm font-black text-slate-300 tracking-wider">💡 几何逻辑规则</h3>
            <p className="text-[11px] text-slate-400 leading-normal bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              请点击九宫格每个空盒子里的 <b>🔴圆形、🔺三角形、🟨正方形</b> 动作扣件。<br/><br/>
              要保持每组 <b>【横向一排】</b> 和 <b>【高矮一列】</b> 里，都不能出现两只相同的形状宝宝哦！
            </p>

            <button
              onClick={() => {
                setBoard({
                  0: 'circle',   1: null,       2: null,
                  3: null,       4: 'triangle', 5: null,
                  6: null,       7: null,       8: 'square'
                });
                setComplete(false);
                setErrorCells([]);
                speakText("形状九宫格已重置！快来重新开动脑筋吧！");
              }}
              className="px-4 py-2 hover:bg-slate-805 text-slate-300 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black transition self-start flex items-center gap-1"
            >
              <RefreshCw size={12} className="stroke-[3]" /> 全部清重来
            </button>
          </div>
        </div>

        {/* Completion celebratory state overlay */}
        <AnimatePresence>
          {complete && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-[#070b19]/95 flex flex-col items-center justify-center p-6 text-center z-20 rounded-3xl"
            >
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-slate-950 text-3xl font-black shadow-lg mb-3 animate-ping">
                🏅
              </div>
              <h3 className="text-white text-3xl font-black mb-2">几何逻辑达标！</h3>
              <p className="text-slate-300 text-xs max-w-sm mb-6 leading-relaxed">
                完美的数理思考！横排和竖列绝无重复！小朋友在这关展现了杰出的多特征逻辑筛选和排除建模技能！
              </p>
              
              <button
                onClick={() => {
                  setBoard({
                    0: 'circle',   1: null,       2: null,
                    3: null,       4: 'triangle', 5: null,
                    6: null,       7: null,       8: 'square'
                  });
                  setComplete(false);
                  setErrorCells([]);
                  speakText("形状九宫格已重置！快来重新开动脑筋吧！");
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs shadow-md transition flex items-center gap-1.5"
              >
                <RefreshCw size={12} className="stroke-[3]" /> 再刷一次
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
