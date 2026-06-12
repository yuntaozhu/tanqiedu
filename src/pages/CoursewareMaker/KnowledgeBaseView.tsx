import React from 'react';
import { Database, Check, Copy } from 'lucide-react';
import { CoursewareProject } from './state';
import KnowledgeManager, { KnowledgeDoc } from './KnowledgeManager';

interface KnowledgeBaseViewProps {
  project: CoursewareProject;
  compiledKB: string;
  onKnowledgeChanged: (docs: KnowledgeDoc[]) => void;
}

export default function KnowledgeBaseView({ project, compiledKB, onKnowledgeChanged }: KnowledgeBaseViewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledKB);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('融合知识大纲已经保存到您的剪贴板');
      u.lang = 'zh-CN';
      window.speechSynthesis.speak(u);
    }
  };

  // Compute live counts
  const slideCount = project.slides.length;
  let totalAssets = 0;
  let totalHotspots = 0;
  let totalVoiceovers = 0;
  let gamesCount = 0;

  project.slides.forEach((s) => {
    const config = project.getSlideConfig(s.id);
    totalAssets += config.assets.length;
    totalHotspots += config.hotspots.length;
    totalVoiceovers += config.voiceovers.length;
    if (config.gameConfig.hasGame) gamesCount++;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HUB STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border rounded-2xl p-4.5 shadow-sm text-left flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">课时页面总数</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-600 font-mono">{slideCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">个步骤</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-sm text-left flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">媒体资产总量</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-650 font-mono">{totalAssets}</span>
            <span className="text-[10px] text-slate-400 font-bold">份多媒体</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-sm text-left flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">热圈物理感应点</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-500 font-mono">{totalHotspots}</span>
            <span className="text-[10px] text-slate-400 font-bold">个按压点</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-sm text-left flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">伴读配音音轨</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-pink-550 font-mono">{totalVoiceovers}</span>
            <span className="text-[10px] text-slate-400 font-bold">个真人文本</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-sm col-span-2 md:col-span-1 text-left flex flex-col justify-between bg-gradient-to-br from-indigo-50/20 to-blue-50/10">
          <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest block">挂载智能游戏</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 font-mono">{gamesCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">个玩法</span>
          </div>
        </div>
      </div>

      {/* 2. THE RICH KNOWLEDGE MANAGER (Add, Edit, Delete with localStorage) */}
      <KnowledgeManager onKnowledgeChanged={onKnowledgeChanged} />

      {/* 3. COMPILED MARKDOWN PAYLOAD SCOPE PREVIEW */}
      <div className="bg-white border border-slate-100 rounded-[2.25rem] p-6 shadow-sm text-left">
        <div className="flex justify-between items-center border-b border-slate-105 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 text-slate-705 rounded-xl border">
              <Database size={15} />
            </div>
            <h3 className="text-xs font-black text-slate-850 tracking-wider">探奇 AI 编译核心知识库 (Markdown 规范版 - Merge Preview)</h3>
          </div>
          
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${copied ? 'bg-emerald-55 text-white shadow-md shadow-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            {copied ? (
              <>
                <Check size={13} />
                <span>复制成功！已对准剪贴板</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>一键复制全量大纲</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10.5px] text-slate-500 mb-4 bg-slate-50 rounded-xl p-3 leading-relaxed border-l-2 border-indigo-500 font-sans">
          📌 此处实时展示被馈送入下一步 <strong>AI Sandbox 核心编译容器</strong>的知识网络。它包含了您规划的所有关卡细节
          及在上方<strong>“知识本源管理中心”</strong>内勾选/修改启用后的教案理论。两者双轴并轨，实现真正的专家级具身教学自动装配。
        </p>

        {/* Text Area presenting compiled code */}
        <div className="relative">
          <textarea
            readOnly
            rows={15}
            className="w-full px-5 py-4 bg-slate-900 border border-slate-800 text-yellow-100 font-mono text-[11px] leading-relaxed rounded-2xl focus:outline-none shadow-inner"
            value={compiledKB}
          />
          {/* Subtle decoration bottom-right overlay */}
          <div className="absolute right-4 bottom-4 text-[9px] font-bold font-mono text-white/30 uppercase tracking-widest">
            HMR Ready • Compiled Stream
          </div>
        </div>
      </div>

    </div>
  );
}
