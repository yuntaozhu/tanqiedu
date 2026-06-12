import { useState } from 'react';
import { 
  Copy, Check, Database
} from 'lucide-react';
import { CoursewareProject } from './state';

interface KnowledgeBaseViewProps {
  project: CoursewareProject;
  compiledKB: string;
}

export default function KnowledgeBaseView({ project, compiledKB }: KnowledgeBaseViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledKB);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('探奇核心知识库内容已复制');
      u.lang = 'zh-CN';
      window.speechSynthesis.speak(u);
    }
  };

  // Compile some funny stats for our visual stats widgets
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
      {/* 3.1 Visual Bento Grid Stats of the Knowledge Base */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border rounded-2xl p-4.5 shadow-sm text-left flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">课时页面总数</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-600">{slideCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">个步骤</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-sm text-left flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">媒体资产总量</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-650">{totalAssets}</span>
            <span className="text-[10px] text-slate-400 font-bold">份多媒体</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-sm text-left flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">热圈物理感应点</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-500">{totalHotspots}</span>
            <span className="text-[10px] text-slate-400 font-bold">个按压点</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-sm text-left flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">伴读配音音轨</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-pink-550">{totalVoiceovers}</span>
            <span className="text-[10px] text-slate-400 font-bold">个真人文本</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4.5 shadow-sm col-span-2 md:col-span-1 text-left flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">挂载智能游戏</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">{gamesCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">个玩法</span>
          </div>
        </div>
      </div>

      {/* 3.2 Main Compiled Knowledge Box */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-105 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Database className="text-indigo-650" size={18} />
            <h3 className="text-sm font-black text-slate-850 tracking-wider">探奇 AI 编译核心知识库 (Markdown 规范版)</h3>
          </div>
          
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${copied ? 'bg-emerald-50 text-emerald-800 border-emerald-250 border' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border'}`}
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-500" />
                <span>知识库复制成功</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>复制知识库内容</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10.5px] text-slate-500 mb-4 bg-slate-50 rounded-xl p-3 leading-relaxed border-l-2 border-indigo-500 font-sans">
          📌 此刻，我们的系统通过 `KnowledgeBaseCompiler` 设计类，将前述所有图形配置、素材引用、绝对坐标等编译融合成极其规整的 AI 知识资产，它将是下一步 AI Coding 实现具身游戏代码自动装配的核心基石！
        </p>

        {/* Text Area presenting compiled code */}
        <div className="relative">
          <textarea
            readOnly
            rows={18}
            className="w-full px-5 py-4 bg-slate-900 border border-slate-800 text-white font-mono text-[11px] leading-relaxed rounded-2xl focus:outline-none shadow-inner"
            value={compiledKB}
          />
          {/* Subtle decoration bottom-right overlay */}
          <div className="absolute right-4 bottom-4 text-[9px] font-bold font-mono text-white/40 uppercase">
            Compiled Asset Data
          </div>
        </div>
      </div>
    </div>
  );
}
