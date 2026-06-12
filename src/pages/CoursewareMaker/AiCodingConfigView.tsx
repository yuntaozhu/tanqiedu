import React from 'react';
import { 
  Settings2, Cpu, Layout, FileText, 
  ChevronRight, Copy, Check 
} from 'lucide-react';
import { SynthesisOptions } from './types';

interface AiCodingConfigViewProps {
  options: SynthesisOptions;
  setOptions: React.Dispatch<React.SetStateAction<SynthesisOptions>>;
  synthesizedPrompt: string;
  setSynthesizedPrompt: (p: string) => void;
  onCopyPrompt: () => void;
  copiedPrompt: boolean;
  onTriggerCompile: () => void;
}

export default function AiCodingConfigView({
  options,
  setOptions,
  synthesizedPrompt,
  setSynthesizedPrompt,
  onCopyPrompt,
  copiedPrompt,
  onTriggerCompile
}: AiCodingConfigViewProps) {

  const handleToggleConfetti = () => {
    setOptions(prev => ({ ...prev, enableConfetti: !prev.enableConfetti }));
  };

  const handleToggleVoice = () => {
    setOptions(prev => ({ ...prev, enableVoiceSynthesis: !prev.enableVoiceSynthesis }));
  };

  const handleToggleOffline = () => {
    setOptions(prev => ({ ...prev, offlineMode: !prev.offlineMode }));
  };

  const handleModelChange = (model: any) => {
    setOptions(prev => ({ ...prev, selectedModel: model }));
  };

  const handleLayoutChange = (layout: any) => {
    setOptions(prev => ({ ...prev, layoutPreference: layout }));
  };

  const handleExtraPromptsChange = (text: string) => {
    setOptions(prev => ({ ...prev, extraPrompts: text }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: LLM Settings and Features Toggles (5/12) */}
      <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6 text-left">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Settings2 className="text-blue-600" size={18} />
          <h3 className="text-xs font-black text-slate-850 tracking-wider">AI Coding 编译配置舱</h3>
        </div>

        {/* 1. Model selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-1">
            <Cpu size={12} className="text-slate-500" />
            <span>智能生成大模型选择</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (推荐/深度逻辑)', desc: '支持极致逻辑判定与复杂的具身对齐机制。' },
              { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: '极速响应、轻量，适合生成常规探索页。' },
              { id: 'doubao-pro', name: '豆包 Doubao-Pro', desc: '中文拟真流畅，专注场景情感互动语。' },
              { id: 'deepseek-coder', name: 'DeepSeek-Coder', desc: '深度优化算法结构，确保零打包编译警告。' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModelChange(m.id as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${options.selectedModel === m.id ? 'bg-blue-50/50 border-blue-400 text-blue-950' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{m.name}</span>
                  {options.selectedModel === m.id && (
                    <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                      已挂载
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Visual Layout Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-1">
            <Layout size={12} className="text-slate-500" />
            <span>目标交互面板布局方案</span>
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none transition-colors"
            value={options.layoutPreference}
            onChange={(e) => handleLayoutChange(e.target.value as any)}
          >
            <option value="balanced-split">左右黄金双栏 (左画布 / 右指引舱)</option>
            <option value="immersive-canvas">沉浸式 16:9 物理浮层交互大画布</option>
            <option value="bento-grid">Bento Grid 探奇高级控制舱 (卡片式)</option>
          </select>
        </div>

        {/* 3. Compilation switches */}
        <div className="space-y-3.5 pt-2 border-t">
          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">附加辅助装配选项</label>
          
          {/* Switch 1: Confetti */}
          <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800">大满贯彩弹效果</span>
              <p className="text-[9px] text-slate-400 font-sans">清点满分或消除通关时爆裂 canvas-confetti 礼花。</p>
            </div>
            <button
              onClick={handleToggleConfetti}
              className={`w-11 h-6 rounded-full p-1 transition cursor-pointer relative flex ${options.enableConfetti ? 'bg-emerald-500 justify-end' : 'bg-slate-350 justify-start'}`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
            </button>
          </div>

          {/* Switch 2: Speech Synthesis */}
          <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800">SpeechSynthesis 解说拟声</span>
              <p className="text-[9px] text-slate-400 font-sans">触发浏览器伴读，朗读张博士的判定音画指导。</p>
            </div>
            <button
              onClick={handleToggleVoice}
              className={`w-11 h-6 rounded-full p-1 transition cursor-pointer relative flex ${options.enableVoiceSynthesis ? 'bg-emerald-500 justify-end' : 'bg-slate-350 justify-start'}`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
            </button>
          </div>

          {/* Switch 3: Offline Mode */}
          <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800">纯本地 React State 策略</span>
              <p className="text-[9px] text-slate-400 font-sans">跳过外部网络 API 存储，直接在前端沙盒中极速渲染。</p>
            </div>
            <button
              onClick={handleToggleOffline}
              className={`w-11 h-6 rounded-full p-1 transition cursor-pointer relative flex ${options.offlineMode ? 'bg-emerald-500 justify-end' : 'bg-slate-350 justify-start'}`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        {/* 4. Extra prompt directions */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">给 AI 助手的补充个性化部署指令</label>
          <textarea
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-750 bg-slate-50 focus:bg-white focus:outline-none transition-all font-sans leading-relaxed"
            placeholder="例如: 让界面风格呈现稍微带复古风的科技感，配对成功音效要非常欢快..."
            value={options.extraPrompts}
            onChange={(e) => handleExtraPromptsChange(e.target.value)}
          />
        </div>
      </div>

      {/* Right Column: Editable compiled prompt (7/12) */}
      <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-5 text-left">
        <div className="flex justify-between items-center border-b border-slate-105 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={18} />
            <span className="text-xs font-black text-slate-850">AI 自动编译装配提示词 (支持二次修改)</span>
          </div>

          <button
            onClick={onCopyPrompt}
            className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${copiedPrompt ? 'bg-emerald-50 text-emerald-800 border-emerald-250 border' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border'}`}
          >
            {copiedPrompt ? (
              <>
                <Check size={13} className="text-emerald-500" />
                <span>复制提示词成功</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>复制提示词</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10.5px] text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed border-l-2 border-blue-500 font-sans">
          📝 探奇 AI Coding 提示词现在装配完成。如果需要添加细分的逻辑限制，**您可以直接在下方编辑框中进行文本修改/删减**，然后再点击底部的自动执行按钮启动编译装载！
        </p>

        {/* Live editable prompt block */}
        <textarea
          rows={15}
          className="w-full px-5 py-4 bg-slate-900 border border-slate-800 text-white font-mono text-[11px] leading-relaxed rounded-2xl focus:outline-none shadow-inner"
          value={synthesizedPrompt}
          onChange={(e) => setSynthesizedPrompt(e.target.value)}
        />

        {/* Compile Trigger Button! */}
        <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-[10px] text-slate-400 font-bold block">
            ✔ AI 自动生成的提示词已准备齐备
          </span>
          <button
            onClick={onTriggerCompile}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-550 hover:to-indigo-600 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🚀 触发 HMR 自动编译装配 </span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
