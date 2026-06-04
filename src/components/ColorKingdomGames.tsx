import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Sparkles, AlertCircle, CheckCircle2, 
  RefreshCw, Trophy, Heart, ArrowRight, ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Simple Audio synthesizer using Web Audio API to prevent issues with missing audio assets
const playSynthSound = (type: 'success' | 'fail' | 'click' | 'popup') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'success') {
      osc.type = 'triangle';
      // Arpeggio
      osc.frequency.setValueAtTime(330, audioCtx.currentTime); // E4
      osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.1); // A4
      osc.frequency.setValueAtTime(554, audioCtx.currentTime + 0.2); // C#5
      osc.frequency.setValueAtTime(660, audioCtx.currentTime + 0.3); // E5
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'popup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, audioCtx.currentTime); // C4
      osc.frequency.exponentialRampToValueAtTime(523.25, audioCtx.currentTime + 0.15); // C5
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    console.warn("Web Audio API not supported or blocked by autoplay restrictions:", e);
  }
};

const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }
};

// ==========================================
// 1. INTRO GALAXY ANIMATION
// ==========================================
export function ColorIntroScene({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-center p-6">
      {/* Dynamic Glowing Background Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_60%)] animate-pulse" />
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="absolute rounded-full bg-white opacity-40 animate-ping" 
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        />
      ))}
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="z-10 flex flex-col items-center max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md shadow-2xl relative"
      >
        <span className="text-blue-400 font-mono text-sm uppercase tracking-widest mb-3">思维建模 第1级</span>
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-red-400 via-yellow-300 to-blue-400 bg-clip-text text-transparent mb-6 tracking-tight drop-shadow">
          颜色王国记
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed mb-8">
          欢迎小朋友再次来到神奇的【颜色王国】！
          在这里有好玩的颜色寻宝、空间站拼搭和有趣的颜色数独谜题在等着你哦。
        </p>
        
        <button 
          onClick={() => {
            playSynthSound('success');
            onComplete();
          }}
          className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-full font-black text-2xl text-white shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform active:scale-95 flex items-center gap-3"
        >
          <Play className="fill-current text-white w-7 h-7 group-hover:scale-110 transition-transform" />
          进入课件系统
        </button>
      </motion.div>
    </div>
  );
}

// ==========================================
// 2. 16 LESSONS GRID SELECTOR
// ==========================================
export function LessonSelectorGrid({ onSelectLesson }: { onSelectLesson: (id: string) => void }) {
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
    <div className="w-full h-full bg-orange-50/50 flex flex-col p-6 items-center justify-center relative">
      <div className="w-full max-w-6xl flex flex-col flex-1 min-h-0 bg-white rounded-3xl border border-orange-200/60 shadow-xl p-8 relative">
        <div className="flex justify-between items-center mb-6 border-b border-orange-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-bold">玩搭探思</span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">思维建模 —— 第1级</h1>
          </div>
          <span className="text-orange-500 text-sm font-bold font-mono">16节核心课程</span>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pr-2">
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
                ${lesson.active 
                  ? 'bg-amber-400 border-amber-300 text-slate-900 shadow-lg cursor-pointer hover:bg-amber-300' 
                  : 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <div className="text-xs font-black tracking-wider opacity-60 mb-2">LESSON {lesson.num}</div>
              <div className="text-lg md:text-xl font-extrabold pr-2">{lesson.num} {lesson.name}</div>
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
export function SubLessonSelector({ onSelectTrack, onBack }: { onSelectTrack: (track: 'camp' | 'house') => void, onBack: () => void }) {
  const tracks = [
    { 
      id: 'camp', 
      tag: '01-1',
      title: '思维点点营', 
      desc: '专注颜色认知、小动物趣味匹配和实操寻宝',
      color: 'from-cyan-400 to-blue-500 shadow-blue-500/20 text-white',
      descColor: 'text-cyan-50'
    },
    { 
      id: 'house', 
      tag: '01-2',
      title: '游戏玩玩屋', 
      desc: '专注空间定位摆放与趣味颜色数独挑战',
      color: 'from-amber-400 to-orange-500 shadow-orange-500/20 text-white',
      descColor: 'text-amber-50'
    }
  ];

  return (
    <div className="w-full h-full bg-orange-50/50 flex flex-col p-6 items-center justify-center relative">
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
              <span className="inline-block px-6 py-2.5 bg-white/25 border border-white/35 shadow-md backdrop-blur-md rounded-xl text-2xl md:text-3xl font-black font-mono tracking-wider mb-6">{t.tag}</span>
              <h2 className="text-4xl font-black tracking-tight mb-4">{t.title}</h2>
              <p className={`text-lg leading-relaxed ${t.descColor} font-medium`}>{t.desc}</p>
            </div>
            
            <div className="flex items-center gap-2 font-black text-xl hover:translate-x-1 duration-200 pointer-events-none">
              开始学习 <ArrowRight size={22} className="stroke-[3]" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. ANIMALS SHADOW/FOREST SEARCH GAME
// ==========================================
export function ForestSearchGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoKey, setVideoKey] = useState(0);

  const handlePlay = () => {
    setIsPlaying(true);
    speakText("开始播放讲解视频！");
  };

  const handleEnded = () => {
    playSynthSound('success');
    confetti({ particleCount: 60, spread: 40 });
    speakText("太棒了！微课导学动画观看完毕，我们准备好进入颜色王国了吗？");
  };

  const handleReset = () => {
    setIsPlaying(false);
    setVideoKey(prev => prev + 1);
    speakText("再次体验，视频重新开始啦！");
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col md:flex-row p-4 md:p-8 select-none gap-6 items-stretch">
      {/* Left Panel: Video Content in Light Green block */}
      <div className="flex-1 md:w-[70%] bg-[#E8F5E9] rounded-[2.5rem] border-4 border-[#C8E6C9] p-6 md:p-10 flex flex-col items-center justify-center relative shadow-lg">
        {/* Dark Blue Absolute Banner */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#3F51B5] text-white px-8 py-3.5 rounded-2xl shadow-xl font-bold text-lg md:text-xl border-2 border-[#5C6BC0] z-20 whitespace-nowrap tracking-wide flex items-center gap-2">
          <span>🎬</span> 视频 见2微课导学视频
        </div>

        {/* Video Player Wrapper */}
        <div className="relative w-full h-full max-h-[70vh] flex flex-col items-center justify-center mt-4">
          <div className="relative w-full h-full flex items-center justify-center rounded-3xl overflow-hidden bg-black/95 shadow-2xl border-4 border-emerald-900/10">
            <video
              key={videoKey}
              className="w-full h-full object-contain"
              src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P6%E8%B6%A3%E5%91%B3%E5%AF%BC%E5%85%A5%E8%A7%86%E9%A2%91.mp4"
              controls
              onPlay={handlePlay}
              onEnded={handleEnded}
            />

            {!isPlaying && (
              <div 
                onClick={() => {
                  const videoEl = document.querySelector('video');
                  if (videoEl) {
                    videoEl.play();
                    setIsPlaying(true);
                  }
                }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xs cursor-pointer hover:bg-black/40 transition-all duration-300 group"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-[#3F51B5] text-white rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-indigo-300/50 group-hover:bg-indigo-500 group-hover:scale-105 transition-all"
                >
                  ▶
                </motion.div>
                <span className="text-white font-extrabold mt-6 text-xl tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  点击播放导学微视频 🎥
                </span>
              </div>
            )}
          </div>
          
          {/* Subtitle / Bottom hint bar */}
          <div className="mt-4 text-emerald-800/80 font-semibold text-sm flex items-center gap-1.5 self-start">
            <span className="bg-emerald-200/80 text-emerald-900 px-2.5 py-0.5 rounded-md text-xs">小提示</span>
            <span>3分钟以内讲解视频，包含开始、暂停和进度拖动控制</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Light Blue Sidebar with Guidance, speech and Dr. Zhang */}
      <div className="w-full md:w-[30%] bg-[#E1F5FE] rounded-[2.5rem] border-4 border-[#B3E5FC] p-6 md:p-8 flex flex-col justify-between relative shadow-lg min-h-[480px] md:min-h-0 overflow-hidden">
        
        {/* Top: Mascot Header */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Custom tiger mascot card styling */}
          <div className="relative flex flex-col items-center">
            {/* Crown/Header decoration mimicking the headset tiger */}
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md border-2 border-white relative">
              <span className="text-5xl select-none filter drop-shadow">🐯</span>
              {/* Headphones decoration */}
              <div className="absolute -left-2 -right-2 top-6 h-3 bg-indigo-700 rounded-full border border-white" />
            </div>
            
            <div className="mt-3 bg-orange-500 text-white font-black px-6 py-2 rounded-2xl shadow-md border-2 border-white tracking-wide text-md">
              微课导学 🎯
            </div>
          </div>
        </div>

        {/* Middle: Speech bubble from Dr. Zhang */}
        <div className="my-auto py-4 flex flex-col items-center relative z-10">
          <div className="bg-white text-slate-800 p-5 md:p-6 rounded-[2rem] shadow-lg border border-[#B3E5FC] font-sans text-base font-extrabold leading-relaxed text-left relative max-w-xs transform -translate-y-4">
            <span className="text-blue-600 block mb-1 font-black">💡 智幼专教提点：</span>
            优秀的老师们请认真观看视频，掌握教授方法。
            {/* Speech speech bubble notched pointer downwards or left */}
            <div className="absolute bottom-[-10px] right-[40px] w-6 h-6 bg-white rotate-45 border-r border-b border-[#B3E5FC]/40 pointer-events-none" />
          </div>
        </div>

        {/* Bottom actions & Standing Dr. Zhang */}
        <div className="mt-auto w-full relative h-48 flex flex-col justify-end">
          {/* Replay action bar */}
          <div className="absolute left-0 bottom-4 w-[55%] z-20">
            <button
              onClick={handleReset}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-xs tracking-wider"
            >
              <RefreshCw size={12} className="animate-spin-slow stroke-[3]" />
              再次播放 🔄
            </button>
          </div>

          {/* Dr. Zhang Standing Image */}
          <img
            src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/%E5%9B%BE%E7%89%87%20%E5%BC%A0%E5%8D%9A%E5%A3%AB.png"
            alt="张博士"
            className="w-44 md:w-48 h-auto object-contain absolute bottom-[-1rem] right-[-1.5rem] drop-shadow-[0_15px_15px_rgba(0,0,0,0.25)] select-none pointer-events-none z-10"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. TREASURE MAGIC BOX GAME
// ==========================================
export function TreasureBoxGame() {
  const [activeItem, setActiveItem] = useState<{ id: string; color: 'red' | 'yellow' | 'blue'; label: string; icon: string } | null>(null);
  const [droppedGrids, setDroppedGrids] = useState<{ red: string[]; yellow: string[]; blue: string[] }>({
    red: [], yellow: [], blue: []
  });
  const [complete, setComplete] = useState(false);

  const treasurePool = [
    { id: 't1', color: 'red', label: '红苹果', icon: '🍎' },
    { id: 't2', color: 'yellow', label: '香蕉', icon: '🍌' },
    { id: 't3', color: 'blue', label: '蓝色跑车', icon: '🚙' },
    { id: 't5', color: 'red', label: '红番茄', icon: '🍅' },
    { id: 't6', color: 'yellow', label: '柠檬', icon: '🍋' },
    { id: 't7', color: 'blue', label: '小蓝鲸', icon: '🐳' },
  ];

  const handleOpenChest = () => {
    if (activeItem) return;
    playSynthSound('popup');
    
    // Pick first item that isn't already grouped
    const usedIds = [...droppedGrids.red, ...droppedGrids.yellow, ...droppedGrids.blue];
    const remaining = treasurePool.filter(t => !usedIds.includes(t.label));
    
    if (remaining.length === 0) {
      setComplete(true);
      playSynthSound('success');
      confetti({ particleCount: 70, spread: 50 });
      return;
    }
    
    const randomItem = remaining[Math.floor(Math.random() * remaining.length)];
    setActiveItem(randomItem as any);
    speakText(`魔法宝箱出现了一个：${randomItem.label}`);
  };

  const handleDrop = (color: 'red' | 'yellow' | 'blue') => {
    if (!activeItem) return;
    
    if (activeItem.color === color) {
      playSynthSound('success');
      const updated = {
        ...droppedGrids,
        [color]: [...droppedGrids[color], activeItem.icon]
      };
      setDroppedGrids(updated);
      setActiveItem(null);
      
      const totalUsed = Object.values(updated).flat().length;
      if (totalUsed === treasurePool.length) {
        setComplete(true);
        confetti({ particleCount: 100, spread: 80 });
      }
    } else {
      playSynthSound('fail');
      speakText("颜色的地方不对哦，再试一下吧！");
    }
  };

  const handleReset = () => {
    setActiveItem(null);
    setDroppedGrids({ red: [], yellow: [], blue: [] });
    setComplete(false);
    speakText("宝箱已重新上锁，再次体验神秘的寻宝探险吧！");
  };

  return (
    <div className="w-full h-full bg-slate-900/5 select-none flex flex-col md:flex-row relative">
      
      {/* Game board */}
      <div className="w-full md:w-[73%] h-[50%] md:h-full bg-slate-900 border-b md:border-b-0 md:border-r border-slate-700/60 flex flex-col p-6 text-white justify-between relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 to-slate-950 opacity-40 pointer-events-none" />
        
        {/* Columns Grid */}
        <div className="grid grid-cols-3 gap-6 flex-1 min-h-0 relative z-10">
          
          {/* Red column */}
          <div 
            onClick={() => handleDrop('red')}
            className={`rounded-2xl border-2 flex flex-col items-center justify-between p-4 cursor-pointer transition-all duration-300
              ${activeItem?.color === 'red' ? 'border-red-400 bg-red-500/10 scale-102 border-dashed' : 'border-red-900/40 bg-red-950/20'}
            `}
          >
            <div className="text-center w-full pb-2 border-b border-red-900/30">
              <span className="text-4xl">🔴</span>
              <div className="font-extrabold text-red-400 text-sm mt-1">红色收集格</div>
            </div>
            
            <div className="flex-1 flex flex-wrap gap-2 items-center justify-center p-3">
              {droppedGrids.red.map((emoji, i) => (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} key={i} className="text-4xl">{emoji}</motion.span>
              ))}
            </div>
          </div>
          
          {/* Yellow Column */}
          <div 
            onClick={() => handleDrop('yellow')}
            className={`rounded-2xl border-2 flex flex-col items-center justify-between p-4 cursor-pointer transition-all duration-300
              ${activeItem?.color === 'yellow' ? 'border-yellow-400 bg-yellow-500/10 scale-102 border-dashed' : 'border-yellow-900/40 bg-yellow-950/20'}
            `}
          >
            <div className="text-center w-full pb-2 border-b border-yellow-900/30">
              <span className="text-4xl">🟡</span>
              <div className="font-extrabold text-yellow-400 text-sm mt-1">黄色收集格</div>
            </div>
            
            <div className="flex-1 flex flex-wrap gap-2 items-center justify-center p-3">
              {droppedGrids.yellow.map((emoji, i) => (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} key={i} className="text-4xl">{emoji}</motion.span>
              ))}
            </div>
          </div>

          {/* Blue Column */}
          <div 
            onClick={() => handleDrop('blue')}
            className={`rounded-2xl border-2 flex flex-col items-center justify-between p-4 cursor-pointer transition-all duration-300
              ${activeItem?.color === 'blue' ? 'border-blue-400 bg-blue-500/10 scale-102 border-dashed' : 'border-blue-900/40 bg-blue-950/20'}
            `}
          >
            <div className="text-center w-full pb-2 border-b border-blue-900/30">
              <span className="text-4xl">🔵</span>
              <div className="font-extrabold text-blue-400 text-sm mt-1">蓝色收集格</div>
            </div>
            
            <div className="flex-1 flex flex-wrap gap-2 items-center justify-center p-3">
              {droppedGrids.blue.map((emoji, i) => (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} key={i} className="text-4xl">{emoji}</motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Center - Chest is here */}
        <div className="h-44 flex items-center justify-center gap-8 relative z-10 border-t border-slate-800/40 mt-4 pt-4">
          
          <div className="flex flex-col items-center justify-center text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenChest}
              disabled={activeItem !== null || complete}
              className={`w-28 h-28 text-5xl rounded-full flex items-center justify-center shadow-lg cursor-pointer select-none transition border
                ${activeItem ? 'bg-slate-800 border-slate-700 opacity-55 saturate-50' : 'bg-amber-500 hover:bg-amber-400 border-amber-400'}
              `}
            >
              📦
            </motion.button>
            <span className="text-xs text-slate-400 mt-2 font-bold tracking-widest uppercase">点击魔法宝箱</span>
          </div>

          {activeItem && (
            <motion.div 
              initial={{ scale: 0, x: -50 }}
              animate={{ scale: 1, x: 0 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onClick={() => speakText(activeItem.label)}
              className="px-6 py-4 rounded-2xl bg-white text-slate-800 flex items-center gap-3 border shadow-2xl scale-125 cursor-grab active:cursor-grabbing font-extrabold relative"
            >
              <span className="text-4xl">{activeItem.icon}</span>
              <span>{activeItem.label}</span>
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
            </motion.div>
          )}

        </div>
      </div>

      {/* Intro Panel sidebar */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white border-l border-slate-200 shadow-xl relative">
        <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold w-max mb-3">实操交互</span>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4 leading-tight">魔法宝箱寻宝格</h1>
        <p className="text-base text-slate-600 leading-relaxed mb-6 font-sans">
          点击魔法底下的宝箱，召唤颜色王国的宝贝！然后把召唤出来的宝贝通过<b>点击</b>或拖手入库对应的<b>红、黄、蓝</b>收集框中吧！
        </p>

        {complete ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 shadow-sm">
            <Sparkles className="text-emerald-500 animate-spin w-8 h-8 shrink-0" />
            <div>
              <h4 className="font-extrabold text-emerald-800">完美收箱！</h4>
              <p className="text-emerald-600 text-xs">你分拣了所有的颜色宝物，长颈鹿和小橘猪开心得跳起舞来啦！</p>
            </div>
          </div>
        ) : activeItem ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-amber-700 text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>点击对应的 红色、黄色、蓝色 收集格来进行分拣归类吧！</span>
          </div>
        ) : (
          <button 
            onClick={handleOpenChest}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 text-base"
          >
            开启宝藏 🎁
          </button>
        )}

        {/* Replay/Reset control */}
        <button
          onClick={handleReset}
          className="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-sm"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          再次体验 🔄
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 6. ANIMAL CONNECT GAME
// ==========================================
export function AnimalConnectGame() {
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);

  const animals = [
    { id: 'octopus', name: '小章鱼', emoji: '🐙', color: 'blue', label: '蓝色' },
    { id: 'giraffe', name: '长颈鹿', emoji: '🦒', color: 'yellow', label: '黄色' },
    { id: 'pig', name: '小松戴/粉猪', emoji: '🐷', color: 'red', label: '红色' }
  ];

  const paintColors = [
    { id: 'red', splat: '🔴', label: '红色' },
    { id: 'yellow', splat: '🟡', label: '黄色' },
    { id: 'blue', splat: '🔵', label: '蓝色' }
  ];

  const handleConnect = (colorId: string) => {
    if (!selectedAnimal) return;
    const anim = animals.find(a => a.id === selectedAnimal);
    if (!anim) return;

    if (anim.color === colorId) {
      playSynthSound('success');
      const updated = { ...connections, [selectedAnimal]: colorId };
      setConnections(updated);
      setSelectedAnimal(null);

      if (Object.keys(updated).length === animals.length) {
        setComplete(true);
        confetti({ particleCount: 75, spread: 50 });
        speakText("连线全部正确！太聪明啦！");
      }
    } else {
      playSynthSound('fail');
      speakText(`${anim.name}不是${colorId === 'red' ? '红色' : colorId === 'yellow' ? '黄色' : '蓝色'}哦，再找找看`);
    }
  };

  const handleReset = () => {
    setSelectedAnimal(null);
    setConnections({});
    setComplete(false);
    speakText("彩线已收回，小动物们都在等你的再次体验派对哦！");
  };

  return (
    <div className="w-full h-full bg-slate-900/5 flex flex-col md:flex-row relative select-none">
      
      {/* Board Display */}
      <div className="w-full md:w-[73%] h-[50%] md:h-full bg-slate-950 p-6 flex flex-col justify-center items-center relative">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 relative flex shadow-2xl justify-between items-center z-10 gap-8">
          
          {/* Animals Column */}
          <div className="flex flex-col gap-6">
            {animals.map((anim) => {
              const connected = connections[anim.id] !== undefined;
              return (
                <button
                  key={anim.id}
                  onClick={() => {
                    if (connected) return;
                    playSynthSound('click');
                    setSelectedAnimal(anim.id === selectedAnimal ? null : anim.id);
                  }}
                  disabled={connected}
                  className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center border shadow-md relative transition-all duration-300
                    ${connected ? 'bg-emerald-500/10 border-emerald-400 opacity-60' : ''}
                    ${selectedAnimal === anim.id ? 'bg-blue-600 border-blue-400 text-white scale-105' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}
                  `}
                >
                  <span className="text-4xl mb-1">{anim.emoji}</span>
                  <span className="text-sm font-extrabold">{anim.name}</span>
                </button>
              );
            })}
          </div>

          {/* Lines / Visual Connections overlay (SVG format) */}
          <div className="absolute inset-y-0 left-36 right-36 pointer-events-none">
            <svg className="w-full h-full text-blue-500" style={{ mixBlendMode: 'screen' }}>
              {Object.entries(connections).map(([animalId, colorId]) => {
                const aIdx = animals.findIndex(a => a.id === animalId);
                const cIdx = paintColors.findIndex(c => c.id === colorId);
                const y1 = 16.6 + aIdx * 33.3; // estimated %
                const y2 = 16.6 + cIdx * 33.3;
                return (
                  <motion.line 
                    initial={{ pathLength: 0 }} 
                    animate={{ pathLength: 1 }} 
                    key={animalId} 
                    x1="0%" y1={`${y1}%`} x2="100%" y2={`${y2}%`} 
                    stroke={colorId === 'red' ? '#ef4444' : colorId === 'yellow' ? '#f59e0b' : '#3b82f6'} 
                    strokeWidth="6" strokeLinecap="round" strokeDasharray="6 3 animate-pulse"
                  />
                );
              })}
            </svg>
          </div>

          {/* Color splats Column */}
          <div className="flex flex-col gap-6">
            {paintColors.map((color) => {
              const connected = Object.values(connections).includes(color.id);
              return (
                <button
                  key={color.id}
                  onClick={() => handleConnect(color.id)}
                  disabled={!selectedAnimal || connected}
                  className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center border shadow-md relative transition-all duration-300
                    ${connected ? 'bg-emerald-500/10 border-emerald-400 opacity-60' : ''}
                    ${selectedAnimal ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500/50 hover:scale-105 cursor-pointer' : 'bg-slate-800/40 border-slate-800/40 text-slate-600'}
                  `}
                >
                  <span className="text-5xl">{color.splat}</span>
                  <span className="text-xs font-bold mt-1">{color.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Side Content Panel */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white border-l border-slate-200 shadow-xl relative">
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold w-max mb-3">智慧闯关 1</span>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4 leading-tight">小伙伴爱上颜色</h1>
        <p className="text-base text-slate-600 leading-relaxed mb-6 font-sans">
          小朋友，动动你的手指，帮帮小动物们找到他们最心爱的颜色吧！<br />
          先<b>选择左边的一只小动物</b>，然后<b>选择右边匹配的颜色彩墨</b>吧。
        </p>

        {complete ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <Trophy className="text-yellow-500 w-8 h-8 animate-bounce shrink-0" />
            <div>
              <h4 className="font-extrabold text-emerald-800">全部连接成功！</h4>
              <p className="text-emerald-600 text-xs">小章鱼配蓝色、长颈鹿配黄色、小粉猪配红色！</p>
            </div>
          </div>
        ) : selectedAnimal ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-xs font-bold animate-pulse">
            目标：请在右边点击连接的颜色彩墨！
          </div>
        ) : (
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 text-xs font-bold">
            连线步骤：先选择左边一个小动物吧。
          </div>
        )}

        {/* 再次体验 Replay Button */}
        <button
          onClick={handleReset}
          className="mt-6 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-sm"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          再次体验 🔄
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 7. SHAPE COLORING GAME
// ==========================================
export function ShapeColoringGame() {
  const [selectedBrush, setSelectedBrush] = useState<'red' | 'yellow' | 'blue' | null>(null);
  const [coloredShapes, setColoredShapes] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);

  // House: blue, Plane: yellow, Car: red
  const shapes = [
    { id: 'car', name: '玩具赛车', outline: '🚗', color: 'red', label: '红色' },
    { id: 'plane', name: '太空大飞机', outline: '✈️', color: 'yellow', label: '黄色' },
    { id: 'house', name: '蓝色小房子', outline: '🏠', color: 'blue', label: '蓝色' }
  ];

  const handlePaint = (shapeId: string) => {
    if (!selectedBrush) {
      speakText("请先选个油漆刷子哦");
      return;
    }
    const s = shapes.find(x => x.id === shapeId);
    if (!s) return;

    if (s.color === selectedBrush) {
      playSynthSound('success');
      const updated = { ...coloredShapes, [shapeId]: selectedBrush };
      setColoredShapes(updated);
      setSelectedBrush(null);

      if (Object.keys(updated).length === shapes.length) {
        setComplete(true);
        confetti({ particleCount: 80, spread: 60 });
        speakText("连涂游戏顺利通过！你是一个伟大的小画家！");
      }
    } else {
      playSynthSound('fail');
      speakText("颜色的搭配弄错啦，重新想一想。");
    }
  };

  const handleReset = () => {
    setSelectedBrush(null);
    setColoredShapes({});
    setComplete(false);
    speakText("调色盘清空啦，再次体验涂色魔法吧！");
  };

  return (
    <div className="w-full h-full bg-slate-900/5 select-none flex flex-col md:flex-row relative">
      
      {/* Visual Canvas Panel */}
      <div className="w-full md:w-[73%] h-[50%] md:h-full bg-slate-900 flex flex-col p-6 text-white justify-between relative">
        <div className="absolute inset-0 bg-radial-gradient from-slate-900 to-indigo-950 opacity-50 pointer-events-none" />
        
        {/* Paint Brushes */}
        <div className="flex justify-center gap-6 relative z-10 py-2 border-b border-slate-800/40">
          {(['red', 'yellow', 'blue'] as const).map((color) => (
            <button
              key={color}
              onClick={() => {
                playSynthSound('click');
                setSelectedBrush(color);
              }}
              className={`px-5 py-2.5 rounded-full font-black flex items-center gap-2 border shadow-lg transition-all
                ${color === 'red' ? 'bg-red-600 text-white border-red-500 hover:bg-red-500' : ''}
                ${color === 'yellow' ? 'bg-amber-400 text-slate-800 border-amber-300 hover:bg-amber-300' : ''}
                ${color === 'blue' ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500' : ''}
                ${selectedBrush === color ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-900 scale-108' : ''}
              `}
            >
              <span>🖌️</span>
              <span>{color === 'red' ? '红画刷-赛车' : color === 'yellow' ? '黄画刷-飞机' : '蓝画刷-房子'}</span>
            </button>
          ))}
        </div>

        {/* Outline shapes */}
        <div className="flex-1 grid grid-cols-3 gap-6 items-center p-4 relative z-10">
          {shapes.map((s) => {
            const isPainted = coloredShapes[s.id] !== undefined;
            return (
              <div
                key={s.id}
                onClick={() => handlePaint(s.id)}
                className={`h-full max-h-[180px] rounded-2xl flex flex-col items-center justify-center border-4 cursor-pointer transition-all duration-300 select-none
                  ${isPainted 
                    ? s.color === 'red' ? 'bg-red-500/20 border-red-500 text-white' : s.color === 'yellow' ? 'bg-amber-500/20 border-amber-400 text-white' : 'bg-blue-500/20 border-blue-500 text-white'
                    : 'border-slate-700/60 bg-slate-800/40 text-slate-500'
                  }
                  ${selectedBrush && !isPainted ? 'hover:scale-102 hover:border-slate-500 border-dashed' : ''}
                `}
              >
                <span className={`text-7xl mb-2 transition-transform duration-300 ${isPainted ? 'scale-115 text-white' : 'filter grayscale contrast-50 opacity-40'}`}>
                  {s.outline}
                </span>
                <span className="font-extrabold text-sm tracking-wide">{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Narrative Side block */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white border-l border-slate-200 shadow-xl relative">
        <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold w-max mb-3">智慧闯关 2</span>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4 font-sans">七彩轮廓涂色卡</h1>
        <p className="text-base text-slate-600 leading-relaxed mb-6 font-sans">
          画刷能给黑白的赛车、飞机和房屋注入生命力。
          请<b>选择一款彩色画刷</b>，然后<b>点击对应的黑白物体轮廓</b>为其着色匹配。
        </p>

        {complete ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <Heart className="text-red-500 w-8 h-8 fill-current shrink-0" />
            <div>
              <h4 className="font-extrabold text-emerald-800">着色大功告成！</h4>
              <p className="text-emerald-600 text-xs">红色的玩具赛车、黄色的飞机和蓝色的房子真漂亮！</p>
            </div>
          </div>
        ) : selectedBrush ? (
          <div className="p-4 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold animate-pulse">
            画笔已就绪：点击中间的黑白结构填图吧！
          </div>
        ) : (
          <div className="p-4 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
            第一步：请先在上方任选一款精美的彩色画刷！
          </div>
        )}

        {/* 再次体验 Replay Button */}
        <button
          onClick={handleReset}
          className="mt-6 w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-sm"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          再次体验 🔄
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 8. DOUBLE COLOR MATRIX PUZZLE
// ==========================================
export function DoubleColorGame() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [correctFlags, setCorrectFlags] = useState<Record<number, boolean>>({});
  const [complete, setComplete] = useState(false);

  const columnLeft = [
    { id: 1, colors: ['🔴', '🟡'], label: '红 + 黄 双生泡泡' },
    { id: 2, colors: ['🔵', '🔴'], label: '蓝 + 红 双生泡泡' },
    { id: 3, colors: ['🔵', '🟡'], label: '蓝 + 黄 双生泡泡' },
    { id: 4, colors: ['🔴', '🔵'], label: '红 + 蓝 双生泡泡' }
  ];

  const columnRight = [
    { targetId: 2, scheme: ['🔵', '🔴'], label: '左蓝右红 积木板' },
    { targetId: 3, scheme: ['🔵', '🟡'], label: '左蓝右黄 积木板' },
    { targetId: 1, scheme: ['🔴', '🟡'], label: '左红右黄 积木板' },
    { targetId: 4, scheme: ['🔴', '🔵'], label: '左红右蓝 积木板' }
  ];

  const handleMatch = (targetId: number) => {
    if (!selectedId) return;

    if (selectedId === targetId) {
      playSynthSound('success');
      const updated = { ...correctFlags, [selectedId]: true };
      setCorrectFlags(updated);
      setSelectedId(null);

      if (Object.keys(updated).length === columnLeft.length) {
        setComplete(true);
        confetti({ particleCount: 90, spread: 60 });
        speakText("左侧积木配对全部通关！");
      }
    } else {
      playSynthSound('fail');
      speakText("这边的颜色组合和左侧的不一样哦");
    }
  };

  const handleReset = () => {
    setSelectedId(null);
    setCorrectFlags({});
    setComplete(false);
    speakText("双色泡泡积木板重置成功，再次体验拼拼乐吧！");
  };

  return (
    <div className="w-full h-full bg-slate-900/5 select-none flex flex-col md:flex-row relative">
      <div className="w-full md:w-[73%] h-[50%] md:h-full bg-slate-950 flex p-6 items-center justify-center relative">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 flex justify-between shadow-2xl relative z-10 gap-10 items-stretch">
          
          {/* Left Column - Double colors bubble */}
          <div className="flex flex-col justify-between gap-4 flex-1">
            {columnLeft.map((item) => {
              const matched = correctFlags[item.id] !== undefined;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (matched) return;
                    playSynthSound('click');
                    setSelectedId(item.id === selectedId ? null : item.id);
                  }}
                  disabled={matched}
                  className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all duration-300
                    ${matched ? 'bg-emerald-500/10 border-emerald-400 opacity-60 pointer-events-none' : ''}
                    ${selectedId === item.id ? 'bg-blue-600 border-blue-400 text-white scale-102 ring-2 ring-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}
                  `}
                >
                  <div className="flex gap-1 text-2xl">
                    {item.colors.map((emoji, idx) => (
                      <span key={idx}>{emoji}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="w-0.5 bg-slate-800" />

          {/* Right Column - Double block brick template */}
          <div className="flex flex-col justify-between gap-4 flex-1">
            {columnRight.map((r, i) => {
              const matched = correctFlags[r.targetId] !== undefined;
              return (
                <button
                  key={i}
                  onClick={() => handleMatch(r.targetId)}
                  disabled={!selectedId || matched}
                  className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300
                    ${matched ? 'bg-emerald-500/10 border-emerald-400 opacity-60 pointer-events-none' : ''}
                    ${selectedId ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500 hover:scale-102 cursor-pointer' : 'bg-slate-800/40 border-slate-800/40 text-slate-500'}
                  `}
                >
                  {/* Visual Crayon lego block */}
                  <div className="flex w-16 h-8 rounded-md overflow-hidden border border-slate-700 shadow-inner">
                    <div 
                      className="flex-1" 
                      style={{ 
                        backgroundColor: r.scheme[0] === '🔴' ? '#ef4444' : r.scheme[0] === '🟡' ? '#fec53d' : '#3b82f6' 
                      }} 
                    />
                    <div 
                      className="flex-1" 
                      style={{ 
                        backgroundColor: r.scheme[1] === '🔴' ? '#ef4444' : r.scheme[1] === '🟡' ? '#fec53d' : '#3b82f6' 
                      }} 
                    />
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Narration Sidebar */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white border-l border-slate-200 shadow-xl relative">
        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold w-max mb-3">智慧闯关 3</span>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4 leading-tight">双色积木对对碰</h1>
        <p className="text-base text-slate-600 leading-relaxed mb-6 font-sans">
          摆一摆，连一连。对照左边积木板的图案配色，把左右两半部分的颜色组合相同的连线相连配对！
        </p>

        {complete ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500 w-8 h-8 shrink-0" />
            <div>
              <h4 className="font-extrabold text-emerald-800">通过成功！</h4>
              <p className="text-emerald-600 text-xs">你的积木结构观察力和小布米一样优秀啦！</p>
            </div>
          </div>
        ) : selectedId ? (
          <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold animate-pulse">
            目标：请点击右边对应颜色拼接组合的积木模板！
          </div>
        ) : (
          <div className="p-4 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
            步骤：先从左边的双色泡泡彩珠堆里选一串吧！
          </div>
        )}

        {/* 再次体验 Replay Button */}
        <button
          onClick={handleReset}
          className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-sm"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          再次体验 🔄
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 9. SPACE STATION DRAG SHELF GAME
// ==========================================
export function SpaceStationDragGame() {
  const [gridItems, setGridItems] = useState<Record<number, string>>({});
  const [complete, setComplete] = useState(false);

  const referenceCard = {
    0: '🔴', 1: '🟡', 2: '🔵',
    3: '🔵', 4: '🔴', 5: '🟡',
    6: '🟡', 7: '🔵', 8: '🔴'
  };

  const colors = [
    { id: 'red', emoji: '🔴', css: 'bg-red-500 hover:bg-red-400 ring-red-300' },
    { id: 'yellow', emoji: '🟡', css: 'bg-amber-400 hover:bg-amber-300 ring-amber-200' },
    { id: 'blue', emoji: '🔵', css: 'bg-blue-600 hover:bg-blue-500 ring-blue-300' }
  ];

  const handleDragDropBlock = (gridIndex: number, emoji: string) => {
    playSynthSound('click');
    const updated = { ...gridItems, [gridIndex]: emoji };
    setGridItems(updated);

    // Check if matching reference exactly
    let match = true;
    for (let i = 0; i < 9; i++) {
      if (updated[i] !== referenceCard[i as keyof typeof referenceCard]) {
        match = false;
        break;
      }
    }

    if (match) {
      setComplete(true);
      playSynthSound('success');
      confetti({ particleCount: 100, spread: 80 });
      speakText("积木对应、位置拼搭匹配无误！恭喜我们胜利！");
    }
  };

  const handleReset = () => {
    setGridItems({});
    setComplete(false);
    speakText("空间站已清空，再次体验宇宙的快乐拼搭吧！");
  };

  return (
    <div className="w-full h-full bg-slate-900/5 select-none flex flex-col md:flex-row relative">
      <div className="w-full md:w-[73%] h-[50%] md:h-full bg-slate-900 p-6 flex flex-col items-center justify-center text-white relative">
        <div className="absolute inset-0 bg-radial-gradient from-slate-950 to-slate-900 opacity-60 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center z-10 w-full max-w-2xl px-4">
          
          {/* Grid Shelf System */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-bold text-slate-400 tracking-wider">空间站柜：3x3积木架</span>
            <div className="grid grid-cols-3 gap-3 w-64 h-64 bg-slate-950 p-4 rounded-3xl border-4 border-slate-800 shadow-2xl relative">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900/80 rounded-xl flex items-center justify-center text-3xl font-bold border border-slate-800 relative hover:border-slate-500 group transition-all"
                >
                  {gridItems[i] ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="cursor-pointer">{gridItems[i]}</motion.span>
                  ) : (
                    <span className="text-xs text-slate-700 font-mono">
                      {i + 1}
                    </span>
                  )}
                  
                  {/* Floating click options for kid compatibility */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex gap-0.5 justify-center items-center bg-slate-950/90 rounded-xl transition">
                    {colors.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => handleDragDropBlock(i, c.emoji)}
                        className="w-5 h-5 text-[10px] rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700"
                      >
                        {c.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block w-px h-64 bg-slate-800" />

          {/* Reference Card Scheme */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-bold text-slate-400 tracking-wider">任务卡：拼搭对照样板</span>
            <div className="grid grid-cols-3 gap-1.5 w-44 h-44 bg-slate-950 p-3 rounded-2xl border-2 border-slate-700 shadow-lg">
              {Object.entries(referenceCard).map(([idx, emoji]) => (
                <div key={idx} className="bg-slate-900 rounded-lg flex items-center justify-center text-xl border border-slate-800 select-none">
                  {emoji}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Clear control */}
        <button 
          onClick={() => {
            playSynthSound('click');
            setGridItems({});
            setComplete(false);
          }}
          className="absolute bottom-6 right-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-sm flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw size={14} /> 清空拼搭架
        </button>
      </div>

      {/* narrative sidebar */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white border-l border-slate-200 shadow-xl relative">
        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold w-max mb-3 font-mono">空间站拼搭</span>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-4 font-sans leading-tight">颜色空间站建设</h1>
        <p className="text-base text-slate-600 leading-relaxed mb-6 font-sans">
          空间站里有很多小格子隔间。在格子上选择<b>红、黄、蓝积木</b>，让它们住进去！
          请摆弄直到整个<b>3x3拼搭架</b>和右侧的<b>任务对照卡</b>图案保持完全一致！
        </p>

        {complete ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <Trophy className="text-yellow-500 w-10 h-10 animate-bounce shrink-0" />
            <div>
              <h4 className="font-extrabold text-emerald-800">匹配神契！建造成功</h4>
              <p className="text-emerald-600 text-xs">你是个天才指挥官，空间站正式通电启动！</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-100 border border-slate-250 text-slate-500 text-xs font-bold">
            拼图小提示：第1格红，第2格黄，第3格蓝... 依次搭建！
          </div>
        )}

        {/* 再次体验 Replay Button */}
        <button
          onClick={handleReset}
          className="mt-6 w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-sm"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          再次体验 🔄
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 10. COLOR SUDOKU GAME (3x3 UNIQUE)
// ==========================================
export function ColorSudokuGame() {
  const [board, setBoard] = useState<Record<number, 'red' | 'yellow' | 'blue' | null>>({
    0: null, 1: null, 2: null,
    3: null, 4: null, 5: null,
    6: null, 7: null, 8: null
  });
  const [complete, setComplete] = useState(false);
  const [errorCells, setErrorCells] = useState<number[]>([]);

  // Fixed initials to assist kids (sudoku hint)
  useEffect(() => {
    setBoard({
      0: 'red',    1: null,     2: null,
      3: null,     4: 'yellow', 5: null,
      6: null,     7: null,     8: 'blue'
    });
  }, []);

  const handleSelectColor = (index: number, color: 'red' | 'yellow' | 'blue') => {
    // 0, 4, 8 are locked presets
    if (index === 0 || index === 4 || index === 8) return;

    playSynthSound('click');
    const updated = { ...board, [index]: color };
    setBoard(updated);

    // Validate rows, cols and duplicates
    const errorList: number[] = [];

    // Check rows: [0,1,2], [3,4,5], [6,7,8]
    const rowIndexes = [[0,1,2], [3,4,5], [6,7,8]];
    rowIndexes.forEach((row) => {
      const vals = row.map(i => updated[i]).filter(Boolean);
      const set = new Set(vals);
      if (vals.length !== set.size) { // duplicates found
        row.forEach(i => { if (updated[i]) errorList.push(i); });
      }
    });

    // Check columns: [0,3,6], [1,4,7], [2,5,8]
    const colIndexes = [[0,3,6], [1,4,7], [2,5,8]];
    colIndexes.forEach((col) => {
      const vals = col.map(i => updated[i]).filter(Boolean);
      const set = new Set(vals);
      if (vals.length !== set.size) { // duplicates found
        col.forEach(i => { if (updated[i]) errorList.push(i); });
      }
    });

    setErrorCells(Array.from(new Set(errorList)));

    // Check complete and correct
    let isFinished = true;
    for (let i = 0; i < 9; i++) {
       if (!updated[i]) isFinished = false;
    }

    if (isFinished && errorList.length === 0) {
      setComplete(true);
      playSynthSound('success');
      confetti({ particleCount: 120, spread: 90 });
      speakText("颜色数独太厉害啦！每一行每一列都完全不重复！");
    } else {
      setComplete(false);
    }
  };

  const clearNonPreset = () => {
    playSynthSound('click');
    setBoard({
      0: 'red',    1: null,     2: null,
      3: null,     4: 'yellow', 5: null,
      6: null,     7: null,     8: 'blue'
    });
    setErrorCells([]);
    setComplete(false);
  };

  return (
    <div className="w-full h-full bg-slate-900/5 select-none flex flex-col md:flex-row relative">
      <div className="w-full md:w-[73%] h-[50%] md:h-full bg-slate-900 p-6 flex flex-col items-center justify-center text-white relative">
        <div className="absolute inset-0 bg-radial-gradient from-slate-950 to-slate-900 opacity-60 pointer-events-none" />
        
        <div className="flex flex-col gap-6 items-center justify-center z-10">
          
          <span className="text-sm font-extrabold text-amber-400 tracking-wider">智能九宫格颜色数独</span>
          
          <div className="grid grid-cols-3 gap-3 w-72 h-72 bg-slate-950 p-4 rounded-[2rem] border-4 border-slate-700 shadow-2xl relative">
            {[...Array(9)].map((_, i) => {
              const val = board[i];
              const isLocked = i === 0 || i === 4 || i === 8;
              const hasError = errorCells.includes(i);
              
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl flex flex-col items-center justify-center text-3xl font-semibold border-2 transition-all group
                    ${isLocked ? 'bg-slate-800 border-slate-600 font-extrabold cursor-not-allowed select-none' : 'bg-slate-900 border-slate-800 hover:border-slate-500'}
                    ${hasError ? 'border-red-500 bg-red-950/20 animate-wiggle' : ''}
                  `}
                >
                  {val === 'red' && <span>🔴</span>}
                  {val === 'yellow' && <span>🟡</span>}
                  {val === 'blue' && <span>🔵</span>}
                  
                  {!val && <span className="text-xs text-slate-700 font-mono italic">
                    待填
                  </span>}

                  {isLocked && (
                    <span className="absolute bottom-1 right-2 text-[10px] text-amber-500 opacity-60 font-mono select-none">
                      🔒
                    </span>
                  )}

                  {/* Interactivity tools */}
                  {!isLocked && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex gap-1 justify-center items-center bg-slate-950/95 rounded-2xl transition duration-200">
                      <button onClick={() => handleSelectColor(i, 'red')} className="w-6 h-6 text-xs rounded-full bg-red-600 hover:scale-110 active:scale-90 shadow">🔴</button>
                      <button onClick={() => handleSelectColor(i, 'yellow')} className="w-6 h-6 text-xs rounded-full bg-amber-400 hover:scale-110 active:scale-90 shadow">🟡</button>
                      <button onClick={() => handleSelectColor(i, 'blue')} className="w-6 h-6 text-xs rounded-full bg-blue-600 hover:scale-110 active:scale-90 shadow">🔵</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={clearNonPreset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 border border-slate-700"
            >
              <RefreshCw size={12} /> 格局重置
            </button>
          </div>

        </div>
      </div>

      {/* side content */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white border-l border-slate-200 shadow-xl relative">
        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold w-max mb-3">智慧闯关 5</span>
        <h1 className="text-2xl font-extrabold text-slate-800 mb-4 font-sans leading-tight">宫格九宫数独棋</h1>
        <p className="text-base text-slate-600 leading-relaxed mb-6 font-sans">
          最后的高难度终极挑战来啦！颜色数独棋。<br />
          请在空白格处放置<b>红、黄、蓝</b>积木，使得<b>每一行、每一列</b>里都不能有重复颜色的积木。
        </p>

        {complete ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <Trophy className="text-yellow-500 w-10 h-10 animate-bounce shrink-0" />
            <div>
              <h4 className="font-extrabold text-emerald-800">挑战成功！数独大宗师</h4>
              <p className="text-emerald-600 text-xs font-sans">你完全解答了这个高等级思维数独难题，真棒！</p>
            </div>
          </div>
        ) : errorCells.length > 0 ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <AlertCircle className="text-red-500 w-8 h-8 shrink-0 animate-pulse" />
            <div>
              <h4 className="font-extrabold text-red-800">出线颜色重复冲突！</h4>
              <p className="text-red-600 text-xs text-left">观察高亮为红框的格子，调整它们使其避免冲突。</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-2xl text-indigo-700 text-xs font-bold flex items-center gap-2">
            💡 小贴士：横排、竖排，都只放红、黄、蓝各一个哦！
          </div>
        )}

        {/* 再次体验 Replay Button */}
        <button
          onClick={clearNonPreset}
          className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-sm"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          再次体验 🔄
        </button>
      </div>
    </div>
  );
}
