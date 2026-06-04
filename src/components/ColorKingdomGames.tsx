import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Sparkles, AlertCircle, CheckCircle2, 
  RefreshCw, Trophy, ArrowRight, ArrowLeft,
  Pause
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
// 4_PREP. COLOR PREPARATION GAME (取教具环节)
// ==========================================
export function ColorPrepGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [checkedItems, setCheckedItems] = useState({
    paint: false,
    board: false,
    trays: false
  });
  const [speechText, setSpeechText] = useState("小朋友，请根据清单准备我们今天的教具物品哦！");

  useEffect(() => {
    // Create the audio element for preparing tools music
    audioRef.current = new Audio("https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/%E5%8F%96%E6%95%99%E5%85%B7%E9%9F%B3%E4%B9%90.mp3");
    audioRef.current.loop = true;

    // Speak initial intro
    speakText("小朋友，要开始动手实操啦！请跟着节奏音乐，根据清单准备好这些教具吧！准备好了就点击它们给它们盖上小蜜蜂印章哦！");

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      playSynthSound('click');
      setSpeechText("音乐暂停了，等你准备好可以再次播放哦！");
      speakText("音乐暂停。");
    } else {
      audioRef.current.play().catch(err => console.log("Audio play error", err));
      setIsPlaying(true);
      playSynthSound('click');
      setSpeechText("听着节奏动起来！我们先准备红黄蓝三色颜料画笔、实操棋盘和卡纸。");
      speakText("播放备课音乐。");
    }
  };

  const handleToggleCheck = (key: 'paint' | 'board' | 'trays', label: string) => {
    setCheckedItems(prev => {
      const isChecking = !prev[key];
      const updated = { ...prev, [key]: isChecking };
      
      if (isChecking) {
        playSynthSound('success');
        setSpeechText(`好棒！你已经准备好了：${label} 🌟`);
        speakText(`准备好了${label}`);
        
        // If all checked
        if (updated.paint && updated.board && updated.trays) {
          setTimeout(() => {
            playSynthSound('popup');
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 }
            });
            setSpeechText("大功告成！所有教具完美准备就绪，让我们进入颜色王国开始智慧大闯关吧！🚀");
            speakText("哇，太棒了！所有教具准备完整，你可以点击下一页进入闯关挑战啦！");
          }, 800);
        }
      } else {
        playSynthSound('click');
        setSpeechText(`已取消选中：${label}`);
      }
      return updated;
    });
  };

  const handleReset = () => {
    setCheckedItems({ paint: false, board: false, trays: false });
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSpeechText("教具清单已重置，请重新跟着音乐准备哦！");
    speakText("重新准备，加油宝贝！");
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col p-4 md:p-8 select-none items-center justify-center">
      {/* 16:9 Inner Slide Container */}
      <div className="relative w-full max-w-5xl aspect-video bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200">
        
        {/* Background Image: the actual template slide */}
        <img
          src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P7.png"
          alt="取教具环节 P7"
          className="w-full h-full object-contain pointer-events-none select-none"
          referrerPolicy="no-referrer"
        />

        {/* ========================================================= */}
        {/* INTERACTIVE HOTSPOTS OVERLAID VIA EXACT PERCENTAGES       */}
        {/* ========================================================= */}

        {/* 1. Paint/Splash Area Hotspot */}
        <div 
          onClick={() => handleToggleCheck('paint', '红黄蓝三色画笔颜料')}
          className="absolute left-[14%] top-[16%] w-[41%] h-[23%] cursor-pointer group flex items-center justify-center rounded-2xl transition hover:bg-emerald-500/10 border-2 border-transparent hover:border-emerald-500/30"
          title="点击标记：已准备墨水/颜料"
        >
          {checkedItems.paint ? (
            <motion.div 
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute inset-0 bg-emerald-500/15 backdrop-blur-xs flex items-center justify-center rounded-2xl border-4 border-emerald-500/70"
            >
              <div className="bg-emerald-600 text-white rounded-full p-2 md:p-3 shadow-xl flex items-center gap-2">
                <CheckCircle2 size={20} className="animate-bounce" />
                <span className="font-extrabold text-xs md:text-sm pr-1">颜料准备就绪!</span>
              </div>
            </motion.div>
          ) : (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md transition-all">
              点击准备好的物品 🎯
            </div>
          )}
        </div>

        {/* 2. Wooden Base Board Area Hotspot */}
        <div 
          onClick={() => handleToggleCheck('board', '实操双色棋盘底板')}
          className="absolute left-[10%] top-[43%] w-[25%] h-[42%] cursor-pointer group flex items-center justify-center rounded-2xl transition hover:bg-teal-500/10 border-2 border-transparent hover:border-teal-500/30"
          title="点击标记：已准备双色球游戏板"
        >
          {checkedItems.board ? (
            <motion.div 
              initial={{ scale: 0, rotate: 12 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute inset-0 bg-teal-500/15 backdrop-blur-xs flex items-center justify-center rounded-2xl border-4 border-teal-500/70"
            >
              <div className="bg-teal-600 text-white rounded-full p-2 md:p-3 shadow-xl flex items-center gap-2">
                <CheckCircle2 size={20} className="animate-bounce" />
                <span className="font-extrabold text-xs md:text-sm pr-1">棋盘准备就绪!</span>
              </div>
            </motion.div>
          ) : (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md transition-all">
              点击准备好的物品 🎯
            </div>
          )}
        </div>

        {/* 3. Cardboard Grids / Paper Area Hotspot */}
        <div 
          onClick={() => handleToggleCheck('trays', '九宫格和十连卡纸')}
          className="absolute left-[37%] top-[49%] w-[20%] h-[31%] cursor-pointer group flex items-center justify-center rounded-2xl transition hover:bg-sky-500/10 border-2 border-transparent hover:border-sky-500/30"
          title="点击标记：已准备九宫数独卡纸与拼搭底卡"
        >
          {checkedItems.trays ? (
            <motion.div 
              initial={{ scale: 0, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute inset-0 bg-sky-500/15 backdrop-blur-xs flex items-center justify-center rounded-2xl border-4 border-sky-500/70"
            >
              <div className="bg-sky-600 text-white rounded-full p-2 md:p-3 shadow-xl flex items-center gap-2">
                <CheckCircle2 size={20} className="animate-bounce" />
                <span className="font-extrabold text-xs md:text-sm pr-1">卡纸准备就绪!</span>
              </div>
            </motion.div>
          ) : (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md transition-all">
              点击准备好的物品 🎯
            </div>
          )}
        </div>

        {/* 4. Orange Music Action Audio Note (Interactive Play/Pause Hotspot) */}
        <div 
          onClick={handleToggleMusic}
          className="absolute left-[67.3%] top-[78%] w-[5.2%] h-[10%] cursor-pointer rounded-xl flex items-center justify-center bg-transparent group"
          title="播放/暂停 取教具音乐"
        >
          {/* Animated floating notes when music is active */}
          {isPlaying && (
            <>
              <motion.div 
                animate={{ y: [-15, -45], x: [-10, 5], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="absolute text-orange-500 text-xl font-bold select-none pointer-events-none"
              >
                🎵
              </motion.div>
              <motion.div 
                animate={{ y: [-20, -55], x: [10, -5], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: 0.5 }}
                className="absolute text-amber-500 text-lg font-bold select-none pointer-events-none"
              >
                🎶
              </motion.div>
              {/* Outer pulsing ring ring indicator */}
              <div className="absolute inset-[-10px] rounded-2xl border-4 border-orange-500 border-dashed animate-ping opacity-60 pointer-events-none" />
            </>
          )}

          {/* Interactive Toggle Center Button overlaying on top of the note */}
          <div className={`w-full h-full rounded-2xl flex items-center justify-center transition-all shadow-md group-hover:scale-110 active:scale-95 border-2 ${
            isPlaying ? 'bg-orange-500 text-white border-white animate-pulse' : 'bg-orange-100/30 border-orange-400 group-hover:bg-orange-400/20'
          }`}>
            {isPlaying ? <Pause size={16} className="fill-current text-white" /> : <Play size={16} className="fill-current text-orange-600" />}
          </div>
        </div>

        {/* 5. Speech Bubble for Dr. Zhang's overlay */}
        <div className="absolute right-[26%] top-[38%] max-w-[200px] pointer-events-auto">
          <motion.div 
            key={speechText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 border border-indigo-200 shadow-xl px-3 py-2 rounded-2xl text-slate-700 font-extrabold text-[10px] md:text-xs text-center relative leading-snug"
          >
            {speechText}
            <div className="absolute -bottom-2 right-4 w-3 h-3 bg-white/95 border-r border-b border-indigo-200 rotate-45" />
          </motion.div>
        </div>

        {/* Reset button inside the slide for easy replay */}
        <div className="absolute right-[4%] top-[4%] z-10">
          <button 
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1 shadow-md transition active:scale-95"
          >
            <RefreshCw size={10} />
            重置清单 🔄
          </button>
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
            className="rounded-2xl border-2 flex flex-col items-center justify-between p-4 cursor-pointer transition-all duration-300 border-red-900/40 bg-red-950/20"
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
            className="rounded-2xl border-2 flex flex-col items-center justify-between p-4 cursor-pointer transition-all duration-300 border-yellow-900/40 bg-yellow-950/20"
          >
            <div className="text-center w-full pb-2 border-b border-yellow-900/30">
              <span className="text-4xl">🟡</span>
              <div className="font-extrabold text-yellow-500 text-sm mt-1">黄色收集格</div>
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
            className="rounded-2xl border-2 flex flex-col items-center justify-between p-4 cursor-pointer transition-all duration-300 border-blue-900/40 bg-blue-950/20"
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
              className="px-10 py-6 rounded-[2.5rem] bg-white text-slate-900 flex items-center gap-4 border-4 border-amber-300 shadow-2xl scale-[1.65] cursor-grab active:cursor-grabbing font-black relative min-w-[210px] justify-center transition-all"
            >
              <span className="text-5xl">{activeItem.icon}</span>
              <span className="text-xl">{activeItem.label}</span>
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
            </motion.div>
          )}

        </div>
      </div>

      {/* Intro Panel sidebar */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white border-l border-slate-200 shadow-xl relative">
        <div className="mb-4">
          <span className="px-6 py-2.5 bg-violet-100 border-2 border-violet-200 text-violet-800 rounded-2xl text-base md:text-lg font-black tracking-wide inline-block shadow-sm">实操交互 🧩</span>
        </div>
        <p className="text-base text-slate-600 leading-relaxed mb-6 font-sans font-extrabold">
          点击魔法底下的宝箱，召唤颜色王国的宝贝！然后把召唤出来的宝贝通过<b>点击</b>对应的<b>红、黄、蓝</b>收集框中进行分拣归类吧！
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
    { id: 'octopus', name: '小章鱼', img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/1.jpg', color: 'blue', label: '蓝色' },
    { id: 'giraffe', name: '长颈鹿', img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/3.jpg', color: 'yellow', label: '黄色' },
    { id: 'pig', name: '小松戴/粉猪', img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/2.jpg', color: 'red', label: '红色' }
  ];

  const paintColors = [
    { id: 'red', img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/4.jpg', label: '红色' },
    { id: 'yellow', img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/5.jpg', label: '黄色' },
    { id: 'blue', img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/6.jpg', label: '蓝色' }
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
                  className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center border shadow-md relative transition-all duration-300 overflow-hidden
                    ${connected ? 'bg-emerald-500/10 border-emerald-400 opacity-60' : ''}
                    ${selectedAnimal === anim.id ? 'bg-blue-600 border-blue-400 text-white scale-105' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}
                  `}
                >
                  <img 
                    src={anim.img} 
                    alt={anim.name} 
                    className="w-14 h-14 object-cover rounded-xl mb-1 shadow-inner" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-extrabold">{anim.name}</span>
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
                  className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center border shadow-md relative transition-all duration-300 overflow-hidden
                    ${connected ? 'bg-emerald-500/10 border-emerald-400 opacity-60' : ''}
                    ${selectedAnimal ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500/50 hover:scale-105 cursor-pointer' : 'bg-slate-800/40 border-slate-800/40 text-slate-600'}
                  `}
                >
                  <img 
                    src={color.img} 
                    alt={color.label} 
                    className="w-14 h-14 object-cover rounded-xl mb-1 shadow-inner" 
                    referrerPolicy="no-referrer"
                  />
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
  const [coloredRows, setColoredRows] = useState<Record<string, boolean>>({
    car: false,
    plane: false,
    house: false
  });
  const [complete, setComplete] = useState(false);
  const [helperText, setHelperText] = useState("请先点击右侧彩色颜料溅溅选择画刷，再点击左侧对应黑白结构图到着色连线！");

  useEffect(() => {
    speakText("小朋友，太空大飞机是黄色的，玩具赛车是红色的，蓝色小房子是蓝色的，请在右侧选择对应的颜料，把他们连起来并着色吧！");
  }, []);

  // Colored references shown at top
  const references = [
    { id: 'plane', img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/GAME2/8.jpg', name: '黄色：太空大飞机', color: 'yellow' },
    { id: 'car', img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/GAME2/9.jpg', name: '红色：玩具赛车', color: 'red' },
    { id: 'house', img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/GAME2/10.jpg', name: '蓝色：蓝色小房子', color: 'blue' }
  ];

  // Map rows: Silhouette to Splash with color matching
  const matchingRows = [
    { 
      id: 'house', 
      outline: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/GAME2/11.jpg', 
      colored: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/GAME2/10.jpg',
      colorKey: 'blue' as const, 
      colorName: '蓝色',
      title: '蓝色小房子',
      splashImg: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/6.jpg'
    },
    { 
      id: 'plane', 
      outline: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/GAME2/12.jpg', 
      colored: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/GAME2/8.jpg',
      colorKey: 'yellow' as const, 
      colorName: '黄色',
      title: '太空大飞机',
      splashImg: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/5.jpg'
    },
    { 
      id: 'car', 
      outline: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/GAME2/13.jpg', 
      colored: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/GAME2/9.jpg',
      colorKey: 'red' as const, 
      colorName: '红色',
      title: '玩具赛车',
      splashImg: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/4.jpg'
    }
  ];

  const palette = [
    { color: 'red' as const, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/4.jpg', label: '红色颜料' },
    { color: 'yellow' as const, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/5.jpg', label: '黄色颜料' },
    { color: 'blue' as const, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/6.jpg', label: '蓝色颜料' }
  ];

  const handleRowClick = (rowId: string, expectedColor: 'red' | 'yellow' | 'blue', title: string) => {
    if (coloredRows[rowId]) {
      speakText(`${title}已经着色连线成功啦！`);
      return;
    }

    if (!selectedBrush) {
      playSynthSound('fail');
      setHelperText("哎呀，小火箭要燃料了！请先选择右侧的彩色颜料吧！");
      speakText("请先在右侧挑一罐你喜欢的彩色颜料吧！");
      return;
    }

    if (selectedBrush === expectedColor) {
      playSynthSound('success');
      const updated = { ...coloredRows, [rowId]: true };
      setColoredRows(updated);
      setSelectedBrush(null);
      setHelperText(`太棒了！你完美连接并着色了：${title}！✨`);
      speakText(`真聪明！着色成功，漂亮的${title}连接好了！`);

      if (updated.car && updated.plane && updated.house) {
        setComplete(true);
        setTimeout(() => {
          playSynthSound('popup');
          confetti({ particleCount: 100, spread: 50 });
          setHelperText("哇！黑白轮廓全部变成彩色的大飞机、小红车和蓝房子啦！你是天才小画家！🎖️");
          speakText("太神奇了！所有的玩具都拥有了艳丽的颜色，我们太棒啦！");
        }, 1000);
      }
    } else {
      playSynthSound('fail');
      setHelperText(`搭配不对哦。对照上方的模型看看：${title}应该是什么颜色的呢？`);
      speakText(`停一停、想一想、再试一试！${title}好像不是这个色哦。`);
    }
  };

  const handleReset = () => {
    setSelectedBrush(null);
    setColoredRows({ car: false, plane: false, house: false });
    setComplete(false);
    setHelperText("调色盘已经重新擦得干干净净啦，我们重新出发！");
    speakText("颜料和画布重置成功，请重新开始挑战吧！");
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col md:flex-row p-4 md:p-8 select-none gap-6 items-stretch">
      
      {/* Left Area: Digital Dynamic Worksheet Panel */}
      <div className="flex-1 md:w-[70%] bg-[#F9F9FB] rounded-[2.5rem] border-4 border-amber-100 p-6 flex flex-col justify-between relative shadow-lg overflow-hidden">
        
        {/* Top Reference Cards Header */}
        <div className="w-full flex flex-col items-center">
          <div className="bg-amber-100 text-amber-800 font-extrabold text-xs md:text-sm px-4 py-1.5 rounded-full mb-4 inline-flex items-center gap-2">
            🎨 参照对照组：瞧瞧他们原本鲜艳美丽的颜色
          </div>
          
          <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
            {references.map((ref) => (
              <div 
                key={ref.id}
                className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-2.5 flex flex-col items-center justify-center relative group overflow-hidden"
              >
                <img 
                  src={ref.img} 
                  alt={ref.name} 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] md:text-xs font-extrabold text-slate-700 mt-2">{ref.name}</span>
                {/* Micro glowing band */}
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${
                  ref.color === 'yellow' ? 'bg-amber-400' : ref.color === 'red' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Middle Matching Rows */}
        <div className="flex-1 w-full flex flex-col justify-center gap-5 my-6 py-2 px-4">
          {matchingRows.map((row) => {
            const isMatched = coloredRows[row.id];
            
            return (
              <div 
                key={row.id}
                onClick={() => handleRowClick(row.id, row.colorKey, row.title)}
                className={`flex items-center justify-between w-full p-2 rounded-2xl border-2 transition-all cursor-pointer select-none group
                  ${isMatched 
                    ? 'bg-emerald-500/5 border-emerald-300' 
                    : selectedBrush === row.colorKey 
                      ? 'border-dashed border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/40' 
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }
                `}
              >
                {/* 1. Outline or Colored figure */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 bg-white shadow-inner flex items-center justify-center rounded-2xl border border-slate-200 overflow-hidden">
                  <img 
                    src={isMatched ? row.colored : row.outline} 
                    alt={row.title}
                    className="w-14 h-14 md:w-16 md:h-16 object-contain p-1 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  {isMatched && (
                    <div className="absolute top-1 left-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* 2. Dotted Link with interactive dots */}
                <div className="flex-1 mx-4 md:mx-6 flex items-center relative h-6">
                  <div className={`w-3 h-3 rounded-full transition-colors ${isMatched ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-amber-400'}`} />
                  <svg className="flex-1 h-3">
                    <line 
                      x1="0%" y1="50%" x2="100%" y2="50%" 
                      stroke={isMatched ? (row.colorKey === 'blue' ? '#3B82F6' : row.colorKey === 'red' ? '#EF4444' : '#F59E0B') : '#CBD5E1'} 
                      strokeWidth="3.5" 
                      strokeDasharray="6,4"
                      className={isMatched ? 'animate-marquee' : ''}
                    />
                  </svg>
                  <div className={`w-3 h-3 rounded-full transition-colors ${isMatched ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-slate-300'}`} />
                </div>

                {/* 3. Splash Splat indicator */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center p-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <img 
                    src={row.splashImg} 
                    alt="splash"
                    className={`w-14 h-14 md:w-16 md:h-16 object-contain p-0.5 transition-all duration-300
                      ${isMatched ? 'opacity-100 scale-105' : 'opacity-15 grayscale pointer-events-none'}
                    `}
                    referrerPolicy="no-referrer"
                  />
                  {!isMatched && (
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50/50">
                        <span className="text-slate-400 text-xs">?</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Right Area: Light Palette & Instructions */}
      <div className="w-full md:w-[30%] bg-[#FFF3E0] rounded-[2.5rem] border-4 border-[#FFE0B2] p-6 md:p-8 flex flex-col justify-between relative shadow-lg min-h-[500px] md:min-h-0 overflow-hidden">
        
        {/* Color Palette Heading */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-orange-500 text-white font-black px-6 py-2 rounded-2xl shadow-md border-2 border-white tracking-wide text-md">
            调色盘颜料包 🖌️
          </div>
          <span className="text-[11px] text-orange-900/60 font-black">第1步：任选一款色开始着色</span>
        </div>

        {/* The 3 fully colored splashes palette */}
        <div className="my-4 flex flex-row md:flex-col items-center justify-center gap-4 py-2">
          {palette.map((p) => {
            const isSelected = selectedBrush === p.color;
            return (
              <button
                key={p.color}
                onClick={() => {
                  playSynthSound('click');
                  setSelectedBrush(p.color);
                  setHelperText(`已经准备好了：${p.label}！快点击对应的灰白轮廓配配乐吧！`);
                  speakText(`准备好${p.color === 'red' ? '红色' : p.color === 'yellow' ? '黄色' : '蓝色'}颜料啦！`);
                }}
                className={`relative w-20 h-20 md:w-24 md:h-24 p-1.5 rounded-3xl bg-white border shadow-md flex items-center justify-center transition-all duration-300 hover:scale-105
                  ${isSelected 
                    ? 'ring-4 ring-orange-500 ring-offset-2 border-transparent scale-110' 
                    : 'border-slate-200 hover:border-orange-200'
                  }
                `}
              >
                <img 
                  src={p.img} 
                  alt={p.label} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                
                {/* Selected glowing ring or badge */}
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-orange-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-md animate-bounce">
                    已选
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Instructions speech box */}
        <div className="bg-white text-slate-800 p-4 md:p-5 rounded-[1.8rem] shadow-md border border-orange-100 text-xs md:text-sm font-extrabold leading-relaxed text-left relative my-2">
          {complete ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce">🏆</span>
              <div>
                <span className="text-emerald-600 block font-black text-sm">着色连线大功告成！</span>
                <span className="text-slate-600 font-extrabold text-xs">小朋友太厉害了！三组颜料全部对齐连接成功！</span>
              </div>
            </div>
          ) : (
            <>
              <span className="text-orange-600 block mb-1 font-black">💡 智幼大闯关说明：</span>
              {helperText}
            </>
          )}
          <div className="absolute bottom-[-10px] right-[40px] w-5 h-5 bg-white rotate-45 border-r border-b border-orange-100 pointer-events-none" />
        </div>

        {/* Reset & Dr. Zhang */}
        <div className="mt-auto w-full relative h-[140px] flex flex-col justify-end">
          {/* Replay action bar */}
          <div className="absolute left-0 bottom-4 w-[55%] z-20">
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 text-xs tracking-wider"
            >
              <RefreshCw size={11} className="animate-spin-slow stroke-[3]" />
              重置游戏 🔄
            </button>
          </div>

          {/* Dr. Zhang Standing Image */}
          <img
            src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/%E5%9B%BE%E7%89%87%20%E5%BC%A0%E5%8D%9A%E5%A3%AB.png"
            alt="张博士"
            className="w-36 h-auto object-contain absolute bottom-[-1rem] right-[-1.5rem] drop-shadow-[0_15px_15px_rgba(0,0,0,0.25)] select-none pointer-events-none z-10"
            referrerPolicy="no-referrer"
          />
        </div>

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
  const [helperText, setHelperText] = useState("请先点击左侧两两拥抱的彩色泡泡宝宝，然后找出右侧颜色搭配相同的双色积木来完成着色连线吧！");

  useEffect(() => {
    speakText("小朋友，瞧，左边是颜色王国最亲密的拥拥泡泡组合，右边是双色积木板。请选择两边颜色互相对应的一组，把它们连接起来吧！");
  }, []);

  const columnLeft = [
    { id: 1, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/game3/16.jpg', label: '红色与黄色拥拥球', desc: '红红和黄黄亲密无间拥抱在一起！' },
    { id: 2, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/game3/17.jpg', label: '蓝色与红色拥拥球', desc: '蓝蓝和红红暖心拥抱在一起！' },
    { id: 3, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/game3/18.jpg', label: '蓝色与黄色拥拥球', desc: '蓝蓝和黄黄亲切拥抱在一起！' },
    { id: 4, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/game3/19.jpg', label: '红色与蓝色拥拥球', desc: '红红和蓝蓝热情拥抱在一起！' }
  ];

  const columnRight = [
    { targetId: 4, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/game3/20.jpg', label: '左红右蓝积木板' },
    { targetId: 3, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/game3/21.jpg', label: '左蓝右黄积木板' },
    { targetId: 2, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/game3/22.jpg', label: '左蓝右红积木板' },
    { targetId: 1, img: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/game3/23.jpg', label: '左红右黄积木板' }
  ];

  const handleMatch = (targetId: number) => {
    if (!selectedId) {
      playSynthSound('fail');
      setHelperText("请先点击左边的彩色拥拥球泡泡寻找它的伙伴哦！");
      speakText("请先点击左边的拥拥球，再选择右边配色相同的积木板吧！");
      return;
    }

    if (selectedId === targetId) {
      playSynthSound('success');
      const updated = { ...correctFlags, [selectedId]: true };
      setCorrectFlags(updated);
      setSelectedId(null);
      
      const leftItem = columnLeft.find(x => x.id === selectedId);
      setHelperText(`太棒啦！正确连接：${leftItem?.label} 配对成功！✨`);
      speakText(`${leftItem?.label} 配对成功，真是太棒了！`);

      if (Object.keys(updated).length === columnLeft.length) {
        setComplete(true);
        setTimeout(() => {
          playSynthSound('popup');
          confetti({ particleCount: 100, spread: 50 });
          setHelperText("哇！所有的拥抱泡泡和双色积木都成功连结起来了！你的色彩观察力和数形匹配力简直是天才级别！🎖️");
          speakText("太了不起了！你完成了全部的拥抱泡泡和彩球对应的双色积木连线挑战！");
        }, 1000);
      }
    } else {
      playSynthSound('fail');
      setHelperText("这个积木的颜色好像和我们的双色泡泡不搭哦，再来“停一停、想一想、试一试”！");
      speakText("颜色不太搭哦，请停一停、想一想、再试一试！");
    }
  };

  const handleReset = () => {
    setSelectedId(null);
    setCorrectFlags({});
    setComplete(false);
    setHelperText("拼图已经全部擦拭干净，请再次体验色彩积木的奇妙魔力吧！");
    speakText("拥拥球和积木重置成功，请重新开始新的一轮连线挑战吧！");
  };

  // SVG lines rendering logic
  const getLineCoordinates = (leftId: number) => {
    // leftId is 1,2,3,4
    // Vertically:
    // Left row indices: 0 (id 1), 1 (id 2), 2 (id 3), 3 (id 4) -> heights: 12.5%, 37.5%, 62.5%, 87.5%
    // Right row indices: 0 (id 4), 1 (id 3), 2 (id 2), 3 (id 1) -> heights: 12.5%, 37.5%, 62.5%, 87.5%
    let y1 = '12.5%';
    let y2 = '87.5%';
    
    if (leftId === 1) { y1 = '12.5%'; y2 = '87.5%'; }
    else if (leftId === 2) { y1 = '37.5%'; y2 = '62.5%'; }
    else if (leftId === 3) { y1 = '62.5%'; y2 = '37.5%'; }
    else if (leftId === 4) { y1 = '87.5%'; y2 = '12.5%'; }

    return { y1, y2 };
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col md:flex-row p-4 md:p-8 select-none gap-6 items-stretch">
      
      {/* Left Workspace area */}
      <div className="flex-1 md:w-[70%] bg-[#F9F9FB] rounded-[2.5rem] border-4 border-amber-100 p-6 flex flex-col justify-between relative shadow-lg overflow-hidden">
        
        {/* Dynamic Connected Board container */}
        <div className="flex-1 relative flex justify-between items-stretch py-4">
          
          {/* Absolute SVG overlay */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-15">
            {columnLeft.map((item) => {
              const matched = correctFlags[item.id] !== undefined;
              const { y1, y2 } = getLineCoordinates(item.id);
              const isSelected = selectedId === item.id;

              return (
                <g key={item.id}>
                  {/* Subtle trace background trace line */}
                  <line 
                    x1="38%" 
                    y1={y1} 
                    x2="62%" 
                    y2={y2} 
                    stroke={matched ? (item.id === 1 ? '#EF4444' : item.id === 2 ? '#3B82F6' : item.id === 3 ? '#10B981' : '#F59E0B') : '#E2E8F0'} 
                    strokeWidth={matched ? '5' : '3'} 
                    strokeDasharray={matched ? undefined : '5,5'}
                    opacity={matched ? 1 : 0.45}
                    className="transition-all duration-300"
                  />
                  {isSelected && (
                    <line 
                      x1="38%" 
                      y1={y1} 
                      x2="62%" 
                      y2={y2} 
                      stroke="#818CF8" 
                      strokeWidth="3.5" 
                      strokeDasharray="6,4"
                      className="animate-marquee opacity-80"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Left Column - Big Hugging Balls */}
          <div className="w-[38%] flex flex-col justify-between gap-4 z-20">
            {columnLeft.map((item) => {
              const matched = correctFlags[item.id] !== undefined;
              const isSelected = selectedId === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (matched) return;
                    playSynthSound('click');
                    setSelectedId(item.id === selectedId ? null : item.id);
                  }}
                  disabled={matched}
                  className={`relative w-full h-[105px] md:h-[125px] rounded-[2rem] border-4 bg-white flex items-center justify-center p-2 shadow-md transition-all duration-300 group
                    ${matched 
                      ? 'border-emerald-300 bg-emerald-500/5 cursor-not-allowed opacity-80' 
                      : isSelected 
                        ? 'border-amber-400 ring-4 ring-amber-300/40 scale-105' 
                        : 'border-slate-100 hover:border-amber-200'
                    }
                  `}
                >
                  <img 
                    src={item.img} 
                    alt={item.label} 
                    className={`w-auto h-full max-h-[85px] md:max-h-[105px] object-contain p-0.5 transition-transform group-hover:scale-105 ${matched ? 'filter grayscale-0' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Matching connector port right dot */}
                  <div className={`absolute right-[-10px] top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border-4 border-white shadow transition-all duration-300
                    ${matched ? 'bg-emerald-500 scale-110 shadow-[0_0_8px_#10B981]' : isSelected ? 'bg-indigo-500 animate-pulse' : 'bg-amber-400 group-hover:scale-110'}
                  `} />

                  {/* Micro Checked Banner */}
                  {matched && (
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm scale-90">
                      <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-[10%] pointer-events-none" />

          {/* Right Column - Corresponding block pattern */}
          <div className="w-[38%] flex flex-col justify-between gap-4 z-20">
            {columnRight.map((r) => {
              const matched = correctFlags[r.targetId] !== undefined;
              const isTargeting = selectedId !== null;
              
              return (
                <button
                  key={r.targetId}
                  onClick={() => handleMatch(r.targetId)}
                  disabled={matched}
                  className={`relative w-full h-[105px] md:h-[125px] rounded-[2rem] border-4 bg-white flex items-center justify-center p-2 shadow-md transition-all duration-300 group
                    ${matched 
                      ? 'border-emerald-300 bg-emerald-500/5 cursor-not-allowed opacity-80' 
                      : isTargeting 
                        ? 'border-indigo-200 hover:border-indigo-400 hover:scale-105 cursor-pointer bg-slate-50/50' 
                        : 'border-slate-100 hover:border-amber-200'
                    }
                  `}
                >
                  <img 
                    src={r.img} 
                    alt={r.label} 
                    className="w-auto h-full max-h-[85px] md:max-h-[105px] object-contain p-0.5 transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Matching connector port left dot */}
                  <div className={`absolute left-[-10px] top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border-4 border-white shadow transition-all duration-300
                    ${matched ? 'bg-emerald-500 scale-110 shadow-[0_0_8px_#10B981]' : isTargeting ? 'bg-indigo-300 group-hover:scale-110' : 'bg-slate-300'}
                  `} />

                  {/* Micro Checked Banner */}
                  {matched && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm scale-90">
                      <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* Right control panel sidebar */}
      <div className="w-full md:w-[30%] bg-[#FFF3E0] rounded-[2.5rem] border-4 border-[#FFE0B2] p-6 md:p-8 flex flex-col justify-between relative shadow-lg min-h-[500px] md:min-h-0 overflow-hidden">
        
        {/* Color Palette Heading */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-orange-500 text-white font-black px-6 py-2.5 rounded-2xl shadow-md border-2 border-white tracking-wide text-md text-center">
            双色积木配配乐 🧩
          </div>
          <span className="text-[11px] text-orange-900/60 font-black">第1步：选对称左侧与右侧配色</span>
        </div>

        {/* Narrative info box */}
        <p className="text-sm text-amber-900 font-extrabold leading-relaxed text-left bg-orange-100/30 p-4 rounded-2xl border border-orange-200/40 my-4">
          摆一摆，拼一拼！连一连！请把<b>左边的彩色拥拥球小伙伴</b>同<b>右边完美对应的积木配色</b>连接配对吧！
        </p>

        {/* Instructions speech box */}
        <div className="bg-white text-slate-800 p-4 md:p-5 rounded-[1.8rem] shadow-md border border-orange-100 text-xs md:text-sm font-extrabold leading-relaxed text-left relative my-2">
          {complete ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce">🏆</span>
              <div>
                <span className="text-emerald-600 block font-black text-sm">配对积木大功告成！</span>
                <span className="text-slate-600 font-extrabold text-xs">小朋友配对太正确了，给自己的色彩智慧鼓掌！</span>
              </div>
            </div>
          ) : (
            <>
              <span className="text-orange-600 block mb-1 font-black">💡 智幼大闯关说明：</span>
              {helperText}
            </>
          )}
          <div className="absolute bottom-[-10px] right-[40px] w-5 h-5 bg-white rotate-45 border-r border-b border-orange-100 pointer-events-none" />
        </div>

        {/* Reset & Dr. Zhang */}
        <div className="mt-auto w-full relative h-[140px] flex flex-col justify-end">
          {/* Replay action bar */}
          <div className="absolute left-0 bottom-4 w-[55%] z-20">
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 text-xs tracking-wider"
            >
              <RefreshCw size={11} className="animate-spin-slow stroke-[3]" />
              重置积木 🔄
            </button>
          </div>

          {/* Dr. Zhang Standing Image */}
          <img
            src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/%E5%9B%BE%E7%89%87%20%E5%BC%A0%E5%8D%9A%E5%A3%AB.png"
            alt="张博士"
            className="w-36 h-auto object-contain absolute bottom-[-1rem] right-[-1.5rem] drop-shadow-[0_15px_15px_rgba(0,0,0,0.25)] select-none pointer-events-none z-10"
            referrerPolicy="no-referrer"
          />
        </div>

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
