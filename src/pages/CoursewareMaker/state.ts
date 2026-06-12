import { Hotspot, Asset, Voiceover, GameConfig, Slide, SlideData, SlidesMap, SynthesisOptions } from './types';
import { KnowledgeDoc } from './KnowledgeManager';

/**
 * SlideConfiguration holds editable configurations for a single lesson page.
 */
export class SlideConfiguration {
  public id: string;
  public hotspots: Hotspot[];
  public assets: Asset[];
  public voiceovers: Voiceover[];
  public gameConfig: GameConfig;

  constructor(id: string, initialData?: SlideData) {
    this.id = id;
    if (initialData) {
      this.hotspots = [...initialData.hotspots];
      this.assets = [...initialData.assets];
      this.voiceovers = [...initialData.voiceovers];
      this.gameConfig = { ...initialData.gameConfig };
    } else {
      this.hotspots = [];
      this.assets = [];
      this.voiceovers = [];
      this.gameConfig = {
        hasGame: false,
        gameTitle: '新课时趣味小游戏',
        gameType: 'match',
        gameDifficulty: 'normal',
        gameThought: '激发互动认知感官融合',
        gameTimerSec: 30,
        bgImage: ''
      };
    }
  }

  public addHotspot(hotspot: Hotspot) {
    this.hotspots.push(hotspot);
  }

  public removeHotspot(id: string) {
    this.hotspots = this.hotspots.filter(h => h.id !== id);
  }

  public addAsset(asset: Asset) {
    this.assets.push(asset);
  }

  public removeAsset(id: string) {
    this.assets = this.assets.filter(a => a.id !== id);
  }

  public addVoiceover(voice: Voiceover) {
    this.voiceovers.push(voice);
  }

  public removeVoiceover(id: string) {
    this.voiceovers = this.voiceovers.filter(v => v.id !== id);
  }

  public updateGameConfig(config: Partial<GameConfig>) {
    this.gameConfig = { ...this.gameConfig, ...config };
  }

  public toPlainData(): SlideData {
    return {
      hotspots: [...this.hotspots],
      assets: [...this.assets],
      voiceovers: [...this.voiceovers],
      gameConfig: { ...this.gameConfig }
    };
  }
}

/**
 * CoursewareProject tracks course context, page steps, and provides OOP methods to modify them.
 */
export class CoursewareProject {
  public title: string;
  public targetAge: string;
  public objectives: string;
  public slides: Slide[];
  private slideConfigs: Map<string, SlideConfiguration>;

  constructor(
    title: string = '红黄蓝配对大闯关',
    targetAge: string = '3-6岁 (幼小衔接)',
    objectives: string = '1. 让幼儿掌握红黄蓝三原色基本认知。\n2. 通过动手操作，培养分类思维。\n3. 在轻快环境中锻炼专注力。'
  ) {
    this.title = title;
    this.targetAge = targetAge;
    this.objectives = objectives;
    this.slides = [];
    this.slideConfigs = new Map();
  }

  public addSlide(title: string, intent: string): Slide {
    const id = 's_' + Date.now() + Math.random().toString(36).substr(2, 4);
    const nextNum = this.slides.length + 1;
    const newSlide: Slide = { id, pageNum: nextNum, title, intent };
    this.slides.push(newSlide);
    this.slideConfigs.set(id, newSlideConfiguration(id));
    return newSlide;
  }

  public deleteSlide(id: string) {
    this.slides = this.slides.filter(s => s.id !== id);
    this.slideConfigs.delete(id);
    // Re-adjust page numbers
    this.slides.forEach((s, idx) => {
      s.pageNum = idx + 1;
    });
  }

  public renameSlide(id: string, newTitle: string, newIntent?: string) {
    const slide = this.slides.find(s => s.id === id);
    if (slide) {
      slide.title = newTitle;
      if (newIntent !== undefined) {
        slide.intent = newIntent;
      }
    }
  }

  public getSlideConfig(id: string): SlideConfiguration {
    let config = this.slideConfigs.get(id);
    if (!config) {
      config = new SlideConfiguration(id);
      this.slideConfigs.set(id, config);
    }
    return config;
  }

  public loadFromPlainData(
    title: string,
    targetAge: string,
    objectives: string,
    slides: Slide[],
    slidesMap: SlidesMap
  ) {
    this.title = title;
    this.targetAge = targetAge;
    this.objectives = objectives;
    this.slides = [...slides];
    this.slideConfigs.clear();
    
    Object.keys(slidesMap).forEach((id) => {
      this.slideConfigs.set(id, new SlideConfiguration(id, slidesMap[id]));
    });
  }

  public exportSlidesMapPlain(): SlidesMap {
    const map: SlidesMap = {};
    this.slideConfigs.forEach((config, id) => {
      map[id] = config.toPlainData();
    });
    return map;
  }
}

// Factory function
function newSlideConfiguration(id: string): SlideConfiguration {
  return new SlideConfiguration(id);
}

/**
 * KnowledgeBaseCompiler parses the rich course structure into the structured Markdown-style knowledge base.
 */
export class KnowledgeBaseCompiler {
  public static compile(project: CoursewareProject, customDocs: KnowledgeDoc[] = []): string {
    let kb = `========================================================\n`;
    kb += `📚 探奇课件核心知识库 (GENERATED KNOWLEDGE BASE)\n`;
    kb += `========================================================\n\n`;
    
    kb += `## 【一、 课程纲领配置】\n`;
    kb += `- **课程主题**: ${project.title}\n`;
    kb += `- **适合年龄**: ${project.targetAge}\n`;
    kb += `- **核心教学目标**:\n${project.objectives.split('\n').map(l => `  ${l}`).join('\n')}\n\n`;

    kb += `## 【二、 制作流程步骤规划】\n`;
    kb += `包含 ${project.slides.length} 个核心页面：\n`;
    project.slides.forEach((slide) => {
      kb += `  - **P${slide.pageNum} [${slide.title}]**: ${slide.intent}\n`;
    });
    kb += `\n`;

    kb += `## 【三、 每个页面的独立详细配置表】\n\n`;
    project.slides.forEach((slide) => {
      const config = project.getSlideConfig(slide.id);
      kb += `### 📄 步骤 P${slide.pageNum}: ${slide.title}\n`;
      kb += `- **本页核心意图**: ${slide.intent}\n`;
      
      // 1. Assets
      kb += `- **素材与配音列表**:\n`;
      if (config.assets.length === 0) {
        kb += `  - 无独立配置背景或主播挂件素材。\n`;
      } else {
        config.assets.forEach((asset) => {
          kb += `  - 🖼️ [${asset.name}]: 用途为 - ${asset.purpose} (URL: ${asset.url})\n`;
        });
      }
      if (config.voiceovers.length > 0) {
        config.voiceovers.forEach((vo) => {
          kb += `  - 🎙️ [音频]: ${vo.label} (时长: ${vo.duration})\n`;
        });
      }

      // 2. Hotspots
      kb += `- **物理交互点与智能热圈 (共 ${config.hotspots.length} 个)**:\n`;
      if (config.hotspots.length === 0) {
        kb += `  - 无配置热区。\n`;
      } else {
        config.hotspots.forEach((h) => {
          kb += `  - 🔴 **热区: ${h.name}** -> 位置: 顶(Y) ${h.top}, 左(X) ${h.left}, 宽 ${h.width}, 高 ${h.height} (检测触发: ${h.desc})\n`;
        });
      }

      // 3. Game config
      kb += `- **本页游戏化课件玩法方案**:\n`;
      if (!config.gameConfig.hasGame) {
        kb += `  - 未在此步骤挂载小游戏，仅进行基础清点互换或观察教学。\n`;
      } else {
        kb += `  - **游戏标题**: ${config.gameConfig.gameTitle}\n`;
        kb += `  - **游戏模式**: ${config.gameConfig.gameType} (对应: ${getGameTypeName(config.gameConfig.gameType)})\n`;
        kb += `  - **游戏难易度**: ${config.gameConfig.gameDifficulty}\n`;
        kb += `  - **游戏化思考与心智机制**: \n    ${config.gameConfig.gameThought.replace(/\n/g, '\n    ')}\n`;
        kb += `  - **倒计时限制**: ${config.gameConfig.gameTimerSec} 秒\n`;
      }
      kb += `\n--------------------------------------------------------\n\n`;
    });

    // Append users' persistent custom knowledge documents
    const enabledDocs = customDocs.filter(d => d.enabled);
    if (enabledDocs.length > 0) {
      kb += `## 【四、 附加重组教学大纲与底物理感应知识资产 (ENABLED CUSTOM GUIDELINES)】\n\n`;
      enabledDocs.forEach((doc, idx) => {
        kb += `### 🏷️ Guide #${idx + 1}: [${doc.category.toUpperCase()}] ${doc.title}\n`;
        kb += `- **最后更新/状态**: ${doc.lastUpdated} | 标签: ${doc.tags.join(', ')}\n`;
        kb += `- **详细指示细节**:\n`;
        kb += `    ${doc.content.replace(/\n/g, '\n    ')}\n\n`;
      });
      kb += `\n--------------------------------------------------------\n\n`;
    }

    return kb;
  }
}

function getGameTypeName(type: string): string {
  switch (type) {
    case 'match': return '具身三色对准配对';
    case 'eliminate': return '多孔物理卡槽消除';
    case 'sequence': return '律动空位颜色对准';
    case 'synth': return '合成发声主旋律粒子琴';
    default: return '益智探索互动';
  }
}

/**
 * PromptSynthesizer formats the developer-level markdown prompt block that will feed the AI Coding Simulator.
 */
export class PromptSynthesizer {
  public static synthesize(kb: string, options: SynthesisOptions): string {
    let p = ``;
    p += `# 👾 AI CODING 探奇具身探索 Web 课件自动装配指令案\n\n`;
    p += `## 【1. 大模型底层环境配置】\n`;
    p += `- **目标生成引擎**: ${options.selectedModel}\n`;
    p += `- **代码高保真选项**: 开启 React 18 / ESLint 0 警告 / React-Router 无缝渲染\n`;
    p += `- **页面装甲级渲染布局**: ${options.layoutPreference === 'balanced-split' ? '左右黄金分栏分级' : options.layoutPreference === 'immersive-canvas' ? '沉浸式物理互动舞台' : 'Bento Grid 探奇网格控制舱'}\n\n`;

    p += `## 【2. 教师个性化配置与部署指令】\n`;
    p += `> ${options.extraPrompts || '默认优化：保持页面轻量好看，对触屏和点击都留出完美尺寸！'}\n\n`;

    p += `## 【3. 游戏与微课运行功能约束】\n`;
    p += `- **多媒体交互**: ${options.enableVoiceSynthesis ? '启用 SpeechSynthesis 浏览器真人合成语音，动态表扬孩子。' : '关闭真人发声，仅提供气泡文本。'}\n`;
    p += `- **胜利大满贯彩蛋**: ${options.enableConfetti ? '开启! 连续消除去除或全项清点达标触发 canvas-confetti 五彩礼花特效。' : '关闭爆破粒子，仅显示图形。'}\n`;
    p += `- **网络及离线运行策略**: ${options.offlineMode ? '完全由本地 React state 控制，避免联网依赖，保证网络极速响应。' : '在本地运行上加入中转 API 节点存储。'}\n\n`;

    p += `## 【4. 探奇课件数据知识库输入】\n`;
    p += `\`\`\`markdown\n`;
    p += kb;
    p += `\`\`\`\n\n`;

    p += `## 【5. 页面自动装配规范 (AI DEVELOPER REQUIREMENTS)】\n`;
    p += `请大模型严格基于上方知识库的课时步骤（P1 到 Pn）来设计最终的单页 React 课件应用：\n`;
    p += `1. **页面主入口 (Gentral Hub)**: 提供精致的顶部导航切换，允许孩子/家长在 P1 视频备具、P2 实操、P3 消除等页面之间来回切换，或者依次通关。\n`;
    p += `2. **素材优雅渲染**: 右侧或顶部展示配音张博士（3D解说主播）的小头像气泡；左侧渲染主图背景，如果配置了 Hotspots 热区，请在主图表面通过绝对定位渲染出可点击的圆形波纹热圈，点击时弹出该检测点的详细说明、播放拟真音效或伴随语音朗读。\n`;
    p += `3. **完美的游戏模式**: 挂载游戏化玩法的页面（例如 P3 \\"${getGameTypeName(options.selectedModel)}\\" 玩法）必须提供真正可玩的迷你内核交互：显示积分、连击数、倒计时以及色彩消除卡片按钮，孩子点击正确匹配后触发对应动画或语音。\n`;
    p += `4. **代码纯净度**: 精美采用 Tailwind CSS 辅助配色，所有图标均采用 \`lucide-react\` 库。保证结构紧凑好玩，严防卡顿和过载！`;

    return p;
  }
}

/**
 * AICodingEngine acts as a facade step that simulates the high-fidelity progressive code generation.
 */
export class AICodingEngine {
  public static async executeCoding(
    prompt: string,
    logsCallback: (log: string) => void,
    progressCallback: (p: number) => void
  ): Promise<string> {
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
    const logs = [
      `⚡ [探奇部署] 正在载入 AI 自动装配框架容器...`,
      `⚙️ [环境加载] 检测到目标编译机选项... 已应用 React-Vite 沙盒环境`,
      `📦 [模块清点] 加载三方包：canvas-confetti (全屏五彩派对粒子) 已装载`,
      `📦 [模块清点] 加载三方包：framer-motion (动态位移与放大波纹) 已初始化`,
      `🛠️ [大纲解析] 正在拆解课程知识库各步骤数据，并自动建立配音挂载队列...`,
      `🎨 [布局分栏] 正在构建黄金 16:9 画幅叠加 overlays 的画布机制...`,
      `🤖 [AI 神经网络] 正在针对游戏机制进行逻辑和判定机制的 TSX 代码编译...`,
      `🤖 [AI 神经网络] 绑定真人拟真语音：添加 SpeechSynthesis 闭环事件支持...`,
      `👾 [代码打包] 正在融合 Tailwind 自适应高级样式与 Lucide-React 炫彩图标...`,
      `⚙️ [正在编译] 正在调用 Vite Webpack 动态生成代码与 HMR 重构校验...`,
      `✅ [编译成功] 恭喜！高保真可交互课程 Web 模块已通过全部审查，随时可以开始具身操作！`
    ];

    progressCallback(0);
    for (let i = 0; i < logs.length; i++) {
      logsCallback(logs[i]);
      progressCallback(Math.floor(((i + 1) / logs.length) * 100));
      await sleep(350);
    }

    // Now extract specific params from prompt or let it generate a highly interactive matching script
    const gameName = prompt.match(/游戏标题[*: ]+([^\n]+)/)?.[1] || '红黄蓝色彩空间站';
    
    return generateCustomGameCode(gameName);
  }
}

function generateCustomGameCode(gameName: string): string {
  // Return high fidelity interactive custom code for step 5
  return `// === 由探奇 AI 智能课件制作系统自动生成 ===
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Sparkles, Volume2, RotateCcw, Play, Award, 
  ChevronRight, ArrowRight, BookOpen, Layers
} from 'lucide-react';

export default function CustomInteractiveCourseware() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [checkedItems, setCheckedItems] = useState({ paint: false, board: false, cards: false });
  const [gameState, setGameState] = useState({
    score: 0,
    streak: 0,
    target: 'red' as 'red' | 'yellow' | 'blue',
    timer: 30,
    playing: false,
    feedback: '游戏已就绪！观察顶部的目标气泡色彩，点击下方的消降色孔进行具身对准消降吧！',
    best: 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleP7Check = (key: 'paint' | 'board' | 'cards', label: string) => {
    setCheckedItems(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (next[key]) {
        speakText(\`你找到了：\${label}，太棒啦！\`);
      }
      if (next.paint && next.board && next.cards) {
        speakText('道具全部清点准备齐备！我们现在开始进行红黄蓝消除分类挑战吧！');
        confetti({
          particleCount: 50,
          spread: 60,
          colors: ['#EF4444', '#F59E0B', '#3B82F6']
        });
      }
      return next;
    });
  };

  const colors = ['red', 'yellow', 'blue'] as const;
  const colorNames = { red: '🔴 红色', yellow: '🟡 黄色', blue: '🔵 蓝色' };

  const startNewGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      streak: 0,
      timer: 30,
      playing: true,
      target: colors[Math.floor(Math.random() * 3)],
      feedback: '观察匹配消除目标，点击下方三个发射器！'
    }));
    speakText('游戏开始，请根据顶部的目标颜色，快速在下面点击相同的彩色孔位进行消除！');
  };

  useEffect(() => {
    if (gameState.playing && gameState.timer > 0) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timer <= 1) {
            clearInterval(timerRef.current!);
            speakText(\`时间到！小朋友今天获得太棒的成绩了，你一共赢得了\${prev.score}分！\`);
            confetti({ particleCount: 100, spread: 80 });
            return { ...prev, timer: 0, playing: false, feedback: '极速挑战结束！你太厉害了！', best: Math.max(prev.best, prev.score) };
          }
          return { ...prev, timer: prev.timer - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.playing]);

  const handleInteract = (color: 'red' | 'yellow' | 'blue') => {
    if (!gameState.playing) {
      speakText('请先点击开始挑战按钮启动游戏计时器哦！');
      return;
    }

    if (color === gameState.target) {
      const bonus = gameState.streak >= 2 ? 15 : 10;
      setGameState(prev => {
        const nextStreak = prev.streak + 1;
        const nextTarget = colors.filter(c => c !== color)[Math.floor(Math.random() * 2)];
        
        if (nextStreak % 3 === 0) {
          confetti({
            particleCount: 30,
            spread: 50,
            colors: ['#EF4444', '#F59E0B', '#3B82F6']
          });
        }

        const spoken = [
          '匹配消除成功，加分！',
          '哎呀找的太准了，真棒！',
          '哇！手脑具身协同完美！'
        ];
        speakText(spoken[Math.floor(Math.random() * spoken.length)]);

        return {
          ...prev,
          score: prev.score + bonus,
          streak: nextStreak,
          target: nextTarget,
          feedback: \`匹配正确！积分 +\${bonus}！\${nextStreak > 2 ? \`达成 \${nextStreak} 连击火花！🔥\` : ''}\`
        };
      });
    } else {
      setGameState(prev => {
        speakText(\`哦，这好像不是\${colorNames[prev.target]}呢，再接再厉！\`);
        return {
          ...prev,
          streak: 0,
          feedback: \`配对失准！那是 \${colorNames[color]} 位，而我们的匹配目标是 \${colorNames[prev.target]}！\`
        };
      });
    }
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] p-6 shadow-md max-w-4xl mx-auto block text-slate-800 text-left">
      {/* Upper Navigation Tabs */}
      <div className="flex justify-between items-center bg-slate-100 p-2 rounded-2xl mb-6">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">探奇课件交互舱</span>
        <div className="flex gap-1.5">
          <button 
            onClick={() => { setActiveStep(1); speakText('这里是 P1 微课道具清点板块。'); }}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${activeStep === 1 ? 'bg-white text-blue-600 shadow-sm border' : 'text-slate-600 hover:bg-slate-200'}\`}
          >
            P1-教具清点 (P7图)
          </button>
          <button 
            onClick={() => { setActiveStep(2); speakText('这里是 P2 游戏互动大消除板块'); }}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${activeStep === 2 ? 'bg-white text-indigo-700 shadow-sm border' : 'text-slate-600 hover:bg-slate-200'}\`}
          >
            P2-${gameName}
          </button>
        </div>
      </div>

      {activeStep === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-8 relative aspect-video bg-white rounded-3xl overflow-hidden border border-slate-200 p-2 shadow-inner">
            <img 
              src="https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course2/P7.png" 
              className="w-full h-full object-contain rounded-2xl" 
              alt="P7 map"
            />
            {/* Visual hot loops overlaying coordinate points */}
            <button 
              onClick={() => handleP7Check('paint', '① 三色画笔颜料')}
              className={\`absolute w-[18%] h-[20%] top-[16%] left-[18%] rounded-full border-2 border-dashed flex items-center justify-center transition-all animate-pulse \${checkedItems.paint ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-550 text-red-500'}\`}
            >
              <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-full shadow-sm font-black">1.颜料</span>
            </button>
            <button 
              onClick={() => handleP7Check('board', '② 双色多孔底板')}
              className={\`absolute w-[18%] h-[25%] top-[43%] left-[14%] rounded-full border-2 border-dashed flex items-center justify-center transition-all animate-pulse \${checkedItems.board ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-550 text-red-500'}\`}
            >
              <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-full shadow-sm font-black">2.多孔板</span>
            </button>
            <button 
              onClick={() => handleP7Check('cards', '③ 九宫十连卡纸')}
              className={\`absolute w-[18%] h-[20%] top-[49%] left-[38%] rounded-full border-2 border-dashed flex items-center justify-center transition-all animate-pulse \${checkedItems.cards ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-550 text-red-500'}\`}
            >
              <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-full shadow-sm font-black">3.卡纸</span>
            </button>
          </div>
          
          <div className="md:col-span-4 bg-sky-50/50 border border-sky-100 rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-sky-850">
                <Layers size={14} className="text-sky-600" />
                <span>儿童手部具身清点卡</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                点击左图圆圈或点击下方按钮，帮助孩子将桌面上的实体教具一一对比核实！
              </p>

              <div className="mt-4 space-y-2">
                <button 
                  onClick={() => handleP7Check('paint', '① 三色画笔颜料')}
                  className={\`w-full p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all \${checkedItems.paint ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white border-slate-200'}\`}
                >
                  <span>三色笔及颜料 (红色、黄、蓝)</span>
                  <span className="text-[10px]">{checkedItems.paint ? '🟢 已备齐' : '⏳ 找找看'}</span>
                </button>
                <button 
                  onClick={() => handleP7Check('board', '② 双色多孔底板')}
                  className={\`w-full p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all \${checkedItems.board ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white border-slate-200'}\`}
                >
                  <span>探奇实操双色底板架</span>
                  <span className="text-[10px]">{checkedItems.board ? '🟢 已备齐' : '⏳ 找找看'}</span>
                </button>
                <button 
                  onClick={() => handleP7Check('cards', '③ 九宫十连卡纸')}
                  className={\`w-full p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all \${checkedItems.cards ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white border-slate-200'}\`}
                >
                  <span>空间站配对纸卡一张</span>
                  <span className="text-[10px]">{checkedItems.cards ? '🟢 已备齐' : '⏳ 找找看'}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/50 mt-4 flex items-center justify-between">
              <span className="text-[9px] text-sky-800 font-extrabold flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-500" />
                <span>3-6岁色彩感觉教育大纲</span>
              </span>
              <button 
                onClick={() => { setCheckedItems({ paint: false, board: false, cards: false }); speakText('重置完成，请重新备课！'); }}
                className="text-[9px] text-slate-400 hover:text-red-500 font-bold transition flex items-center gap-1"
              >
                <RotateCcw size={10} />
                <span>重新清点</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white text-center flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-4 border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-yellow-300 tracking-wider flex items-center gap-1.5">
              <Award size={15} className="animate-bounce" />
              <span>{gameState.playing ? gameState.timer + 's 倒计时中...' : '${gameName}'}</span>
            </h3>
            
            <div className="flex gap-2.5 text-xs text-slate-300 font-bold">
              <span>🎯 得分: <strong className="text-green-400">{gameState.score}</strong></span>
              <span>🔥 连击: <strong className="text-orange-400">{gameState.streak}</strong></span>
              <span>👑 历史最佳: <strong className="text-yellow-400">{gameState.best}</strong></span>
            </div>
          </div>

          <div className="my-6 max-w-md w-full bg-slate-800/80 p-5 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1">物理消除目标色彩</span>
            {gameState.playing ? (
              <div className="flex flex-col items-center gap-1">
                <motion.div 
                  key={gameState.target}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  className={\`px-6 py-2 rounded-full text-xs font-black shadow-lg \${gameState.target === 'red' ? 'bg-red-500 text-white' : gameState.target === 'yellow' ? 'bg-amber-400 text-slate-950' : 'bg-blue-600 text-white'}\`}
                >
                  {colorNames[gameState.target]}
                </motion.div>
                <p className="text-[9px] text-emerald-400 font-bold mt-1.5">连续消除将获得更多积分火焰！</p>
              </div>
            ) : (
              <button 
                onClick={startNewGame}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-450 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-xl transition active:scale-95 flex items-center gap-2 mx-auto"
              >
                <Play size={13} fill="currentColor" />
                <span>开启具身颜色大消除</span>
              </button>
            )}
            
            <p className="text-[10px] text-slate-400 mt-4 leading-normal font-sans border-t border-white/5 pt-3">
              {gameState.feedback}
            </p>
          </div>

          <p className="text-[10px] text-yellow-200/70 font-mono mb-2">[ 具身输入反馈：请在电脑屏幕上点击对应的彩色孔位，模拟彩色木塞的放置消除 ]</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => handleInteract('red')} 
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 rounded-xl text-xs font-bold transition shadow-md border border-red-550"
            >
              🔴 点击插红色孔
            </button>
            <button 
              onClick={() => handleInteract('yellow')} 
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl text-xs font-bold text-slate-950 transition shadow-md border border-amber-350"
            >
              🟡 点击插黄色孔
            </button>
            <button 
              onClick={() => handleInteract('blue')} 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl text-xs font-bold transition shadow-md border border-blue-550"
            >
              🔵 点击插蓝色孔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}`;
}
