import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, Layers, Database, Cpu, Play
} from 'lucide-react';
import SyllabusPlanView from './SyllabusPlanView';
import PageDesignView from './PageDesignView';
import KnowledgeBaseView from './KnowledgeBaseView';
import AiCodingConfigView from './AiCodingConfigView';
import AiCodingSandboxView from './AiCodingSandboxView';

import { Slide, SlidesMap, SynthesisOptions, SlideData } from './types';
import { CoursewareProject, KnowledgeBaseCompiler, PromptSynthesizer } from './state';
import { KnowledgeDoc } from './KnowledgeManager';

// Prepopulate initial core state aligning with realistic sensory courseware specs
const initialSlides: Slide[] = [
  { id: 's1', pageNum: 1, title: '主导具微课导入 (P7备备包)', intent: '指导孩子观察 P7 的魔盘，手部比对实操画笔、九宫底架、定位卡纸备件。' },
  { id: 's2', pageNum: 2, title: '颜色空间站分类大消除', intent: '太空舱背景。幼儿将木质红黄蓝彩色木塞对准孔位滑轨放置消除，触发三生声谱音频。' }
];

const initialSlidesData: SlidesMap = {
  s1: {
    hotspots: [
      { id: "s1-h1", name: "① 三色画笔颜料", top: "16%", left: "18%", width: "16%", height: "18%", desc: "感应触点。判定幼儿桌面上的水粉笔和红黄蓝液体瓶已配齐。" },
      { id: "s1-h2", name: "② 探奇多孔底板", top: "43%", left: "14%", width: "15%", height: "18%", desc: "感应触点。检测物理双色插孔九宫底架已铺平在课桌表面。" },
      { id: "s1-h3", name: "③ 铺底卡纸卡位", top: "49%", left: "38%", width: "14%", height: "18%", desc: "感应触点。判定十联配色提示底纸已跟多孔棋具孔位相合对齐。" }
    ],
    assets: [
      { id: "s1-a1", name: "P7 教具背景清点图.png", url: "https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P7.png", purpose: "左侧主视画画板：实操棋具清点定位底板。" },
      { id: "s1-a2", name: "张博士(Dr. Zhang) 伴读形象", url: "https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/%E5%9B%BE%E7%89%87%20%E5%BC%A0%E5%8D%9A%E5%A3%AB.png", purpose: "解说主播。" }
    ],
    voiceovers: [
      { id: "s1-v1", slideId: "s1", label: "工厂清点指导语 - 张博士", url: "#mock", duration: "0:15" }
    ],
    gameConfig: {
      hasGame: false,
      gameTitle: '教具备品拼板核对',
      gameType: 'match',
      gameDifficulty: 'easy',
      gameThought: '检验幼儿实体器具是否准备妥帖。',
      gameTimerSec: 30,
      bgImage: ''
    }
  },
  s2: {
    hotspots: [
      { id: "s2-h1", name: "🔴 红色对齐孔", top: "25%", left: "22%", width: "15%", height: "15%", desc: "卡槽对准判定点。感应孩子将红色木彩块插入红色滑轨孔位中。" },
      { id: "s2-h2", name: "🟡 黄色对准孔", top: "25%", left: "42%", width: "15%", height: "15%", desc: "卡槽对准判定点。感应孩子将黄色木彩块插入黄色滑轨孔位中。" },
      { id: "s2-h3", name: "🔵 蓝色对准孔", top: "25%", left: "62%", width: "15%", height: "15%", desc: "卡槽对准判定点。感应孩子将蓝色木彩块插入蓝色滑轨孔位中。" }
    ],
    assets: [
      { id: "s2-a1", name: "太空站滑轨背景大图", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop", purpose: "主场景背景：高对比奇幻太空消消乐画板。" }
    ],
    voiceovers: [
      { id: "s2-v1", slideId: "s2", label: "色彩消除引导词 - 客观课件", url: "#mock", duration: "0:12" }
    ],
    gameConfig: {
      hasGame: true,
      gameTitle: '色彩空间站分类大消除',
      gameType: 'eliminate',
      gameDifficulty: 'normal',
      gameThought: '1. 【物理消去与颜色联觉】：配合顶部提示放置原色木块实现闪烁消除，连击加倍。\n2. 【具身闭环反馈】：结合张博士语音通关鼓励，成就感大满贯。',
      gameTimerSec: 30,
      bgImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop'
    }
  }
};

export default function CoursewareMaker() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Core Reactive hooks representing project state
  const [courseTitle, setCourseTitle] = useState('红黄蓝配对大闯关');
  const [targetAge, setTargetAge] = useState('3-6岁 (幼小衔接)');
  const [teachingObjectives, setTeachingObjectives] = useState(
    '1. 让幼儿掌握红黄蓝三原色基本认知。\n2. 通过亲自动手比对和点击，培养手脑联觉与空间感。\n3. 在轻快的备课声音与胜利派对中，锻炼思维专注力和探求习惯。'
  );
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [slidesMap, setSlidesMap] = useState<SlidesMap>(initialSlidesData);
  const [activeSlideId, setActiveSlideId] = useState<string>('s1');

  // Compilation & Prompt states
  const [options, setOptions] = useState<SynthesisOptions>({
    selectedModel: 'gemini-3.1-pro-preview',
    extraPrompts: '请添加 canvas-confetti 作为大满贯特效；界面交互按钮尺寸在移动端/触屏上需保持易用。',
    enableConfetti: true,
    enableVoiceSynthesis: true,
    layoutPreference: 'balanced-split',
    offlineMode: true
  });
  
  const [compiledKB, setCompiledKB] = useState('');
  const [synthesizedPrompt, setSynthesizedPrompt] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Custom persistent knowledge docs
  const [kbDocs, setKbDocs] = useState<KnowledgeDoc[]>([]);

  // States inside sandbox compiler simulator
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);

  // Create under-the-hood OOP state model instance
  const [project] = useState(() => new CoursewareProject());

  // Keep OOP model in sync with react state
  useEffect(() => {
    project.loadFromPlainData(courseTitle, targetAge, teachingObjectives, slides, slidesMap);
    
    // Automatically re-compile knowledge base and prompt payload whenever configuration updates!
    const kb = KnowledgeBaseCompiler.compile(project, kbDocs);
    setCompiledKB(kb);

    const prompt = PromptSynthesizer.synthesize(kb, options);
    setSynthesizedPrompt(prompt);
  }, [courseTitle, targetAge, teachingObjectives, slides, slidesMap, options, kbDocs]);

  // Handle slide operations
  const handleAddSlide = (title: string, intent: string) => {
    const newS = project.addSlide(title, intent);
    setSlides([...project.slides]);
    setSlidesMap(project.exportSlidesMapPlain());
    setActiveSlideId(newS.id);
  };

  const handleDeleteSlide = (id: string) => {
    project.deleteSlide(id);
    setSlides([...project.slides]);
    setSlidesMap(project.exportSlidesMapPlain());
    // Auto adjust selection if deleted the chosen slide
    if (activeSlideId === id && project.slides.length > 0) {
      setActiveSlideId(project.slides[0].id);
    }
  };

  const handleUpdateSlide = (id: string, title: string, intent: string) => {
    project.renameSlide(id, title, intent);
    setSlides([...project.slides]);
  };

  const handleUpdateSlideConfig = (slideId: string, updatedData: Partial<SlideData>) => {
    const slideConfig = project.getSlideConfig(slideId);
    if (updatedData.assets !== undefined) slideConfig.assets = updatedData.assets;
    if (updatedData.hotspots !== undefined) slideConfig.hotspots = updatedData.hotspots;
    if (updatedData.voiceovers !== undefined) slideConfig.voiceovers = updatedData.voiceovers;
    if (updatedData.gameConfig !== undefined) {
      slideConfig.gameConfig = { ...slideConfig.gameConfig, ...updatedData.gameConfig };
    }
    setSlidesMap(project.exportSlidesMapPlain());
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(synthesizedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const triggerHmrCompile = () => {
    setActiveStep(5);
    setIsCompiling(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans antialiased text-slate-800">
      
      {/* 1. HEADER SECTION (with design philosophy constraints) */}
      <div className="w-full bg-white border-b border-slate-100 py-6 px-4 md:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-blue-600" size={20} />
              <span>探奇 AI 具身物理课件制作大师 (Courseware Studio)</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-xl font-sans leading-relaxed">
              基于大模型代码装配与实体感知交互（Hotspots coordinates detection）设计的教师备课工具。五步即可完成完整的物理/联觉探索 Web 卡件开发。
            </p>
          </div>

          {/* Quick Stats overview of steps */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] px-2.5 py-1 text-slate-500 font-extrabold font-mono">HMR Sandbox Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-6">
        
        {/* 2. PROGRESS ROADMAP STEP BAR (Satisfies Steps 1 to 5) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { num: 1, title: '第一步：教学大纲规划', desc: '整体关卡及框架配置', icon: BookOpen, accent: 'text-blue-500 border-blue-500' },
              { num: 2, title: '第二步：页面设计打点', desc: '单独配置素材/热区/游戏', icon: Layers, accent: 'text-indigo-500 border-indigo-500' },
              { num: 3, title: '第三步：AI 知识重组', desc: '生成高结构课程知识库', icon: Database, accent: 'text-teal-500 border-teal-500' },
              { num: 4, title: '第四步：提示词参数调校', desc: '补充部署指令并导出提示词', icon: Cpu, accent: 'text-blue-650 border-blue-650' },
              { num: 5, title: '第五步：AI Coding 沙箱', desc: 'HMR 极速编译最终运行课件', icon: Play, accent: 'text-red-500 border-red-500' }
            ].map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num as any)}
                  className={`p-3 rounded-2xl text-left transition-all relative flex flex-col justify-between h-20 cursor-pointer ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-150 border-l-4 border-indigo-400' : 'bg-slate-50 border border-slate-150 text-slate-700 hover:bg-slate-100'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      Step 0{step.num}
                    </span>
                    <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-xs font-black block tracking-tight truncate">{step.title.split('：')[1]}</strong>
                    <p className={`text-[9px] truncate ${isActive ? 'text-indigo-150' : 'text-slate-400'}`}>{step.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. STEP CONTENT VIEWPORT WITH MOTION TRANSITION */}
        <div className="min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Step 1 View */}
              {activeStep === 1 && (
                <SyllabusPlanView
                  courseTitle={courseTitle}
                  setCourseTitle={setCourseTitle}
                  targetAge={targetAge}
                  setTargetAge={setTargetAge}
                  teachingObjectives={teachingObjectives}
                  setTeachingObjectives={setTeachingObjectives}
                  slides={slides}
                  onAddSlide={handleAddSlide}
                  onDeleteSlide={handleDeleteSlide}
                  onUpdateSlide={handleUpdateSlide}
                />
              )}

              {/* Step 2 View */}
              {activeStep === 2 && (
                <PageDesignView
                  slides={slides}
                  activeSlideId={activeSlideId}
                  setActiveSlideId={setActiveSlideId}
                  getSlideConfig={(id) => project.getSlideConfig(id)}
                  onUpdateConfig={handleUpdateSlideConfig}
                />
              )}

              {/* Step 3 View */}
              {activeStep === 3 && (
                <KnowledgeBaseView
                  project={project}
                  compiledKB={compiledKB}
                  onKnowledgeChanged={setKbDocs}
                />
              )}

              {/* Step 4 View */}
              {activeStep === 4 && (
                <AiCodingConfigView
                  options={options}
                  setOptions={setOptions}
                  synthesizedPrompt={synthesizedPrompt}
                  setSynthesizedPrompt={setSynthesizedPrompt}
                  onCopyPrompt={handleCopyPrompt}
                  copiedPrompt={copiedPrompt}
                  onTriggerCompile={triggerHmrCompile}
                />
              )}

              {/* Step 5 View */}
              {activeStep === 5 && (
                <AiCodingSandboxView
                  prompt={synthesizedPrompt}
                  isCompiling={isCompiling}
                  setIsCompiling={setIsCompiling}
                  compileProgress={compileProgress}
                  setCompileProgress={setCompileProgress}
                  compileLogs={compileLogs}
                  setCompileLogs={setCompileLogs}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
