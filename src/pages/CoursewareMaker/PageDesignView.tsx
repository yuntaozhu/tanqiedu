import React, { useState, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Wand2, Volume2, Layers, MapPin, 
  Image as ImageIcon
} from 'lucide-react';
import { Slide, SlideData, Hotspot, Asset, Voiceover, GameConfig } from './types';
import { SlideConfiguration } from './state';

interface PageDesignViewProps {
  slides: Slide[];
  activeSlideId: string;
  setActiveSlideId: (id: string) => void;
  getSlideConfig: (id: string) => SlideConfiguration;
  onUpdateConfig: (id: string, updatedData: Partial<SlideData>) => void;
}

// Predefined presets to make it incredibly easy for the user to configure high-fidelity pages
const ASSET_PRESETS = [
  { name: '🌟 P7 实操教具背景 (张博士备课)', url: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P7.png', purpose: '左下方放置作为实操棋具清点面板，供孩子点击核对。' },
  { name: '🔬 智能三原色实验室大图', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop', purpose: '背景大图：16:9 奇幻画风格物理实验基地。' },
  { name: '🛸 太空科幻对齐站滑轨 P3', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop', purpose: '背景：科幻动感色彩消除与滑轨对准空间。' },
  { name: '👨‍🏫 张博士(Dr. Zhang) 伴读虚拟形象', url: 'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/%E5%9B%BE%E7%89%87%20%E5%BC%A0%E5%8D%9A%E5%A3%AB.png', purpose: '右下角解说伴读主播，用于语音和判定表扬。' }
];

export default function PageDesignView({
  slides,
  activeSlideId,
  setActiveSlideId,
  getSlideConfig,
  onUpdateConfig
}: PageDesignViewProps) {
  // If no slides, show alert
  if (slides.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center text-slate-400 space-y-4 shadow-sm">
        <Layers size={45} className="mx-auto opacity-30 text-indigo-500 animate-pulse" />
        <p className="text-xs font-black">在大纲规划里先分配几个关卡页，接着在此页即可独立调试每页的素材及热区哦！</p>
      </div>
    );
  }

  const selectedSlide = slides.find(s => s.id === activeSlideId) || slides[0];
  const config = getSlideConfig(selectedSlide.id);

  // States for adding hotspots, assets, voiceovers
  const [subTab, setSubTab] = useState<'assets' | 'hotspots' | 'game'>('assets');
  
  // Asset state
  const [assetName, setAssetName] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [assetPurpose, setAssetPurpose] = useState('');

  // Voiceover state
  const [voiceLabel, setVoiceLabel] = useState('');
  const [voiceDuration, setVoiceDuration] = useState('0:10');

  // Hotspot State
  const [hotspotName, setHotspotName] = useState('');
  const [hotspotDesc, setHotspotDesc] = useState('');
  const [hotspotTop, setHotspotTop] = useState('30%');
  const [hotspotLeft, setHotspotLeft] = useState('30%');
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto detect coordinates upon clicking mock canvas background
  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setHotspotLeft(`${Math.floor(x)}%`);
    setHotspotTop(`${Math.floor(y)}%`);
    
    // Play sound notification
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`已捕获定位，横坐标百分之${Math.floor(x)}，纵坐标百分之${Math.floor(y)}`);
      u.lang = 'zh-CN';
      u.volume = 0.5;
      window.speechSynthesis.speak(u);
    }
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !assetUrl.trim()) return;
    const newAsset: Asset = {
      id: 'a_' + Date.now(),
      name: assetName,
      url: assetUrl,
      purpose: assetPurpose || '无特殊修饰用途'
    };
    onUpdateConfig(selectedSlide.id, {
      assets: [...config.assets, newAsset]
    });
    setAssetName('');
    setAssetUrl('');
    setAssetPurpose('');
  };

  const handleApplyPresetAsset = (preset: typeof ASSET_PRESETS[0]) => {
    const newAsset: Asset = {
      id: 'a_' + Date.now() + Math.random().toString(36).substr(2, 2),
      name: preset.name,
      url: preset.url,
      purpose: preset.purpose
    };
    onUpdateConfig(selectedSlide.id, {
      assets: [...config.assets, newAsset]
    });
  };

  const handleAddVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceLabel.trim()) return;
    const newVO: Voiceover = {
      id: 'v_' + Date.now(),
      slideId: selectedSlide.id,
      label: voiceLabel,
      url: '#mock',
      duration: voiceDuration
    };
    onUpdateConfig(selectedSlide.id, {
      voiceovers: [...config.voiceovers, newVO]
    });
    setVoiceLabel('');
    setVoiceDuration('0:10');
  };

  const handleAddHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotspotName.trim()) return;
    const newH: Hotspot = {
      id: 'h_' + Date.now(),
      name: hotspotName,
      top: hotspotTop,
      left: hotspotLeft,
      width: '16%',
      height: '16%',
      desc: hotspotDesc || '检测点击并触发对应科普反馈。'
    };
    onUpdateConfig(selectedSlide.id, {
      hotspots: [...config.hotspots, newH]
    });
    setHotspotName('');
    setHotspotDesc('');
  };

  const handleDeleteHotspot = (id: string) => {
    onUpdateConfig(selectedSlide.id, {
      hotspots: config.hotspots.filter(h => h.id !== id)
    });
  };

  const handleDeleteAsset = (id: string) => {
    onUpdateConfig(selectedSlide.id, {
      assets: config.assets.filter(a => a.id !== id)
    });
  };

  const handleDeleteVO = (id: string) => {
    onUpdateConfig(selectedSlide.id, {
      voiceovers: config.voiceovers.filter(v => v.id !== id)
    });
  };

  const handleUpdateGameConfig = (updates: Partial<GameConfig>) => {
    onUpdateConfig(selectedSlide.id, {
      gameConfig: { ...config.gameConfig, ...updates }
    });
  };

  // Get current main background image if present
  const mainBgAsset = config.assets.find(a => a.name.includes('背景') || a.name.includes('背景图') || a.name.includes('P7') || a.name.includes('P3') || a.name.includes('图'));
  const bgUrl = mainBgAsset ? mainBgAsset.url : 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop';

  return (
    <div className="space-y-6">
      {/* 2.1 Horizontal Top Slide Picker tab */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">当前选定页:</span>
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {slides.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSlideId(s.id);
                // Trigger localized speech cue to enrich ambient design
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance(`已选中课时步骤${s.pageNum}，${s.title}`);
                  u.lang = 'zh-CN';
                  u.volume = 0.4;
                  window.speechSynthesis.speak(u);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${activeSlideId === s.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-50 border text-slate-600 hover:bg-slate-100'}`}
            >
              P{s.pageNum}. {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editor Tabs & Configuration Panels (7/12) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
          {/* Sub Navigation */}
          <div className="flex border-b border-slate-100 pb-3 gap-6">
            <button
              onClick={() => setSubTab('assets')}
              className={`pb-1 text-xs font-black tracking-wider transition-colors relative cursor-pointer ${subTab === 'assets' ? 'text-indigo-650 font-black' : 'text-slate-400 hover:text-slate-700'}`}
            >
              📷 1. 独立素材与语音
              {subTab === 'assets' && (
                <motion.div layoutId="subTabLine" className="absolute bottom-[-13px] left-0 right-0 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSubTab('hotspots')}
              className={`pb-1 text-xs font-black tracking-wider transition-colors relative cursor-pointer ${subTab === 'hotspots' ? 'text-indigo-650 font-black' : 'text-slate-400 hover:text-slate-700'}`}
            >
              🔴 2. 交互打点与热区
              {subTab === 'hotspots' && (
                <motion.div layoutId="subTabLine" className="absolute bottom-[-13px] left-0 right-0 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSubTab('game')}
              className={`pb-1 text-xs font-black tracking-wider transition-colors relative cursor-pointer ${subTab === 'game' ? 'text-indigo-650 font-black' : 'text-slate-400 hover:text-slate-700'}`}
            >
              🎮 3. 游戏机制脑图设计
              {subTab === 'game' && (
                <motion.div layoutId="subTabLine" className="absolute bottom-[-13px] left-0 right-0 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* SUB-PANEL 1: Assets & Voiceovers */}
            {subTab === 'assets' && (
              <motion.div
                key="assets"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {/* Visual Preset Launcher */}
                <div className="bg-gradient-to-r from-teal-50/50 to-emerald-50/20 border border-teal-100 rounded-2xl p-4.5">
                  <h4 className="text-[10px] font-black text-teal-900 tracking-wider uppercase mb-2 flex items-center gap-1">
                    <Wand2 size={12} className="text-teal-600 animate-spin" />
                    <span>闪击配课资产库 (快捷注入设计)</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ASSET_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleApplyPresetAsset(p);
                          if ('speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance('素材资产已成功植入');
                            u.lang = 'zh-CN';
                            window.speechSynthesis.speak(u);
                          }
                        }}
                        className="text-[10px] px-2.5 py-1.5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-120 hover:border-teal-300 font-bold rounded-lg transition active:scale-95 text-left"
                      >
                        + {p.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adding form */}
                <form onSubmit={handleAddAsset} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">素材包/插画名</label>
                      <input
                        type="text"
                        placeholder="例如: 主场景奇幻备课.png"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                        value={assetName}
                        onChange={(e) => setAssetName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">素材网络 URL 引用</label>
                      <input
                        type="text"
                        placeholder="http://..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                        value={assetUrl}
                        onChange={(e) => setAssetUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">在课件画布中的作用 (用途与图层权重)</label>
                    <input
                      type="text"
                      placeholder="例如: 16:9 奇幻画风太空魔法提炼基地背景..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                      value={assetPurpose}
                      onChange={(e) => setAssetPurpose(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!assetName.trim() || !assetUrl.trim()}
                    className="py-2 px-5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-black rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    添加多媒体素材
                  </button>
                </form>

                {/* Voiceovers list within Assets tab */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="text-xs font-black text-slate-550 flex items-center gap-1.5">
                    <Volume2 size={14} className="text-pink-500" />
                    <span>独立解说配音音轨配置</span>
                  </h4>
                  <form onSubmit={handleAddVoice} className="flex gap-3 items-end bg-slate-50 p-4 rounded-xl border">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">配音任务指令 / 真人朗读文本</label>
                      <input
                        type="text"
                        placeholder="例如: 张博士指导语 - 引导幼儿插孔底纸..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                        value={voiceLabel}
                        onChange={(e) => setVoiceLabel(e.target.value)}
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">预估时长</label>
                      <input
                        type="text"
                        placeholder="0:10"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                        value={voiceDuration}
                        onChange={(e) => setVoiceDuration(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!voiceLabel.trim()}
                      className="py-2.5 px-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer"
                    >
                      挂载音轨
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* SUB-PANEL 2: Interactive Hotspots */}
            {subTab === 'hotspots' && (
              <motion.div
                key="hotspots"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-[10.5px] leading-relaxed text-indigo-900 font-sans">
                  💡 **智能化热区打点助手**：点击右侧的图像画布，系统将**自动抓取**该点的物理位置比例并填写到下方位置栏。您只需补充点击后的教学判定解说文本，再点击"插入热区"即可！
                </div>

                <form onSubmit={handleAddHotspot} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">拟真热点命名 (带Emoji)</label>
                      <input
                        type="text"
                        placeholder="例如: 🔴 红色提取熔炉"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                        value={hotspotName}
                        onChange={(e) => setHotspotName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">定位 顶(Y)</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-500 bg-slate-50 focus:outline-none font-mono font-bold"
                          value={hotspotTop}
                          onChange={(e) => setHotspotTop(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">定位 左(X)</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-500 bg-slate-50 focus:outline-none font-mono font-bold"
                          value={hotspotLeft}
                          onChange={(e) => setHotspotLeft(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">点击该点后的微课判定科普旁白</label>
                    <input
                      type="text"
                      placeholder="张博士判定：物理原色提炼熔炉，点击播放红色科普提示与物理音效..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none font-sans"
                      value={hotspotDesc}
                      onChange={(e) => setHotspotDesc(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!hotspotName.trim()}
                    className="py-2.5 px-6 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-black rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    插入点击侦测热区
                  </button>
                </form>
              </motion.div>
            )}

            {/* SUB-PANEL 3: Gameplay logic parameters */}
            {subTab === 'game' && (
              <motion.div
                key="game"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800">在此页挂载探奇益智迷你游戏</span>
                    <p className="text-[10px] text-slate-400 leading-normal">开启手部实物操控与虚拟音像联觉的微型积分通关判定机制。</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateGameConfig({ hasGame: !config.gameConfig.hasGame })}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${config.gameConfig.hasGame ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {config.gameConfig.hasGame ? '🎮 游戏已挂载' : '⏳ 未挂载限制'}
                  </button>
                </div>

                {config.gameConfig.hasGame && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 border-l-2 border-indigo-200 pl-4 py-2"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Game Title */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">闯关游戏名称</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                          value={config.gameConfig.gameTitle}
                          onChange={(e) => handleUpdateGameConfig({ gameTitle: e.target.value })}
                        />
                      </div>

                      {/* Game Type Selection */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">心智游戏模式</label>
                        <select
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                          value={config.gameConfig.gameType}
                          onChange={(e) => handleUpdateGameConfig({ gameType: e.target.value as any })}
                        >
                          <option value="match">具身三色对准配对 (Match)</option>
                          <option value="eliminate">多孔物理卡槽消除 (Eliminate)</option>
                          <option value="sequence">律动空位颜色对准 (Sequence)</option>
                          <option value="synth">合成发声主旋律粒子琴 (Synth)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Difficulty Selection */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">幼儿段建议难度</label>
                        <select
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                          value={config.gameConfig.gameDifficulty}
                          onChange={(e) => handleUpdateGameConfig({ gameDifficulty: e.target.value as any })}
                        >
                          <option value="easy">🌟 探索(低幼级)</option>
                          <option value="normal">⭐⭐ 协同(标准级)</option>
                          <option value="hard">⭐⭐⭐ 敏捷(大班强化)</option>
                        </select>
                      </div>

                      {/* Countdown Timer */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">每次挑战倒计时 (秒)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                          value={config.gameConfig.gameTimerSec}
                          onChange={(e) => handleUpdateGameConfig({ gameTimerSec: parseInt(e.target.value) || 30 })}
                        />
                      </div>
                    </div>

                    {/* Intellectual gameplay thoughts */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">互动游戏化思考与具身心智机制</label>
                      <textarea
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-750 focus:outline-none font-sans leading-relaxed"
                        placeholder="例如: 1. 【物理发声联觉】：点击多孔卡槽触发三和弦声律音频... 2. 【连击加分机制】..."
                        value={config.gameConfig.gameThought}
                        onChange={(e) => handleUpdateGameConfig({ gameThought: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Render Active Profiles Metadata lists (Subordinate Assets overview) */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase">当前步骤配置资产清单</h4>
            
            {/* Display Assets List */}
            {config.assets.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold block">🌌 已挂载美术/音频素材 ({config.assets.length})</span>
                <div className="grid grid-cols-1 gap-2">
                  {config.assets.map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center text-xs p-2.5 px-3 bg-slate-50 border border-slate-150 rounded-xl">
                      <div className="truncate pr-4 space-y-0.5">
                        <span className="font-bold text-slate-800">{asset.name}</span>
                        <p className="text-[9px] text-slate-500 truncate">{asset.purpose}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                        title="删除素材"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display Voiceovers */}
            {config.voiceovers.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-slate-500 font-bold block">🎙️ 下解讲指导配音目录 ({config.voiceovers.length})</span>
                <div className="grid grid-cols-1 gap-2">
                  {config.voiceovers.map((vo) => (
                    <div key={vo.id} className="flex justify-between items-center text-xs p-2.5 px-3 bg-pink-50/30 border border-pink-100 rounded-xl">
                      <div className="truncate pr-4 space-y-0.5">
                        <span className="font-black text-pink-900">{vo.label}</span>
                        <p className="text-[9px] text-slate-400 font-mono">预估时长：{vo.duration}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteVO(vo.id)}
                        className="p-1.5 hover:bg-pink-100 text-slate-400 hover:text-pink-600 rounded transition cursor-pointer"
                        title="删除配音"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: High-fidelity visual preview simulator with absolute placement (5/12) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={16} className="text-yellow-500" />
              <h3 className="text-xs font-black text-slate-800">P{selectedSlide.pageNum} 打点与画布预览模拟器</h3>
            </div>
            <span className="text-[9px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-full font-black">16:9 画幅</span>
          </div>

          <p className="text-[10px] text-slate-500 leading-normal font-sans">
            下图展示对应背景资产的对齐状态。**在图像任意地方点击**，顶部的 Y/X 位置比例会自动录入！随后在左侧「交互打点」内补充说明快速完成新增。
          </p>

          {/* Interactive Mock Frame representation */}
          <div className="relative border border-slate-250 rounded-2xl overflow-hidden shadow-inner bg-slate-900 aspect-video group">
            {/* Visual Canvas ref */}
            <div 
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-full cursor-crosshair relative bg-cover bg-center"
              style={{ backgroundImage: `url(${bgUrl})` }}
            >
              {/* Absolutes positions hotspots representing hotspots */}
              {config.hotspots.map((h) => (
                <div
                  key={h.id}
                  className="absolute cursor-default group"
                  style={{
                    top: h.top,
                    left: h.left,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid triggering coordinates capture when clicking hotspot
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(`热点：${h.name}。探测机制：${h.desc}`);
                      u.lang = 'zh-CN';
                      window.speechSynthesis.speak(u);
                    }
                  }}
                >
                  {/* Ripple pulse point circle */}
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5.5 w-5.5 bg-red-600 border border-white items-center justify-center text-[9px] text-white font-black hover:scale-120 transition-transform cursor-pointer shadow-md shadow-red-200">
                      ★
                    </span>
                  </div>

                  {/* Absolute visual float guide tooltip */}
                  <div className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-[9px] text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal max-w-[150px] shadow-lg leading-relaxed font-sans z-30">
                    <strong className="text-yellow-300 block mb-0.5">{h.name}</strong>
                    <span>{h.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Float watermark bar */}
            <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-bold text-white">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>张博士智慧备课伴读形象就位</span>
            </div>
          </div>

          {/* List of currently compiled Hotspots below canvas for fast review */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1">
              <MapPin size={11} className="text-red-500" />
              <span>已部署触觉探奇热点 ({config.hotspots.length})</span>
            </h4>

            {config.hotspots.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">在此页大图内轻点，可快速标记孩子配合棋具在课件里点按探测的热区位置坐标。</p>
            ) : (
              <div className="max-h-[140px] overflow-y-auto space-y-1.5 border-l-2 border-slate-100 pl-3.5">
                {config.hotspots.map((h) => (
                  <div key={h.id} className="text-[11px] leading-relaxed flex items-start justify-between bg-slate-50 p-2.5 rounded-lg border">
                    <div className="pr-3 space-y-0.5">
                      <strong className="text-slate-850 block font-black">{h.name}</strong>
                      <p className="text-[9.5px] text-slate-500 leading-normal font-sans">{h.desc}</p>
                      <span className="text-[8.5px] text-slate-400 font-mono font-bold block">坐标：X-{h.left}, Y-{h.top}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteHotspot(h.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-white p-1 rounded transition cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
