import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, Sparkles, UploadCloud, Mic, Square, Volume2, Play, Pause,
  Plus, Trash2, Settings2, Code2, Cpu, CheckCircle2, Radio, FileText,
  LayoutGrid, ChevronRight, AlertCircle, RefreshCw, Layers, Gamepad2, Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlideItem {
  id: string;
  pageNum: number;
  title: string;
  intent: string;
}

interface AssetItem {
  id: string;
  name: string;
  url: string;
  purpose: string;
}

interface AudioRecord {
  id: string;
  slideId: string;
  label: string;
  url: string;
  duration: string;
}

interface Hotspot {
  id: string;
  name: string;
  top: string;
  left: string;
  width: string;
  height: string;
  desc: string;
}

export default function CoursewareMaker() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'plan' | 'assets' | 'hotspots' | 'game' | 'compile'>('plan');

  // Step 1: Course Info
  const [courseTitle, setCourseTitle] = useState('红黄蓝配对大闯关');
  const [targetAge, setTargetAge] = useState('3-6岁 (幼小衔接)');
  const [courseGoals, setCourseGoals] = useState('1. 让幼儿掌握红黄蓝三原色基本认知。\n2. 通过亲自动手分类颜色多孔棋具，培养孩子的物理具身空间感。\n3. 让孩子在轻松轻快的备课乐声中激发动手探索习惯。');
  const [slides, setSlides] = useState<SlideItem[]>([
    { id: 's1', pageNum: 1, title: '微课视频导入', intent: '播放动画小故事《红魔王和黄魔王》，吸引孩子注意力。' },
    { id: 's2', pageNum: 2, title: '取教具与实操前准备 (P7)', intent: '引导孩子在课桌上铺开：红黄蓝三色颜料、双色多孔底板、以及对应卡纸。' },
    { id: 's3', pageNum: 3, title: '颜色空间站分类挑战', intent: '通过小布米发指令让幼儿通过连线或拖放进行双色球分类练习。' },
  ]);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideIntent, setNewSlideIntent] = useState('');

  // Step 2: Assets & Audio Recording
  const [assets, setAssets] = useState<AssetItem[]>([
    { id: 'a1', name: 'P7.png (教学备包图)', url: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P7.png', purpose: '左下方放置作为实操棋具清点面板，供孩子点击核对。' },
    { id: 'a2', name: 'Dr. Zhang (张博士头像)', url: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/%E5%9B%BE%E7%89%87%20%E5%BC%A0%E5%8D%9A%E5%A3%AB.png', purpose: '右下角呈现作为配音解说人，指导孩子进行正确的分类和找物品。' },
    { id: 'a3', name: '律动轻音乐 (BGM)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', purpose: '伴随清点环节在开启时循环流淌，营造愉悦的环境氛围。' },
  ]);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetPurpose, setNewAssetPurpose] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [targetSlideForAudio, setTargetSlideForAudio] = useState('s2');
  const [voiceOverList, setVoiceOverList] = useState<AudioRecord[]>([
    { id: 'v1', slideId: 's1', label: '开场白 - 张博士', url: '#mock', duration: '0:12' },
    { id: 'v2', slideId: 's2', label: '准备工作介绍 - 实播', url: '#mock', duration: '0:18' }
  ]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Step 3: Interactive Hotspots
  const [aiHotspotEnabled, setAiHotspotEnabled] = useState(true);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([
    { id: 'h1', name: '① 红黄蓝画笔颜料', top: '16%', left: '14%', width: '41%', height: '23%', desc: '点击代表红黄蓝三原色笔及色碟就绪' },
    { id: 'h2', name: '② 双色多孔棋盘', top: '43%', left: '10%', width: '25%', height: '42%', desc: '点击代表双位插孔棋盘道具到位' },
    { id: 'h3', name: '③ 九宫十连卡纸', top: '49%', left: '37%', width: '20%', height: '31%', desc: '点击代表卡纸和数独任务牌对齐' },
  ]);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  // Step 3.5: Dynamic Game Design & Engine Variables
  const [gameTitle, setGameTitle] = useState('红黄蓝色彩对准大消除');
  const [gameType, setGameType] = useState<'match' | 'eliminate' | 'sequence'>('match');
  const [gameDifficulty, setGameDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [gameThought, setGameThought] = useState(
    '1. 【具身实操反馈】：幼儿通过点击棋具（多孔板），将虚拟色球归类到正确的色彩坑道上，加深三原色触觉反馈与对比。\n2. 【游戏心理闭环】：色球随机掉落，限时30秒。每准确对准一个获得“闪烁星星”和清脆的“哆”和弦声，达成3连击获得张博士的语音赞美！'
  );
  const [gameTimerSec, setGameTimerSec] = useState(30);

  // Dynamic game playground state in live preview Sandbox
  const [previewActiveEngine, setPreviewActiveEngine] = useState<'p7_ready' | 'gamified_play'>('p7_ready');
  const [playScore, setPlayScore] = useState(0);
  const [playTargetColor, setPlayTargetColor] = useState<'red' | 'yellow' | 'blue'>('red');
  const [playFeedbackText, setPlayFeedbackText] = useState('游戏已就绪！观察顶部的目标气泡色彩，点击下方的消降色孔进行具身对准消除吧！');
  const [playStreak, setPlayStreak] = useState(0);

  // Step 4: Coding AI config & CodeGen Simulation
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'doubao'>('gemini');
  const [extraPrompts, setExtraPrompts] = useState('请让最终页面左右分栏十分均衡！左侧展现 16:9 比例的完整图片以覆盖所有热区，右侧给博士头像设计一个更小巧、优雅的竖列，内置勾选核对卡。');
  const [isCoding, setIsCoding] = useState(false);
  const [codingProgress, setCodingProgress] = useState(0);
  const [codingLogs, setCodingLogs] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [interactivePreviewActive, setInteractivePreviewActive] = useState(false);

  // Preview Page Game State (Mock courseware built in real time!)
  const [p7CheckedItems, setP7CheckedItems] = useState({ paint: false, board: false, trays: false });
  const [isPlayingBgm, setIsPlayingBgm] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [previewSpeech, setPreviewSpeech] = useState('小朋友，观察左边的底纸道具，找出它们并点击卡片或者图中的热圈，我们一起来准备好今天有趣的棋盘哦！');

  // Handle Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Real or simulated Browser Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Real microphone not available, initiating simulated high-fidelity voice recording.', err);
      // Fallback fallback simulated recording
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // stop elements
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    } else {
      // simulated stop
      setIsRecording(false);
      // Simulate generated file
      const seconds = Math.floor(Math.random() * 15) + 5;
      setAudioUrl('#simulated-voice');
      const tempId = 'rec_' + Date.now();
      const targetSlide = slides.find(s => s.id === targetSlideForAudio);
      setVoiceOverList(prev => [
        ...prev, 
        {
          id: tempId,
          slideId: targetSlideForAudio,
          label: `老师录音 - 对应 [P${targetSlide?.pageNum || 2}] ${targetSlide?.title}`,
          url: '#simulated-voice',
          duration: `0:${seconds < 10 ? '0' + seconds : seconds}`
        }
      ]);
    }
  };

  const handleAddSlide = () => {
    if (!newSlideTitle) return;
    const nextIdx = slides.length + 1;
    setSlides(prev => [...prev, {
      id: `s${Date.now()}`,
      pageNum: nextIdx,
      title: newSlideTitle,
      intent: newSlideIntent || '默认教学流程设计。'
    }]);
    setNewSlideTitle('');
    setNewSlideIntent('');
  };

  const handleDeleteSlide = (id: string) => {
    setSlides(prev => prev.filter(s => s.id !== id));
  };

  const handleAddAsset = () => {
    if (!newAssetName || !newAssetUrl) return;
    setAssets(prev => [...prev, {
      id: `a${Date.now()}`,
      name: newAssetName,
      url: newAssetUrl,
      purpose: newAssetPurpose || '通用辅助设计素材。'
    }]);
    setNewAssetName('');
    setNewAssetUrl('');
    setNewAssetPurpose('');
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  // Automated shape recognition hotspot recommendation simulation
  const handleTriggerAiHotspotScan = () => {
    setIsAiScanning(true);
    // Play radar animation
    setTimeout(() => {
      setIsAiScanning(false);
      // Preset high quality hotspot contours
      setHotspots([
        { id: 'h1', name: '① 红黄蓝画笔颜料', top: '16%', left: '14%', width: '41%', height: '23%', desc: 'AI自动描边：检测到圆形泼洒色块，建议半径41%' },
        { id: 'h2', name: '② 双色多孔棋盘', top: '43%', left: '10%', width: '25%', height: '42%', desc: 'AI自动描边：检测到矩面立体槽，建议比例25%x42%' },
        { id: 'h3', name: '③ 九宫十连卡纸', top: '49%', left: '37%', width: '20%', height: '31%', desc: 'AI自动描边：检测到中层纸面底卡，建议比例20%x31%' },
      ]);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: 0.35, y: 0.5 }
      });
    }, 2200);
  };

  // Compile prompt and trigger simulated AI coding terminal
  const handleStartCoding = () => {
    setIsCoding(true);
    setCodingProgress(0);
    setCodingLogs([]);
    setGeneratedCode(null);
    setInteractivePreviewActive(false);

    const logs = [
      '⚡ [初始化] 正在构建探奇 Web 课程开发大模型工作流...',
      `⚡ [知识库加载] 已绑定教学大纲：适合岁段 - ${targetAge}`,
      `⚡ [知识库加载] 提取目标设定：\n${courseGoals.split('\n').map(l => '   - ' + l).join('\n')}`,
      `⚡ [素材装载] 解析 P7.png (教学备包图)：分辨率 16:9 比例校验正确...`,
      `⚡ [素材装载] 实装配音序列：已成功检索语音包 ${voiceOverList.length} 段...`,
      `⚡ [热区判定] ${aiHotspotEnabled ? '已开启 CV 智能形状识别。热区坐标高保真映射中...' : '使用传统相对热区绑定...'}`,
      `⚡ [游戏设计装配] 读取游戏化课程设计方案：“${gameTitle}”...`,
      `⚡ [游戏设计装配] 配置玩法模式：${gameType === 'match' ? '具身三色对准配对' : (gameType === 'eliminate' ? '多孔物理卡槽消除' : '律动空位颜色对准')} (${gameDifficulty === 'easy' ? '启蒙级' : (gameDifficulty === 'normal' ? '标准级' : '挑战级')})`,
      `⚡ [游戏设计装配] 封装益智声效和物理晃动渲染。绑定大满贯彩蛋特效与 SpeechSynthesis 动态语音赞赏机制...`,
      `🤖 [模型调用] 正在连线 ${selectedModel === 'gemini' ? 'Google Gemini 1.5 Pro' : '字节跳动 Doubao-PRO'} 代码生成中继服务器...`,
      '🤖 [AI Agent] 正在根据教师意图和额外指令自动生成 React + Next.js TSX 模板...',
      '🤖 [AI Agent] 注入 React 核心 Hooks：配置 activeId 及 p7CheckedItems 反应流...',
      '🤖 [AI Agent] 自适应算法：左侧 16:9 展示底图并渲染 overlays，右侧采用 Mini-Sidebar 精致排版...',
      '⚙️ [构建编译] 正在调用 Vite Webpack 动态渲染模块...',
      '⚙️ [构建编译] 编译通过，ESLint 检测 0 错误 0 警告！',
      '🎉 [成功] 探奇具身全功能Web课程模块已经安全编译发布到预览沙盒！'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setCodingLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
        setCodingProgress(Math.floor((currentLogIndex / logs.length) * 100));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsCoding(false);
          setGeneratedCode(generateMockComponentCode());
          setInteractivePreviewActive(true);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 800);
      }
    }, 450);
  };

  const generateMockComponentCode = () => {
    return `// 由探奇 AI 课件工具自动生成
// 教师大纲: ${courseTitle} (${targetAge})
// 游戏设计方案: ${gameTitle}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Play, Pause, RefreshCw, Gamepad2, Trophy, HelpCircle } from 'lucide-react';

export default function GeneratedCourseware() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'game'>('checklist');
  const [checked, setChecked] = useState({ paint: false, board: false, trays: false });
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [targetColor, setTargetColor] = useState<'red' | 'yellow' | 'blue'>('red');
  const [feedback, setFeedback] = useState('请找出对应的彩色孔位投掷！');

  const colors = ['red', 'yellow', 'blue'] as const;

  const handleMatch = (selected: 'red' | 'yellow' | 'blue') => {
    if (selected === targetColor) {
      setScore(s => s + 10);
      setStreak(st => st + 1);
      const nextTarget = colors.filter(c => c !== targetColor)[Math.floor(Math.random() * 2)];
      setTargetColor(nextTarget);
      setFeedback('对准匹配成功！加10分！🎉');
    } else {
      setStreak(0);
      setFeedback('匹配不正确哦，请仔细观察目标颜色。');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-slate-50 rounded-3xl border shadow-sm">
      <div className="flex gap-2 justify-center mb-4">
        <button 
          onClick={() => setActiveTab('checklist')}
          className={\`px-4 py-2 rounded-xl text-xs font-black transition-all \${activeTab === 'checklist' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 border'}\`}
        >
          🛠️ 实操教具清点 (P7)
        </button>
        <button 
          onClick={() => setActiveTab('game')}
          className={\`px-4 py-2 rounded-xl text-xs font-black transition-all \${activeTab === 'game' ? 'bg-indigo-650 text-white shadow' : 'bg-white text-slate-600 border'}\`}
        >
          🎮 ${gameTitle} (消除匹配游戏)
        </button>
      </div>

      {activeTab === 'checklist' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative aspect-video bg-white rounded-2xl overflow-hidden border">
            <img src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P7.png" className="w-full h-full object-contain" />
          </div>
          <div className="md:col-span-4 bg-sky-50 rounded-2xl p-4 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-800">1. 实操清单清点核对</h4>
            <div className="space-y-2 mt-2">
              <button 
                onClick={() => setChecked(c => ({...c, paint: !c.paint}))}
                className={\`w-full p-2 rounded-lg border text-xs font-bold text-left \${checked.paint ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white border-slate-200'}\`}
              >
                ① 三色笔及颜料 {checked.paint ? '✅' : '⏳'}
              </button>
              <button 
                onClick={() => setChecked(c => ({...c, board: !c.board}))}
                className={\`w-full p-2 rounded-lg border text-xs font-bold text-left \${checked.board ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white border-slate-200'}\`}
              >
                ② 实操双色棋盘 {checked.board ? '✅' : '⏳'}
              </button>
              <button 
                onClick={() => setChecked(c => ({...c, trays: !c.trays}))}
                className={\`w-full p-2 rounded-lg border text-xs font-bold text-left \${checked.trays ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white border-slate-200'}\`}
              >
                ③ 九宫十连卡纸 {checked.trays ? '✅' : '⏳'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-4">满足3-6岁色彩具身空间教育。</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl p-6 text-white text-center flex flex-col items-center">
          <h3 className="text-md font-bold tracking-wider text-yellow-300">${gameTitle}</h3>
          
          <div className="my-6">
            <span className="text-[10px] text-slate-400 block mb-1">当前匹配色彩目标</span>
            <div className={\`px-4 py-2 rounded-full text-xs font-black inline-block \${targetColor === 'red' ? 'bg-red-500' : targetColor === 'yellow' ? 'bg-amber-400 text-slate-950' : 'bg-blue-600'}\`}>
              {targetColor === 'red' ? '🔴 红色' : targetColor === 'yellow' ? '🟡 黄色' : '🔵 蓝色'}
            </div>
          </div>

          <div className="flex gap-4 justify-center my-4">
            <button onClick={() => handleMatch('red')} className="px-4 py-2 bg-red-650 hover:bg-red-500 text-xs font-bold rounded-lg shadow-lg">红孔</button>
            <button onClick={() => handleMatch('yellow')} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-lg">黄孔</button>
            <button onClick={() => handleMatch('blue')} className="px-4 py-2 bg-blue-650 hover:bg-blue-500 text-xs font-bold rounded-lg shadow-lg">蓝孔</button>
          </div>

          <div className="flex justify-between w-full mt-6 text-xs text-slate-400 border-t border-white/10 pt-3">
            <span>🏆 当前得分: {score}</span>
            <span>🔥 连击数: {streak}</span>
          </div>
        </div>
      )}
    </div>
  );
}`;
  };

  // Preview Interactive Logic
  const handleToggleP7Check = (key: 'paint' | 'board' | 'trays', name: string) => {
    setP7CheckedItems(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // Check for speak cue
      if (next[key]) {
        setP7SpeakText(`真聪明！你准确准备好了：${name}，离完成只差一点啦！`);
      }
      // Check complete
      if (next.paint && next.board && next.trays) {
        setP7SpeakText('大功告成！今天红黄蓝大闯关的实操棋具已经超级完美地备齐了。现在就让我们随张博士一起进入奇妙的九宫格实操！');
        confetti({
          particleCount: 50,
          spread: 60,
          colors: ['#EF4444', '#F59E0B', '#3B82F6']
        });
      }
      return next;
    });
  };

  const handleCheckPlayGame = (selectedColor: 'red' | 'yellow' | 'blue') => {
    if (selectedColor === playTargetColor) {
      const nextScore = playScore + 10;
      setPlayScore(nextScore);
      const nextStreak = playStreak + 1;
      setPlayStreak(nextStreak);
      
      const colors = ['red', 'yellow', 'blue'] as const;
      const filtered = colors.filter(c => c !== playTargetColor);
      const randomNext = filtered[Math.floor(Math.random() * filtered.length)];
      setPlayTargetColor(randomNext);
      
      setPlayFeedbackText(`对准配对成功！🎉 成绩累计 +10分 ${nextStreak > 1 ? `（达成 ${nextStreak} 连消🔥）` : ''}`);

      if (nextStreak % 3 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          colors: ['#EF4444', '#F59E0B', '#3B82F6']
        });
        setP7SpeakText(`太厉害啦！你在游戏《${gameTitle}》中连续消除配对了 ${nextStreak} 个色彩！你是色彩空间操作专家！继续保持吧！`);
      } else {
        const encouragement = [
          '找对色孔啦，快速消除一个！',
          '太棒了，这就是匹配的颜色！',
          '真厉害，彩杯配对正确！',
        ];
        setP7SpeakText(encouragement[Math.floor(Math.random() * encouragement.length)]);
      }
    } else {
      setPlayStreak(0);
      setPlayFeedbackText(`糟糕，对准失败！${selectedColor === 'red' ? '红色' : selectedColor === 'yellow' ? '黄色' : '蓝色'}孔对准失准，这不匹配哦。再看看？😅`);
      setP7SpeakText(`噢，这好像是${selectedColor === 'red' ? '红' : selectedColor === 'yellow' ? '黄' : '蓝'}色孔呢，匹配失败。当前的消除匹配的目标是：${playTargetColor === 'red' ? '红' : playTargetColor === 'yellow' ? '黄' : '蓝'}色！`);
    }
  };

  const handleToggleBgm = () => {
    if (bgmRef.current) {
      if (isPlayingBgm) {
        bgmRef.current.pause();
        setIsPlayingBgm(false);
      } else {
        bgmRef.current.play().catch(() => {});
        setIsPlayingBgm(true);
      }
    } else {
      const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      bgmRef.current = audio;
      audio.play().catch(() => {});
      setIsPlayingBgm(true);
    }
  };

  const setP7SpeakText = (text: string) => {
    setPreviewSpeech(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const resetP7Preview = () => {
    setP7CheckedItems({ paint: false, board: false, trays: false });
    setPreviewSpeech('小朋友，观察左边的底纸道具，找出它们并点击卡片或者图中的热圈，我们一起来准备好今天有趣的棋盘哦！');
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
    setIsPlayingBgm(false);
  };

  // Clean up BGM on unmount
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  return (
    <div id="courseware-maker-page" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 text-slate-800">
      
      {/* Upper Status & Brand Intro */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white p-4 rounded-2xl shadow-md">
            <Wand2 size={36} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 leading-tight">探奇 AI 课件智能制作舱</h1>
              <span className="text-[10px] bg-red-100 text-red-650 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Teacher Edition v2.8</span>
            </div>
            <p className="text-slate-500 text-sm mt-1">无需懂代码。通过配置课程教学意图、智能识别热区及快捷录音，AI 自动生成优雅好玩的具身探索 Web 课件。</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto bg-slate-50 p-2 border border-slate-200/80 rounded-2xl">
          <div className="px-3 py-1 bg-white text-xs text-slate-650 font-bold rounded-xl shadow-xs flex items-center gap-1.5">
            <Radio size={14} className="text-emerald-500 animate-pulse" />
            <span>AI引擎：3D相机感知接入中</span>
          </div>
        </div>
      </div>

      {/* Main Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Creation Panel Deck (Cols 7/12) */}
        <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden min-h-[640px]">
          
          {/* Tabs header */}
          <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1 justify-start">
            <button 
              onClick={() => setActiveTab('plan')}
              className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl text-[10px] font-black transition-all ${
                activeTab === 'plan' ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText size={14} />
              1. 教学大纲策划
            </button>
            <button 
              onClick={() => setActiveTab('assets')}
              className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl text-[10px] font-black transition-all ${
                activeTab === 'assets' ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers size={14} />
              2. 素材与配音库
            </button>
            <button 
              onClick={() => setActiveTab('hotspots')}
              className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl text-[10px] font-black transition-all ${
                activeTab === 'hotspots' ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid size={14} />
              3. 交互与热区
            </button>
            <button 
              onClick={() => setActiveTab('game')}
              className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl text-[10px] font-black transition-all ${
                activeTab === 'game' ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Gamepad2 size={14} className="text-indigo-500" />
              4. 游戏设计方案
            </button>
            <button 
              onClick={() => setActiveTab('compile')}
              className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl text-[10px] font-black transition-all ${
                activeTab === 'compile' ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cpu size={14} />
              5. 代码自动装配
            </button>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Pedagogical Planning */}
              {activeTab === 'plan' && (
                <motion.div 
                  key="plan_tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5 flex-1"
                >
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">课件主题名称</label>
                      <input 
                        type="text" 
                        value={courseTitle} 
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                      />
                    </div>
                    <div className="w-[35%]">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">适合授课年龄</label>
                      <input 
                        type="text" 
                        value={targetAge} 
                        onChange={(e) => setTargetAge(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">课程教学目的与核心目标 (给AI大模型的知识库输入)</label>
                    <textarea 
                      rows={3}
                      value={courseGoals} 
                      onChange={(e) => setCourseGoals(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium leading-relaxed bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                    />
                  </div>

                  {/* Slide schedule container */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">课时页面及大纲流程 ({slides.length}张)</label>
                      <span className="text-[10px] text-slate-400 font-bold">由AI自动依据顺序编写其交互流程逻辑</span>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {slides.map((slide) => (
                        <div key={slide.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/85">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-700 text-xs font-extrabold flex items-center justify-center">
                              P{slide.pageNum}
                            </span>
                            <div>
                              <div className="text-xs font-extrabold text-slate-800">{slide.title}</div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">{slide.intent}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="p-1 text-slate-300 hover:text-red-500 transition active:scale-90"
                            title="从大纲删除"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Form */}
                    <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-2xl grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <input 
                          type="text" 
                          placeholder="新页面标题..." 
                          value={newSlideTitle}
                          onChange={(e) => setNewSlideTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div className="col-span-6 flex items-center">
                        <input 
                          type="text" 
                          placeholder="该页面教学目的意图..." 
                          value={newSlideIntent}
                          onChange={(e) => setNewSlideIntent(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <button 
                        onClick={handleAddSlide}
                        className="col-span-2 bg-blue-600 text-white font-black text-xs rounded-lg flex items-center justify-center gap-1 hover:bg-blue-700 active:scale-95"
                      >
                        <Plus size={14} />
                        添加
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Assets and Audio Recording (NEW AUDIO CAPABILITY) */}
              {activeTab === 'assets' && (
                <motion.div 
                  key="assets_tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Media resource list */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider text-left block">素材库及应用目的说明</label>
                        <span className="text-[9px] text-emerald-600 font-bold">AI Coding可检索并自动引用底图及肖像</span>
                      </div>
                      
                      <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                        {assets.map((as) => (
                          <div key={as.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start">
                            <div className="text-left">
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-1 select-all">
                                🔗 {as.name}
                              </div>
                              <div className="text-[9px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{as.purpose}</div>
                            </div>
                            <button 
                              onClick={() => handleDeleteAsset(as.id)}
                              className="text-slate-300 hover:text-red-500 shrink-0 ml-1.5 pt-0.5"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Asset Form */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-left">
                        <input 
                          type="text" 
                          placeholder="素材标识。例如：P7_board.png..."
                          value={newAssetName}
                          onChange={(e) => setNewAssetName(e.target.value)}
                          className="w-full px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold"
                        />
                        <div className="flex gap-1">
                          <input 
                            type="text" 
                            placeholder="图、音或视频URL链接"
                            value={newAssetUrl}
                            onChange={(e) => setNewAssetUrl(e.target.value)}
                            className="flex-1 px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-mono"
                          />
                          <button 
                            onClick={handleAddAsset}
                            className="bg-blue-600 font-black text-xs text-white rounded-lg px-2 hover:bg-blue-750 active:scale-95 shrink-0"
                          >
                            导入
                          </button>
                        </div>
                        <input 
                          type="text" 
                          placeholder="该素材在页面中的定位与目的说明..."
                          value={newAssetPurpose}
                          onChange={(e) => setNewAssetPurpose(e.target.value)}
                          className="w-full px-3 py-1 rounded-lg border border-slate-200 text-[10px]"
                        />
                      </div>
                    </div>

                    {/* Microphone Voice Recorder */}
                    <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-[2rem] flex flex-col justify-between">
                      <div className="text-left">
                        <h4 className="text-xs font-black text-slate-700 flex items-center gap-1">
                          <Mic size={14} className="text-blue-500 animate-pulse" />
                          配音录制与配音上传舱
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">配合特定的教学卡片或博士场景输入语音，免去文字冷漠感，AI会自动植入TTS与音频文件播放。</p>
                        
                        <div className="mt-3">
                          <label className="block text-[9px] font-bold text-slate-500 mb-1">绑定目标课时页面</label>
                          <select 
                            value={targetSlideForAudio}
                            onChange={(e) => setTargetSlideForAudio(e.target.value)}
                            className="w-full text-xs font-extrabold px-3 py-1 rounded-lg border border-slate-200 bg-white"
                          >
                            {slides.map(s => (
                              <option key={s.id} value={s.id}>[P{s.pageNum}] {s.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Wave visualizer */}
                      <div className="h-12 bg-slate-900 rounded-xl my-3 flex items-center justify-center relative overflow-hidden">
                        {isRecording ? (
                          <div className="flex gap-1 items-end h-8">
                            <span className="w-1 bg-blue-500 h-6 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <span className="w-1 bg-cyan-400 h-4 rounded-full animate-bounce [animation-delay:0.3s]" />
                            <span className="w-1 bg-indigo-500 h-7 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1 bg-sky-400 h-5 rounded-full animate-bounce [animation-delay:0.5s]" />
                            <span className="w-1 bg-blue-400 h-6 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono tracking-widest">[ 麦克风音频监测就绪 ]</span>
                        )}
                        {isRecording && (
                          <div className="absolute right-3 top-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                            <span className="text-xs text-white font-mono font-bold">0:{recordDuration < 10 ? '0' + recordDuration : recordDuration}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {isRecording ? (
                          <button 
                            onClick={stopRecording}
                            className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                          >
                            <Square size={13} className="fill-current" />
                            停止录音
                          </button>
                        ) : (
                          <button 
                            onClick={startRecording}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                          >
                            <Mic size={13} />
                            开始录课配音
                          </button>
                        )}
                        
                        {/* File upload alternative space */}
                        <div className="relative shrink-0 w-24">
                          <input 
                            type="file" 
                            accept="audio/*"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={() => {
                              alert('配音文件已上传！');
                              setVoiceOverList(prev => [
                                ...prev,
                                {
                                  id: 'up_' + Date.now(),
                                  slideId: targetSlideForAudio,
                                  label: `导入音频 - P${slides.find(s=>s.id === targetSlideForAudio)?.pageNum || 2}`,
                                  url: '#local-upload',
                                  duration: '0:05'
                                }
                              ]);
                            }}
                          />
                          <button className="w-full h-full bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-[10px] font-black hover:bg-indigo-100 flex items-center justify-center gap-1">
                            <UploadCloud size={11} />
                            上传
                          </button>
                        </div>
                      </div>

                      {audioUrl && audioUrl !== '#simulated-voice' && (
                        <div className="mt-3 p-2 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-left">
                          <span className="text-[10px] text-blue-800 font-extrabold flex items-center gap-1">
                            <Volume2 size={12} className="animate-pulse" />
                            试听最新录制音:
                          </span>
                          <audio src={audioUrl} controls className="h-6 w-36 text-xs outline-none" />
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Registered Audio tracks */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-left font-black text-xs text-slate-500 mb-2">已挂载配音列表 ({voiceOverList.length}条)</div>
                    <div className="flex flex-wrap gap-2">
                      {voiceOverList.map((vo) => {
                        const boundSlide = slides.find(s => s.id === vo.slideId);
                        return (
                          <div key={vo.id} className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 border border-blue-100">
                            <Volume2 size={11} className="text-blue-500" />
                            <span>P{boundSlide?.pageNum || 2}: {vo.label} ({vo.duration})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Interactive Hotspots Config */}
              {activeTab === 'hotspots' && (
                <motion.div 
                  key="hotspots_tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 text-left"
                >
                  {/* AI Smart recommendation control panel (NEW INTENT) */}
                  <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-200 p-4 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                          AI 智能画幅图形轮廓识别系统
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        开启后，大语言及视觉模型可在老师上传底图后，自动描边提取关键教具（例如：颜料水渍、带有插孔的底纸），一键定位并配置好对应的交互参数，免除繁琐地对齐像素坐标。
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-500">智能推荐:</span>
                        <button 
                          onClick={() => setAiHotspotEnabled(!aiHotspotEnabled)}
                          className={`w-11 h-6 rounded-full transition-all relative ${
                            aiHotspotEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                            aiHotspotEnabled ? 'left-6' : 'left-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hotspots Designer Workspace */}
                  <div className="relative w-full aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-inner border border-slate-800">
                    <img 
                      src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P7.png" 
                      alt="Hotspot mapping background" 
                      className="w-full h-full object-contain pointer-events-none select-none opacity-40 blur-xs"
                    />

                    {isAiScanning && (
                      <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center z-20 pointer-events-none">
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse scanner-bar flex items-center justify-center" />
                        <div className="bg-slate-900/95 border border-cyan-500/30 px-4 py-2.5 rounded-full shadow-2xl text-cyan-400 text-xs font-black tracking-widest flex items-center gap-2 animate-bounce">
                          <Sparkles size={14} className="animate-spin" />
                          计算机图像识别 (Computer Vision) 寻找闭合容器轮廓中...
                        </div>
                      </div>
                    )}

                    {/* Rendering simulated hotspots visually overlaying on image */}
                    {hotspots.map((h) => (
                      <div 
                        key={h.id}
                        onClick={() => setActiveHotspotId(h.id)}
                        className={`absolute cursor-pointer border border-dashed hover:border-solid rounded-xl flex items-center justify-center transition-all ${
                          activeHotspotId === h.id 
                            ? 'border-cyan-400 bg-cyan-400/20 shadow-lg scale-102 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950' 
                            : 'border-white/50 bg-white/5 hover:bg-white/10'
                        }`}
                        style={{ top: h.top, left: h.left, width: h.width, height: h.height }}
                      >
                        <div className="bg-slate-950/80 text-[10px] font-black text-white px-2 py-0.5 rounded-full shadow border border-slate-700 select-none">
                          {h.name.split(' ')[0]}
                        </div>
                      </div>
                    ))}

                    <div className="absolute left-4 top-4 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[10px] text-white font-extrabold select-none">
                      P7.png 交互底板配置画布
                    </div>

                    {aiHotspotEnabled && (
                      <button 
                        onClick={handleTriggerAiHotspotScan}
                        className="absolute right-4 top-4 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] rounded-xl flex items-center gap-1 shadow-md transition active:scale-95"
                      >
                        <Wand2 size={11} className="animate-pulse" />
                        一键智能识别与提取热区坐标 ⚡
                      </button>
                    )}
                  </div>

                  {/* Hotspots explanation detail */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {hotspots.map((h) => (
                      <div 
                        key={h.id} 
                        onClick={() => setActiveHotspotId(h.id)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                          activeHotspotId === h.id 
                            ? 'bg-cyan-50/80 border-cyan-300 text-cyan-900 shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-black">{h.name}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{h.desc}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Game Design Settings */}
              {activeTab === 'game' && (
                <motion.div 
                  key="game_tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 text-left"
                >
                  <div className="bg-gradient-to-tr from-indigo-500/10 via-blue-500/10 to-cyan-500/10 p-4 border border-indigo-200/60 rounded-[2rem] space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500 text-white rounded-xl">
                        <Gamepad2 size={18} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">游戏互动式具身课件设计舱</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          在您的物理底纸之外动态生成并装配一款富有益智闭环、极佳反馈动效的红黄蓝游戏。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">游戏交互课件标题</label>
                        <input 
                          type="text" 
                          value={gameTitle} 
                          onChange={(e) => setGameTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-400 outline-none transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">游戏核心模式</label>
                          <select 
                            value={gameType}
                            onChange={(e) => setGameType(e.target.value as any)}
                            className="w-full text-[10px] font-extrabold px-2 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none"
                          >
                            <option value="match">🔴🟡🔵 具身三色对准消</option>
                            <option value="eliminate">🎲 多孔卡槽遮罩投</option>
                            <option value="sequence">⏱️ 限时原色律动排</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">倒计时设定 (秒)</label>
                          <input 
                            type="number"
                            value={gameTimerSec}
                            onChange={(e) => setGameTimerSec(Number(e.target.value))}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">关卡机制与判断门槛</label>
                        <div className="flex gap-1.5 mt-1">
                          {(['easy', 'normal', 'hard'] as const).map((diff) => (
                            <button 
                              key={diff}
                              onClick={() => setGameDifficulty(diff)}
                              className={`flex-1 py-1 px-1 rounded-xl text-[9px] font-bold transition border ${
                                gameDifficulty === diff 
                                  ? 'bg-blue-600 text-white border-blue-650 shadow-sm' 
                                  : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {diff === 'easy' ? '启蒙级 (单色)' : diff === 'normal' ? '标准级 (双轮播)' : '挑战级 (三色竞速)'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-700 flex items-center gap-1">
                          <Trophy size={13} className="text-amber-500" />
                          游戏化设计思路与具身心理特征
                        </label>
                        <p className="text-[9px] text-slate-400 leading-normal">
                          系统自动解析此对准思路，绑定星空大满贯。这也是大模型拼装课件的核心Prompt来源：
                        </p>
                        <textarea 
                          rows={4}
                          value={gameThought} 
                          onChange={(e) => setGameThought(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-medium leading-relaxed bg-white focus:ring-1 focus:ring-indigo-400 outline-none transition resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 4: AI Compilation & Codes */}
              {activeTab === 'compile' && (
                <motion.div 
                  key="compile_tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 text-left"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Parameters */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">主选 Coding 代码生成大语言模型</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button 
                            onClick={() => setSelectedModel('gemini')}
                            className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between transition ${
                              selectedModel === 'gemini' 
                                ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 shadow-sm' 
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-extrabold flex items-center gap-1.5">
                                <Sparkles size={14} className="text-blue-500" />
                                Google Gemini
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold mt-0.5">多模态高智能、强推荐</div>
                            </div>
                            {selectedModel === 'gemini' && <CheckCircle2 size={16} className="text-indigo-600 fill-current text-white" />}
                          </button>

                          <button 
                            onClick={() => setSelectedModel('doubao')}
                            className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between transition ${
                              selectedModel === 'doubao' 
                                ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 shadow-sm' 
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-extrabold flex items-center gap-1.5">
                                <Sparkles size={14} className="text-amber-500" />
                                字节跳动豆包
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold mt-0.5">轻巧流畅、中文友好</div>
                            </div>
                            {selectedModel === 'doubao' && <CheckCircle2 size={16} className="text-indigo-600 fill-current text-white" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">给 AI 助手的补充个性化部署指令</label>
                        <textarea 
                          rows={4}
                          value={extraPrompts} 
                          onChange={(e) => setExtraPrompts(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium leading-relaxed bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition resize-none"
                        />
                      </div>
                    </div>

                    {/* Simulation Console container */}
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-[2rem] text-slate-300 font-mono text-[10px] flex flex-col justify-between h-[250px] overflow-hidden">
                      <div className="overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 pr-1 select-all flex-1 header-console text-left">
                        {codingLogs.length === 0 ? (
                          <div className="text-slate-500 pt-8 text-center px-4 leading-normal">
                            📋 控制舱日志输出未开始。<br/>配置好上方各环节参数后，点击「立即装配大模型并一键生成」即可触发完整的全栈编译流并进行预览！
                          </div>
                        ) : (
                          codingLogs.map((log, lIdx) => (
                            <div key={lIdx} className={`whitespace-pre-wrap leading-relaxed ${
                              log.startsWith('⚡') ? 'text-indigo-400' : (log.startsWith('🎉') ? 'text-emerald-400 font-bold text-xs' : 'text-slate-300')
                            }`}>
                              {log}
                            </div>
                          ))
                        )}
                      </div>

                      {isCoding && (
                        <div className="mt-3 pt-3 border-t border-slate-800">
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1">
                            <span>编译进度: {codingProgress}%</span>
                            <span className="animate-pulse text-indigo-400">进行中: API COMPILE</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-indigo-500 h-full"
                              initial={{ width: '0%' }}
                              animate={{ width: `${codingProgress}%` }}
                              transition={{ duration: 0.1 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Form Action Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 text-slate-400 font-semibold text-xs">
                <AlertCircle size={14} className="text-slate-500" />
                <span>不写任何代码，只需聚焦课程意图即可</span>
              </div>

              <div className="flex gap-2">
                {activeTab !== 'compile' ? (
                  <button 
                    onClick={() => {
                      if (activeTab === 'plan') setActiveTab('assets');
                      else if (activeTab === 'assets') setActiveTab('hotspots');
                      else if (activeTab === 'hotspots') setActiveTab('game');
                      else if (activeTab === 'game') setActiveTab('compile');
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shadow transition active:scale-95"
                  >
                    <span>下一步</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button 
                    onClick={handleStartCoding}
                    disabled={isCoding}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition active:scale-95 disabled:opacity-50"
                  >
                    <Wand2 size={14} className={isCoding ? 'animate-spin' : 'animate-pulse'} />
                    一键装配大模型生成 & 预览课件 ⚡
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Virtual Sandbox Preview Panel (Cols 5/12) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-50 border border-slate-200 rounded-[2rem] p-4 shadow-sm min-h-[640px] relative justify-between">
          
          <div className="flex-1 flex flex-col">
            {/* Header Area */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-xs mb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-slate-600" />
                <div>
                  <h3 className="font-extrabold text-xs text-slate-800">沙盒在线实时预览</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Interactive outcome renderer</p>
                </div>
              </div>

              {interactivePreviewActive && (
                <div className="flex gap-1.5 font-bold">
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    已动态挂载 (Port 3000)
                  </span>
                </div>
              )}
            </div>

            {/* Simulated Live Renderer Area */}
            <div className="flex-1 rounded-[2rem] bg-white border border-slate-150 overflow-hidden relative shadow-inner min-h-[440px] flex items-center justify-center">
              
              {!interactivePreviewActive ? (
                // State 1: Awaiting design completion
                <div className="max-w-xs text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 mx-auto rounded-full flex items-center justify-center border border-blue-100">
                    <Settings2 size={32} className="animate-spin-slow text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">等待教师生成指令...</h4>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1">
                      请使用左侧控制舱编辑红黄蓝分类目标、配音、选定热区，然后在大模型编译页面中点击「立即生成课件」。代码会在右侧流式部署！
                    </p>
                  </div>
                  <div className="border border-dashed border-slate-200 p-3 rounded-2xl bg-slate-50/50 text-left space-y-1 select-none">
                    <span className="text-[9px] block text-slate-400 font-bold uppercase">实时指令配对知识文件:</span>
                    <span className="text-[10px] block text-slate-600 font-bold truncate">📄 Subject: {courseTitle}</span>
                    <span className="text-[10px] block text-slate-600 font-bold truncate">📄 Age: {targetAge}</span>
                    <span className="text-[10px] block text-slate-600 font-bold truncate">📄 Material: P7.png ({assets.length}个文件)</span>
                  </div>
                </div>
              ) : (
                // State 2: Fully interactive compiled preview screen with Dual Engine Choice
                <div className="absolute inset-0 w-full h-full bg-slate-50 flex flex-col p-3 select-none items-stretch justify-between">
                  
                  {/* Outer Frame Header Indicator */}
                  <div className="flex justify-between items-center bg-indigo-950 text-white rounded-xl px-3 py-1.5 mb-2 select-all shadow-md">
                    <span className="text-[9px] font-mono tracking-wider font-extrabold flex items-center gap-1">
                      <Code2 size={12} className="text-cyan-400" />
                      GENERATED_APP_COMPONENT.tsx (VITE RENDERED)
                    </span>
                    <button 
                      onClick={() => {
                        const win = window.open('#', '_blank');
                        if (win) {
                          alert('大模型Web课件已被全功能打包！您可以在全新全屏窗口预览测试。');
                        }
                      }}
                      className="text-[9px] hover:text-cyan-300 font-black border border-white/20 hover:border-cyan-400 bg-white/5 hover:bg-cyan-950/20 px-2 py-0.2 rounded-md transition"
                    >
                      全屏测试 ↗
                    </button>
                  </div>

                  {/* Selector for Preview Mode */}
                  <div className="flex gap-1.5 p-1 bg-slate-200/60 backdrop-blur-md rounded-xl mb-2 shrink-0">
                    <button
                      onClick={() => setPreviewActiveEngine('p7_ready')}
                      className={`flex-1 py-1 rounded-lg text-[9px] font-black transition-all ${
                        previewActiveEngine === 'p7_ready'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-905 hover:bg-white/30'
                      }`}
                    >
                      🛠️ 课时1：教具清单 (P7)
                    </button>
                    <button
                      onClick={() => {
                        setPreviewActiveEngine('gamified_play');
                        setPlayScore(0);
                        setPlayStreak(0);
                        setPlayTargetColor(['red', 'yellow', 'blue'][Math.floor(Math.random() * 3)] as any);
                        setPlayFeedbackText('消除游戏已智能部署！点击对应颜色孔位，将原色物体消退。');
                      }}
                      className={`flex-1 py-1 rounded-lg text-[9px] font-black transition-all ${
                        previewActiveEngine === 'gamified_play'
                          ? 'bg-white text-indigo-650 shadow-xs'
                          : 'text-slate-660 hover:text-slate-905 hover:bg-white/30'
                      }`}
                    >
                      🎮 课时2：{gameTitle} (互动消除)
                    </button>
                  </div>

                  {previewActiveEngine === 'p7_ready' ? (
                    <>
                      {/* 16:9 Inner Preview Game Split Layout */}
                      <div className="flex-1 flex flex-col md:flex-row gap-3 items-stretch min-h-0">
                        
                        {/* Visual left panel containing cropped 16:9 image overlay */}
                        <div className="flex-1 relative aspect-[1.15/1] bg-white rounded-2xl overflow-hidden shadow border border-slate-200/80">
                          <div className="absolute inset-0">
                            {/* Background Image: the actual template slide, completely contained within the left area with perfect ratio */}
                            <img
                              src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P7.png"
                              alt="取教具环节 P7"
                              className="w-full h-full object-contain select-none pointer-events-none"
                              referrerPolicy="no-referrer"
                            />

                            {/* Absolute Structured Step Indicators over the visual assets */}
                            <div className="absolute left-[14.2%] top-[17.5%] w-5 h-5 bg-white border border-amber-400 rounded-full flex items-center justify-center shadow-md pointer-events-none z-10 animate-pulse">
                              <span className="text-[9px] font-black text-amber-600">①</span>
                            </div>
                            <div className="absolute left-[10.5%] top-[44.5%] w-5 h-5 bg-white border border-emerald-400 rounded-full flex items-center justify-center shadow-md pointer-events-none z-10">
                              <span className="text-[9px] font-black text-emerald-600">②</span>
                            </div>
                            <div className="absolute left-[37.5%] top-[50.5%] w-5 h-5 bg-white border border-sky-400 rounded-full flex items-center justify-center shadow-md pointer-events-none z-10">
                              <span className="text-[9px] font-black text-sky-600">③</span>
                            </div>

                            {/* ========================================================= */}
                            {/* INTERACTIVE HOTSPOTS OVERLAID VIA EXACT PERCENTAGES       */}
                            {/* ========================================================= */}

                            {/* 1. Paint/Splash Area Hotspot */}
                            <div 
                              onClick={() => handleToggleP7Check('paint', '红黄蓝画笔颜料')}
                              className="absolute left-[14%] top-[16%] w-[41%] h-[23%] cursor-pointer group flex items-center justify-center rounded-xl transition hover:bg-emerald-500/5 hover:border-emerald-500/30 border border-transparent"
                            >
                              {p7CheckedItems.paint && (
                                <motion.div 
                                  initial={{ scale: 0, rotate: -15 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  className="absolute inset-x-1 inset-y-1 bg-emerald-500/10 backdrop-blur-xs flex items-center justify-center rounded-xl border border-emerald-500/70"
                                >
                                  <div className="bg-emerald-600 text-white rounded-full px-2 py-1 shadow-md flex items-center gap-1">
                                    <CheckCircle2 size={12} className="animate-bounce" />
                                    <span className="font-extrabold text-[9px]">准备好!</span>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* 2. Wooden Base Board Area Hotspot */}
                            <div 
                              onClick={() => handleToggleP7Check('board', '双色棋盘底板')}
                              className="absolute left-[10%] top-[43%] w-[25%] h-[42%] cursor-pointer group flex items-center justify-center rounded-xl transition hover:bg-teal-500/5 hover:border-teal-500/30 border border-transparent"
                            >
                              {p7CheckedItems.board && (
                                <motion.div 
                                  initial={{ scale: 0, rotate: 12 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  className="absolute inset-x-1 inset-y-1 bg-teal-500/10 backdrop-blur-xs flex items-center justify-center rounded-xl border border-teal-500/70"
                                >
                                  <div className="bg-teal-600 text-white rounded-full px-2 py-1 shadow-md flex items-center gap-1">
                                    <CheckCircle2 size={12} className="animate-bounce" />
                                    <span className="font-extrabold text-[9px]">准备好!</span>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* 3. Cardboard Grids / Paper Area Hotspot */}
                            <div 
                              onClick={() => handleToggleP7Check('trays', '九宫卡纸')}
                              className="absolute left-[37%] top-[49%] w-[20%] h-[31%] cursor-pointer group flex items-center justify-center rounded-xl transition hover:bg-sky-500/5 hover:border-sky-500/30 border border-transparent"
                            >
                              {p7CheckedItems.trays && (
                                <motion.div 
                                  initial={{ scale: 0, rotate: -8 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  className="absolute inset-x-1 inset-y-1 bg-sky-500/10 backdrop-blur-xs flex items-center justify-center rounded-xl border border-sky-500/70"
                                >
                                  <div className="bg-sky-600 text-white rounded-full px-2 py-1 shadow-md flex items-center gap-1">
                                    <CheckCircle2 size={12} className="animate-bounce" />
                                    <span className="font-extrabold text-[9px]">准备好!</span>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Highly requested Elegant Sidebar: including custom narration, interactive checkboxes and Dr. Zhang */}
                        <div className="w-full md:w-[35%] bg-sky-50/60 border border-sky-150 rounded-2xl p-2.5 flex flex-col justify-between shrink-0">
                          
                          {/* Checklists */}
                          <div className="space-y-1.5 text-left">
                            <div className="bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg py-1 px-2 text-center text-white font-extrabold text-[10px] tracking-wide mb-1 flex items-center justify-center gap-1">
                              <span>实操清点核对</span>
                            </div>

                            <button 
                              onClick={() => handleToggleP7Check('paint', '红黄蓝画笔颜料')}
                              className={`w-full flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
                                p7CheckedItems.paint ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border text-white ${
                                p7CheckedItems.paint ? 'bg-emerald-500 border-emerald-600' : 'border-slate-350 bg-slate-50'
                              }`}>
                                {p7CheckedItems.paint && <CheckCircle2 size={11} className="fill-current" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-extrabold text-[9px] leading-tight">① 三色笔及颜料</div>
                              </div>
                            </button>

                            <button 
                              onClick={() => handleToggleP7Check('board', '双色棋盘底板')}
                              className={`w-full flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
                                p7CheckedItems.board ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border text-white ${
                                p7CheckedItems.board ? 'bg-emerald-500 border-emerald-600' : 'border-slate-350 bg-slate-50'
                              }`}>
                                {p7CheckedItems.board && <CheckCircle2 size={11} className="fill-current" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-extrabold text-[9px] leading-tight">② 实操双色棋盘</div>
                              </div>
                            </button>

                            <button 
                              onClick={() => handleToggleP7Check('trays', '九宫卡纸')}
                              className={`w-full flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
                                p7CheckedItems.trays ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border text-white ${
                                p7CheckedItems.trays ? 'bg-emerald-500 border-emerald-600' : 'border-slate-350 bg-slate-50'
                              }`}>
                                {p7CheckedItems.trays && <CheckCircle2 size={11} className="fill-current" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-extrabold text-[9px] leading-tight">③ 九宫十连卡纸</div>
                              </div>
                            </button>
                          </div>

                          {/* BGM note panel */}
                          <div className="bg-orange-50/80 rounded-xl p-1.5 border border-orange-100 flex items-center gap-2 select-none">
                            <button 
                              onClick={handleToggleBgm}
                              className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-all ${
                                isPlayingBgm ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 border border-orange-300 hover:bg-orange-200'
                              }`}
                            >
                              {isPlayingBgm ? <Pause size={12} className="fill-current" /> : <Play size={12} className="fill-current" />}
                            </button>
                            <div className="text-left flex-1">
                              <div className="font-bold text-[9px] text-orange-950">备课律生动画背景音</div>
                              <div className="text-[8px] text-orange-500 leading-none">【教师上传的配音流音频】</div>
                            </div>
                          </div>

                          {/* Speech balloon & Dr. Zhang */}
                          <div className="flex items-end gap-1.5 pt-2 border-t border-sky-100">
                            {/* Avatar */}
                            <div className="w-9 h-12 shrink-0 relative">
                              <img 
                                src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/%E5%9B%BE%E7%89%87%20%E5%BC%A0%E5%8D%9A%E5%A3%AB.png" 
                                alt="Dr. Zhang avatar"
                                className="w-full h-full object-contain pr-0.5"
                              />
                            </div>
                            {/* Text balloon */}
                            <div 
                              onClick={() => setP7SpeakText(previewSpeech)}
                              className="flex-1 bg-white border border-sky-100 p-2 rounded-xl scale-95 hover:scale-98 cursor-pointer select-none text-left"
                              title="点击配音朗读"
                            >
                              <div className="text-slate-700 font-extrabold text-[8px] leading-relaxed">
                                🔊 {previewSpeech}
                              </div>
                              <span className="text-[7px] text-blue-600 font-black block mt-0.5">(听老师挂接的真人配音频)</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Restarter */}
                      <div className="mt-2 text-right">
                        <button 
                          onClick={resetP7Preview}
                          className="px-2 py-0.8 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[8px] rounded-md inline-flex items-center gap-1 shadow-sm transition active:scale-95"
                        >
                          <RefreshCw size={8} />
                          重置清单 🔄
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Gamified Play matching engine */}
                      <div className="flex-1 flex flex-col md:flex-row gap-3 items-stretch min-h-0">
                        {/* Left Space Stage for Gaming Matching */}
                        <div className="flex-1 relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-4 flex flex-col justify-between border border-indigo-950/70 shadow-inner text-white overflow-hidden">
                          
                          <div className="text-center font-black text-xs text-yellow-300 flex items-center justify-center gap-1 select-all">
                            <Trophy size={11} className="text-amber-400 animate-bounce" />
                            {gameTitle}
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center space-y-3.5 my-2">
                            {/* Floating target colored balloon */}
                            <div className="text-center">
                              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold block">当前配对消除目标</span>
                              <motion.div 
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                className={`mt-1.5 px-3.5 py-1.5 rounded-2xl text-[10px] font-black inline-flex items-center gap-1 border shadow-lg ${
                                  playTargetColor === 'red' ? 'bg-red-500 border-red-400 shadow-red-500/10' :
                                  playTargetColor === 'yellow' ? 'bg-amber-500 border-amber-450 text-slate-950 shadow-amber-505/10' :
                                  'bg-blue-600 border-blue-400 shadow-blue-500/10'
                                }`}
                              >
                                {playTargetColor === 'red' && '🔴 红色实体球'}
                                {playTargetColor === 'yellow' && '🟡 黄色实体球'}
                                {playTargetColor === 'blue' && '🔵 蓝色实体球'}
                              </motion.div>
                            </div>

                            {/* Clickable 3 color target holes representing physical peg board */}
                            <div className="grid grid-cols-3 gap-2 w-full pt-1.5">
                              {/* Red Slot matching */}
                              <button 
                                onClick={() => handleCheckPlayGame('red')}
                                className="group flex flex-col items-center p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 transition-all border border-red-500/20 hover:border-red-500 active:scale-95 text-center"
                              >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-750 to-red-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                  <span className="text-[10px] font-black">🔴</span>
                                </div>
                                <span className="text-[8px] font-bold text-red-300 mt-1 select-none">红孔对准</span>
                              </button>

                              {/* Yellow Slot matching */}
                              <button 
                                onClick={() => handleCheckPlayGame('yellow')}
                                className="group flex flex-col items-center p-2 rounded-xl bg-amber-950/30 hover:bg-amber-900/50 transition-all border border-amber-500/20 hover:border-amber-500 active:scale-95 text-center"
                              >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                  <span className="text-[10px] font-black">🟡</span>
                                </div>
                                <span className="text-[8px] font-bold text-amber-300 mt-1 select-none">黄孔对准</span>
                              </button>

                              {/* Blue Slot matching */}
                              <button 
                                onClick={() => handleCheckPlayGame('blue')}
                                className="group flex flex-col items-center p-2 rounded-xl bg-blue-950/30 hover:bg-blue-900/50 transition-all border border-blue-500/20 hover:border-blue-500 active:scale-95 text-center"
                              >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-750 to-blue-505 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                  <span className="text-[10px] font-black">🔵</span>
                                </div>
                                <span className="text-[8px] font-bold text-blue-300 mt-1 select-none">蓝孔对准</span>
                              </button>
                            </div>
                          </div>

                          {/* Level difficulty metrics */}
                          <div className="flex justify-between items-center text-[7px] text-slate-400 border-t border-white/5 pt-1 mt-1.5 shrink-0 select-none">
                            <span>模式：{gameDifficulty === 'easy' ? '启蒙单色' : gameDifficulty === 'normal' ? '标准双色轮播' : '三色竞速消'}</span>
                            <span>物理对齐：大语言模型装配</span>
                          </div>
                        </div>

                        {/* Right Space Sidebar for Gaming Metrics */}
                        <div className="w-full md:w-[35%] bg-indigo-950/50 border border-indigo-900/40 rounded-2xl p-2.5 flex flex-col justify-between shrink-0 text-white">
                          
                          {/* Score metrics */}
                          <div className="space-y-1.5 text-left">
                            <div className="bg-gradient-to-r from-amber-410 to-orange-500 rounded-lg py-1 px-1.5 text-center text-slate-950 font-black text-[9px] tracking-wide mb-1 flex items-center justify-center gap-1">
                              <Trophy size={11} />
                              <span>游戏实时成绩</span>
                            </div>

                            <div className="bg-black/30 p-2 rounded-xl text-center">
                              <div className="text-[8px] text-slate-450 font-bold uppercase">闯关积分</div>
                              <div className="text-xl font-black text-amber-300 font-mono tracking-wider">{playScore} 分</div>
                            </div>

                            <div className="bg-black/30 p-1.5 rounded-xl flex items-center justify-between">
                              <span className="text-[8px] font-bold text-slate-350">🔥 当前连击:</span>
                              <span className="text-[9px] font-black text-orange-400">{playStreak} COMBO</span>
                            </div>

                            <div className="p-2 bg-indigo-950/40 rounded-xl text-[8px] text-indigo-200 border border-indigo-900/40 break-all leading-normal max-h-[85px] overflow-y-auto">
                              <span className="font-extrabold text-indigo-300 block mb-0.5">💡 实操教育理念背景：</span>
                              {gameThought}
                            </div>
                          </div>

                          {/* Avatar voice feedback bubble */}
                          <div className="flex items-end gap-1.5 pt-1.5 border-t border-indigo-900/40">
                            <div className="w-9 h-12 shrink-0 relative">
                              <img 
                                src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/%E5%9B%BE%E7%89%87%20%E5%BC%A0%E5%8D%9A%E5%A3%AB.png" 
                                alt="Dr. Zhang avatar"
                                className="w-full h-full object-contain pr-0.5"
                              />
                            </div>
                            <div className="flex-1 bg-black/40 border border-indigo-900/40 p-2 rounded-xl select-none text-left">
                              <div className="text-slate-200 font-extrabold text-[8px] leading-relaxed">
                                🔊 张博士：{playFeedbackText}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Restarter button for game */}
                      <div className="mt-2 text-right shrink-0">
                        <button 
                          onClick={() => {
                            setPlayScore(0);
                            setPlayStreak(0);
                            setPlayFeedbackText('游戏再次重置就绪！小朋友开始快乐对准投掷吧！');
                            setP7SpeakText('游戏已重置，小朋友，我们开始快乐色彩消除对准大闯关吧！');
                          }}
                          className="px-2 py-0.8 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-[8px] rounded-md inline-flex items-center gap-1 shadow-sm transition active:scale-95 animate-pulse"
                        >
                          <RefreshCw size={8} />
                          重新挑战 🎮
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Prompt metadata visualizer in bottom row */}
          {generatedCode && (
            <div className="mt-3 p-3 bg-slate-900 text-cyan-400 rounded-2xl text-left shadow border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#94A3B8]">已自动生成的 HTML5/React 双层组件代码</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    alert('组件代码已成功复制到剪贴板！教师老师可以把这段代码分发给技术人员或者直接让 AI 持续微调。');
                  }}
                  className="text-[8px] border border-cyan-500/35 hover:border-cyan-400/80 px-2 py-0.5 rounded text-cyan-400 font-black transition bg-cyan-950/20"
                >
                  复制代码 📋
                </button>
              </div>
              <pre className="text-[8px] font-mono leading-relaxed h-[85px] overflow-y-auto select-all p-1 bg-slate-950 rounded border border-slate-800 text-slate-350">
                {generatedCode}
              </pre>
            </div>
          )}

        </div>
        
      </div>
    </div>
  );
}
