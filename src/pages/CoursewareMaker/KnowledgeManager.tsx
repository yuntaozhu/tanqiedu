import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Plus, Trash2, Check, BookOpen, 
  RefreshCw, Search, Tag, Eye, Code, FileText, CheckCircle2, X,
  Flame, Zap, User, Cpu, MessageSquare, ArrowRight, 
  ChevronRight, Sparkles, History
} from 'lucide-react';

export type KbDocCategory = 'pedagogy' | 'hardware' | 'interaction' | 'voice' | 'other';

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  category: KbDocCategory;
  tags: string[];
  lastUpdated: string;
  enabled: boolean;
  isPreset?: boolean;
}

const CONST_PRESETS: KnowledgeDoc[] = [
  {
    id: 'p-1',
    title: '蒙台梭利原色匹配教学法 (Montessori Method)',
    category: 'pedagogy',
    tags: ['感官探索', '错误控制', '自主建构'],
    enabled: true,
    isPreset: true,
    lastUpdated: '2026-06-12',
    content: '### 蒙台梭利教理对具身感官游戏的设计指南：\n1. **孤立单一视觉属性**：初级课件仅保留红、黄、蓝三原色判定，除去几何形状或次要饰品的声光干扰，帮助建立清晰分类。\n2. **感官错误控制机制 (Control of Error)**：当实物木塞塞入不匹配的色彩轨槽时，触发一个低沉舒缓的低音并伴有温和音频：“噢，它们的颜色好像有一点小偏差，再比对试一下呢？”，幼儿可根据错误反馈自主修正动作，无需教师斥责。\n3. **三阶段教学法融合**：\n   - 第一阶段（命名）：伴读发出“这是红色”。\n   - 第二阶段（辨别）：引导孩子“哪个是红色？把它抓起来插在对应的飞船插孔上”。\n   - 第三阶段（发音）：幼儿成功消除后，播放通关快乐歌和“红、黄、蓝！”欢呼声。'
  },
  {
    id: 'p-2',
    title: '探奇 21-自由度感应底座数据轮询协议 (Sensor Layout)',
    category: 'hardware',
    tags: ['阻抗检测', '极耳同轴度', '底层中断'],
    enabled: true,
    isPreset: true,
    lastUpdated: '2026-06-12',
    content: '### 探奇 21-孔硬件底座数据通讯与采样规则：\n1. **物理对准约束**：底纸须与 9x9 网格插孔呈 100% 同轴校准，主控边缘含有三个微调激光定位孔。在 Canvas 中渲染时，需设置绝对位置（百分比 `%` 视口坐标）检测器以防止高分屏下出现视差错位。\n2. **极极电极探测 (ADC Sampling)**：木制彩色多孔滑条内部埋有微电极，插入原色孔座时会发出微安级中断，驱动层读取 AD 寄存器信号。\n3. **HMR 软件轮询机制**：\n   ```javascript\n   // 软件捕获教具底座的插槽占用中断\n   window.addEventListener("device_state_change", (e) => {\n     const { slotId, value, isCorrect } = e.detail;\n     if (isCorrect) {\n       triggerSpotActive(slotId);\n     }\n   });\n   ```'
  },
  {
    id: 'p-3',
    title: 'Dr. Zhang 启发式人声音调包规范 (Audio Cues)',
    category: 'voice',
    tags: ['张博士', '中英文伴读', '激励声谱'],
    enabled: true,
    isPreset: true,
    lastUpdated: '2026-06-12',
    content: '### 交互人声语音伴读音效包规则：\n- **Dr._Zhang_Warm_Baritone** 预置音包：选用中低频、亲人慈爱的科学怪博士形象男中音，减少尖锐电子合成音产生的过度警戒疲劳。\n- **情绪对白映射**：\n  - *操作备齐时*：“我是张博士，欢迎来到色彩空间站！你的魔盘小底座、红黄蓝画笔备好了吗？快按压热区帮我进行飞船清点吧！”\n  - *连击消除时*：“哇！原色消除，能量槽集满啦！连消，暴击！”\n  - *静置等待15秒以上*：启动微型提示，比如：“探奇画笔正在打瞌睡哦，试着把它插到红色的极耳里吧。”'
  }
];

const CATEGORY_MAP = {
  pedagogy: { label: '🎓 教学理论 (Pedagogy)', style: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
  hardware: { label: '🔌 硬件规格 (Hardware)', style: 'bg-sky-50 border-sky-100 text-sky-800' },
  interaction: { label: '💬 交互方法 (Interaction)', style: 'bg-amber-50 border-amber-100 text-amber-800' },
  voice: { label: '🎙️ 配音伴读 (Voice Cues)', style: 'bg-rose-50 border-rose-100 text-rose-800' },
  other: { label: '📁 其它参考 (Other docs)', style: 'bg-slate-50 border-slate-150 text-slate-700' }
};

interface KnowledgeManagerProps {
  onKnowledgeChanged: (enabledDocs: KnowledgeDoc[]) => void;
}

export default function KnowledgeManager({ onKnowledgeChanged }: KnowledgeManagerProps) {
  // Navigation: hermes (the 4-layer blueprint) vs raw (the original list / CRUD)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'hermes' | 'raw'>('hermes');

  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  
  // Edit & Form state for Raw CRUD
  const [formDocId, setFormDocId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'pedagogy' as KbDocCategory,
    tagsStr: '',
    enabled: true
  });
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');
  const [notification, setNotification] = useState<string | null>(null);

  // --- Hermes Memory Layer State ---
  const [memoryMd, setMemoryMd] = useState<string>(
    `# MEMORY.md (热记忆 - 常驻核心指令)\n- 系统环境：React 18 + Vite 沙盒具身课件编译器\n- 首要设计：控制单一视觉属性，严防过度复杂的声光动画负荷\n- 通信准则：设备端状态轮询需具备阻抗检测错误补偿容限`
  );
  
  const [userMd, setUserMd] = useState<string>(
    `# USER.md (热记忆 - 学前教育画像)\n- 伴读导师：immanuel.zhu@gmail.com (资深蒙氏教研员)\n- 目标群体：3-6岁儿童 (动作触控与色彩认知敏感期)\n- 视觉审美：纯净温润，高饱和柔和原色，采用大触模物理靶区`
  );

  const [honchoDb, setHonchoDb] = useState<string>(
    `{\n  "class_type": "学前感官智能实操微课",\n  "teaching_pace": "自主式重试探索",\n  "reward_effect": "canvas-confetti (大满贯派对爆破)",\n  "vocal_frequency": "暖男中音（Dr. Zhang 温情博士）"\n}`
  );

  // Active Skills inside Process Memory
  const [processSkills, setProcessSkills] = useState<{ id: string, name: string, active: boolean, desc: string }[]>([
    { id: 'montessori-pedagogy', name: 'Montessori三阶段教理技能', active: true, desc: '自动适配【命名-辨别-发音】三段认知，注入错误容限与修正回路。' },
    { id: 'adc-polling', name: '21点电阻式中断电极轮询技能', active: true, desc: '装载 hardware 级的 slot 通信，解耦电信号噪音。' },
    { id: 'dr-zhang-voice', name: 'Dr. Zhang中低磁音伴读对白技能', active: true, desc: '映射张博士专属 baritone 鼓励音，添加15s静置睡眠微语。' },
    { id: 'confetti-burst', name: 'Canvas-Confetti胜利流星派对技能', active: false, desc: '在连消或教具清点备齐时，快速爆发色彩粒子渲染微课仪式感。' }
  ]);

  // Expanded Layer settings in the visual layout
  const [expandedLayer, setExpandedLayer] = useState<'hot' | 'cold' | 'process' | 'deep' | null>('hot');

  // Pipeline execution state
  const [pipelineQuery, setPipelineQuery] = useState<string>('我想为3.5岁幼儿设计一个符合蒙氏理论、带有Dr.Zhang温和配音的红黄蓝插塞消除飞船游戏');
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'searching' | 'summarizing' | 'skills' | 'honcho' | 'assembling' | 'completed'>('idle');
  const [pipelineStepIndex, setPipelineStepIndex] = useState<number>(0);
  const [retrievedSnippets, setRetrievedSnippets] = useState<string[]>([]);
  const [pipelineSummary, setPipelineSummary] = useState<string>('');
  const [assembledContext, setAssembledContext] = useState<string>('');
  const [simulatedLLMOutput, setSimulatedLLMOutput] = useState<string>('');

  // Presets matching actual handwritten workflow scenarios
  const PIPELINE_PRESETS = [
    {
      title: '🍎 蒙台梭利原色消除微课',
      query: '我想为3.5岁幼儿设计一个符合蒙氏理论、带有Dr.Zhang温和配音的红黄蓝插塞识别插拔游戏'
    },
    {
      title: '🔌 极耳电极阻抗防抖轮询',
      query: '我想编写底层 AD 采样中断代码，如何解决电极因木头受潮、滑板晃动产生的插孔错判抖动？'
    },
    {
      title: '🎙️ Dr. Zhang 温情伴读调律',
      query: '如何优化 Dr. Zhang 的语音伴读，让孩子备好物时受到称赞，闲置15秒后能以好听的声调温柔提醒？'
    }
  ];

  // Load raw docs from localStorage on mount
  useEffect(() => {
    const local = localStorage.getItem('tanqi_knowledge_documents');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDocs(parsed);
          onKnowledgeChanged(parsed);
          return;
        }
      } catch (e) {
        console.error('Error loading localStorage documents', e);
      }
    }
    setDocs(CONST_PRESETS);
    onKnowledgeChanged(CONST_PRESETS);
    localStorage.setItem('tanqi_knowledge_documents', JSON.stringify(CONST_PRESETS));
  }, []);

  const saveDocs = (newDocs: KnowledgeDoc[]) => {
    setDocs(newDocs);
    localStorage.setItem('tanqi_knowledge_documents', JSON.stringify(newDocs));
    onKnowledgeChanged(newDocs);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(msg);
      u.lang = 'zh-CN';
      window.speechSynthesis.speak(u);
    }
  };

  const handleToggleDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = docs.map(d => {
      if (d.id === id) {
        const current = !d.enabled;
        showToast(current ? '已启用此知识文档' : '已停用此知识文档');
        return { ...d, enabled: current };
      }
      return d;
    });
    saveDocs(updated);
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('你确定要删除这篇教学知识库文章吗？此操作不可逆。')) {
      const updated = docs.filter(d => d.id !== id);
      saveDocs(updated);
      showToast('知识文件已被成功物理删除');
      if (formDocId === id) {
        setIsEditorOpen(false);
        setFormDocId(null);
      }
    }
  };

  const handleTriggerAdd = () => {
    setFormDocId(null);
    setFormData({
      title: '',
      content: '',
      category: 'pedagogy',
      tagsStr: '',
      enabled: true
    });
    setPreviewTab('edit');
    setIsEditorOpen(true);
  };

  const handleTriggerEdit = (doc: KnowledgeDoc, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormDocId(doc.id);
    setFormData({
      title: doc.title,
      content: doc.content,
      category: doc.category,
      tagsStr: doc.tags.join(', '),
      enabled: doc.enabled
    });
    setPreviewTab('edit');
    setIsEditorOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('请检查您的输入，确保标题与正文都不为空！');
      return;
    }

    const tagList = formData.tagsStr
      .split(/[,，]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    let updatedDocs: KnowledgeDoc[];

    if (formDocId) {
      updatedDocs = docs.map(doc => {
        if (doc.id === formDocId) {
          return {
            ...doc,
            title: formData.title.trim(),
            content: formData.content.trim(),
            category: formData.category,
            tags: tagList.length > 0 ? tagList : ['自定义知识'],
            lastUpdated: new Date().toISOString().split('T')[0],
            enabled: formData.enabled
          };
        }
        return doc;
      });
      showToast('教学重组大纲更新成功');
    } else {
      const newDoc: KnowledgeDoc = {
        id: 'user-' + Date.now(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: tagList.length > 0 ? tagList : ['创新大纲'],
        lastUpdated: new Date().toISOString().split('T')[0],
        enabled: true,
        isPreset: false
      };
      updatedDocs = [newDoc, ...docs];
      showToast('全新教学指示合并完成');
    }

    saveDocs(updatedDocs);
    setIsEditorOpen(false);
    setFormDocId(null);
  };

  const handleResetPresets = () => {
    if (window.confirm('确定要恢复出厂推荐的教案指导吗？这将覆盖您现有的修改。')) {
      saveDocs(CONST_PRESETS);
      showToast('已重置回推荐指南知识方案');
      setIsEditorOpen(false);
      setFormDocId(null);
    }
  };

  // --- Run Hermes Memory Layer Pipeline Routing Simulation ---
  const handleRunHermesPipeline = async () => {
    if (!pipelineQuery.trim()) return;

    setPipelineStatus('searching');
    setPipelineStepIndex(1);
    setRetrievedSnippets([]);
    setPipelineSummary('');
    setAssembledContext('');
    setSimulatedLLMOutput('');

    // Step 1: Retrieve from Cold Memory (Simulate SQLite search over our CRUD docs)
    await new Promise(r => setTimeout(r, 800));
    
    const queryLower = pipelineQuery.toLowerCase();
    const matchedDocs = docs.filter(d => d.enabled && (
      d.title.toLowerCase().includes(queryLower) || 
      d.content.toLowerCase().includes(queryLower) ||
      d.tags.some(t => t.toLowerCase().includes(queryLower)) ||
      (queryLower.includes('蒙氏') && d.category === 'pedagogy') ||
      (queryLower.includes('sensor') || queryLower.includes('插插') || queryLower.includes('极耳') || queryLower.includes('防抖') ? d.category === 'hardware' : false) ||
      (queryLower.includes('配音') || queryLower.includes('音调') || queryLower.includes('博士') || queryLower.includes('声调') ? d.category === 'voice' : false)
    ));

    let retrieved: string[] = [];
    if (matchedDocs.length > 0) {
      retrieved = matchedDocs.map(d => `【源自 cold-db / ${d.title}】:\n${d.content.slice(0, 300)}...`);
    } else {
      // Fallback
      retrieved = [
        `【源自 cold-db / 基础备课纲要】:\n- 制定了红黄蓝基本教学大纲，引导小班儿童通过手眼协同将实体多孔盒跟大屏幕对准匹配。`
      ];
    }
    setRetrievedSnippets(retrieved);

    // Step 2: Cold Memory Summary Compression
    setPipelineStatus('summarizing');
    setPipelineStepIndex(2);
    await new Promise(r => setTimeout(r, 800));
    
    // Abstract summary based on query
    let summaryText = '';
    if (queryLower.includes('蒙氏') || queryLower.includes('蒙台')) {
      summaryText = `- **提取蒙氏教理精髓**：坚持“孤立属性”教理，将形状与声音完全剥离为纯色块；采用“感官错误控制”，消除错误时避免用错音（红叉），而要Dr. Zhang音调稍微下沉作自主探究引导。`;
    } else if (queryLower.includes('极耳') || queryLower.includes('传感器') || queryLower.includes('防抖') || queryLower.includes('ad')) {
      summaryText = `- **提取AD采样协议规章**：插极耳微安 ADC 采样信号有 20ms 电极形变抖动噪音，需写中断防抖定时器缓存；页面 Canvas 极坐标按绝对位置比例对齐纸件，忽略重置偏差。`;
    } else {
      summaryText = `- **提取 Dr. Zhang 交互伴读映射**：采用 500-800Hz 温柔温润人声；当设备清点完配齐、连击消除或超过 15 秒静止未动时，分别激活 unique 回合声谱。`;
    }
    setPipelineSummary(summaryText);

    // Step 3: Match Process Memory (Skills Match)
    setPipelineStatus('skills');
    setPipelineStepIndex(3);
    await new Promise(r => setTimeout(r, 800));
    // Auto-on relevant skills checkboxes based on keywords to show interactive routing!
    const updatedSkills = processSkills.map(skill => {
      if (queryLower.includes('蒙') && skill.id === 'montessori-pedagogy') return { ...skill, active: true };
      if ((queryLower.includes('极') || queryLower.includes('ad') || queryLower.includes('采') || queryLower.includes('抖')) && skill.id === 'adc-polling') return { ...skill, active: true };
      if ((queryLower.includes('声') || queryLower.includes('配音') || queryLower.includes('张博士')) && skill.id === 'dr-zhang-voice') return { ...skill, active: true };
      return skill;
    });
    setProcessSkills(updatedSkills);

    // Step 4: Inject Deep Memory (Honcho Cross-Session profile parameters)
    setPipelineStatus('honcho');
    setPipelineStepIndex(4);
    await new Promise(r => setTimeout(r, 800));

    // Step 5: Assemble Context
    setPipelineStatus('assembling');
    setPipelineStepIndex(5);
    await new Promise(r => setTimeout(r, 800));

    // Compile ultimate context string
    const activeSkillsList = updatedSkills.filter(s => s.active).map(s => `- Skill: [${s.name}] -> ${s.desc}`).join('\n');
    let honchoObj = { class_type: "具身实操", teaching_pace: "自主重试", vocal_frequency: "中低频男中音" };
    try {
      honchoObj = JSON.parse(honchoDb);
    } catch(e) {}

    const fullPrompt = `========================================================
🚀 HERMES SYSTEM ASSEMBLED ROUNTING CONTEXT (组装后的完整编译上下文)
========================================================

【① 热记忆层 (MEMORY.md + USER.md)】 (始终常驻)
${memoryMd}
${userMd}

【② 冷记忆层 (EPISODIC RECALL - 检索与摘要)】 (压缩检索结果)
${summaryText}

【③ 过程记忆层 (ACTIVE SKILLS)】 (按需加载的工作流技能)
${activeSkillsList}

【④ 深度记忆层 (HONCHO USER PROFILE)】 (按需注入的个性化参数)
- 用户教育类型: ${honchoObj.class_type}
- 教学行为节奏: ${honchoObj.teaching_pace}
- 声音配音偏好: ${honchoObj.vocal_frequency}

【⚡ 教师即时拟真提问 (USER MESSAGE)】:
"${pipelineQuery}"

========================================================`;
    
    setAssembledContext(fullPrompt);

    // Step 6: Simulate LLM final tailored output
    setPipelineStatus('completed');
    setPipelineStepIndex(6);

    let llmRes = '';
    if (queryLower.includes('蒙')) {
      llmRes = `### 🛰️ 探奇 AI 实操课件大模型装配成果 [蒙氏具身游戏化案]\n\n` +
               `基于您检索组装的 **MONTeSSORI 原色理论**、**Dr. Zhang 温柔伴读技能**，为您完成了如下教案代码架构组装：\n\n` +
               `1. **感官错误控制 (Control of Error) 代码实现**：\n` +
               `   \`\`\`typescript\n` +
               `   function handleSlotMismatch(childPlacedColor: string, targetColor: string) {\n` +
               `     // 禁用传统刺耳警报(如叮当尖叫)，调取 Dr. Zhang 声音缓和中断：\n` +
               `     speakText("哦，红色木塞和黄色的飞轮轨道有一点点害羞，看看它们是否适合彼此呢？");\n` +
               `     triggerPulseRipple("slot_error_mismatch");\n` +
               `   }\n` +
               `   \`\`\`\n` +
               `2. **视觉孤立实现**：Canvas 消除主画布自动遮挡多余的三维浮雕，只保留完全隔离的红、黄、蓝发光插塞。界面无积分进度压力，支持幼儿闭环自主重试。`;
    } else if (queryLower.includes('AD') || queryLower.includes('极') || queryLower.includes('采') || queryLower.includes('抖')) {
      llmRes = `### 🛰️ 探奇 AI 底层硬件装配成果 [ADC 21-自由度抗撕裂容错案]\n\n` +
               `检测到您遇到了底板晃动或极耳插槽受潮造成的电学阻抗漂移。已按 **过程记忆 (ADC电学阻抗检测技能)** 为您编译抗撕裂代码：\n\n` +
               `1. **底层抗抖动双环缓存中断**：\n` +
               `   \`\`\`typescript\n` +
               `   let stateBuffer = [];\n` +
               `   window.addEventListener("device_state_change", (e) => {\n` +
               `     const { slotId, impedanceValue } = e.detail;\n` +
               `     stateBuffer.push(impedanceValue);\n` +
               `     if (stateBuffer.length > 5) {\n` +
               `       // 对 AD 进行线性平均加权滤波，防除由于插塞松碰造成的杂波波谷\n` +
               `       const stableValue = getWeightedAverage(stateBuffer);\n` +
               `       triggerStableCheck(slotId, stableValue);\n` +
               `       stateBuffer = [];\n` +
               `     }\n` +
               `   });\n` +
               `   \`\`\`\n` +
               `2. **百分比坐标偏差拟合**：支持激光校验三个控制极，主 Canvas 可抗 3mm 以内的底纸变形拉伸。`;
    } else {
      llmRes = `### 🛰️ 探奇 AI 专属课程伴读装配成果 [Dr. Zhang 情感回合包规约]\n\n` +
               `已按照 **张博士暖男中音特质** 及 **Honcho 深度记忆** 为您完成声谱对白装配：\n\n` +
               `1. **静置 15s 关怀定时器**：\n` +
               `   \`\`\`typescript\n` +
               `   let idleTimer = setTimeout(() => {\n` +
               `     speakText("小画笔正在悄悄打瞌睡噢，你可以轻轻拿起黄色的那个，塞进香蕉小轨道里呢。");\n` +
               `   }, 15000);\n` +
               `   \`\`\`\n` +
               `2. **连消三暴击反馈**：连续三色消除触发 \`confetti\` 飞箭音：*“集满能量，大满贯！”* 真人拟音温润悦耳，音频振幅锁定在安全低频，减少电子警戒疲劳。`;
    }
    setSimulatedLLMOutput(llmRes);
    showToast('🚀 Hermes 4层智能记忆路由装配模拟完成！');
  };

  const renderMarkdownText = (text: string) => {
    if (!text) return <span className="text-slate-400 italic">暂无内容</span>;
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed text-slate-700">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-extrabold text-sm text-slate-900 mt-2 pb-1 border-b border-slate-100">{line.slice(4)}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="font-black text-md text-slate-900 mt-3">{line.slice(3)}</h3>;
          }
          if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('- ')) {
            return (
              <div key={idx} className="pl-4 relative before:absolute before:left-1 before:top-2 before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full py-0.5">
                {line.startsWith('- ') ? line.slice(2) : line}
              </div>
            );
          }
          if (line.startsWith('   - ') || line.startsWith('  - ')) {
            return (
              <div key={idx} className="pl-8 text-slate-500 border-l border-slate-100 py-0.5 italic">
                {line.trim().slice(2)}
              </div>
            );
          }
          if (line.trim().startsWith('```')) {
            return null;
          }
          return <p key={idx} className="text-justify">{line}</p>;
        })}
      </div>
    );
  };

  const filteredDocs = docs.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = catFilter === 'all' || d.category === catFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white border border-slate-150 rounded-[2.25rem] p-6 shadow-sm flex flex-col text-left">
      
      {/* Dynamic Toast Feedback */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-black tracking-tight"
          >
            <CheckCircle2 size={15} className="text-emerald-405" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧠 TOP METADATA & TAB SELECTOR ZONE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Hermes 智能记忆空间 (赫尔墨斯)</span>
            <span className="text-[10px] py-1 px-2.5 bg-indigo-100 text-indigo-700 rounded-lg uppercase tracking-wider font-extrabold font-mono">
              System Router v1.2
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            由您定义的热常驻、冷储存、经典过程与深度画像，双轴并行注入 LLM 沙箱编译器，避免大模版长上下文过载。
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0 border">
          <button
            onClick={() => setActiveWorkspaceTab('hermes')}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-tight flex items-center gap-1.5 transition cursor-pointer ${
              activeWorkspaceTab === 'hermes' 
              ? 'bg-slate-900 text-white shadow' 
              : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Cpu size={14} className={activeWorkspaceTab === 'hermes' ? "text-amber-400" : "text-slate-400"} />
            <span>🧠 Hermes 4层路由记忆舱</span>
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('raw')}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-tight flex items-center gap-1.5 transition cursor-pointer ${
              activeWorkspaceTab === 'raw' 
              ? 'bg-slate-900 text-white shadow' 
              : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Database size={14} className={activeWorkspaceTab === 'raw' ? "text-indigo-400" : "text-slate-400"} />
            <span>📁 知识库实体文档库</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          TAB 1: HERMES MEMORY ROUTER (4-LAYER INTERACTIVE BLUEPRINT)
          ---------------------------------------------------- */}
      {activeWorkspaceTab === 'hermes' && (
        <div className="space-y-6">
          
          {/* 💡 HANDWRITTEN SPIRIT KEY PRINCIPLE BOX */}
          <div className="bg-slate-900 text-white p-5 rounded-[2rem] border border-slate-800 relative overflow-hidden shadow-inner flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 z-10">
              <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">Hermes Mind Philosophy</span>
              <h3 className="text-base font-black tracking-tight font-sans">
                “ 记忆不是存储，而是一个路由问题。”
              </h3>
              <p className="text-xs text-slate-400 leading-normal max-w-xl">
                为了大模型的高画质与低延迟，赫尔墨斯机制拒绝把全部教理资料堆满常驻提示词。只有微小核心置顶，大宗内容进入冷库检索，按触发相关度适时注入。
              </p>
            </div>
            <div className="bg-slate-800/85 border border-white/10 p-3.5 rounded-2xl md:max-w-xs text-left shrink-0 z-10 shadow-lg">
              <span className="text-[10px] text-emerald-400 font-black tracking-widest block uppercase">★ 关键原则</span>
              <p className="text-[10.5px] font-mono text-slate-350 mt-1 leading-relaxed">
                保持提示词尽可能小。把其它对白及硬件参数文件全部推给自动按需检索。
              </p>
            </div>
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT COLUMN: THE 4 LAYERS (COL-SPAN-5) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">①~④ 赫尔墨斯四重记忆层配置</h3>

              {/* ① 热记忆 CARD (RED accent) */}
              <div className={`border rounded-2.5xl p-4 transition-all ${
                expandedLayer === 'hot' 
                ? 'bg-red-50/20 border-red-200 ring-2 ring-red-50' 
                : 'bg-white hover:bg-slate-50 border-slate-205 cursor-pointer shadow-xs'
              }`}
              onClick={() => setExpandedLayer('hot')}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-500 text-white p-1.5 rounded-xl">
                      <Flame size={14} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>① 热记忆 (提示词层)</span>
                        <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-bold">始终在提示词内</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">会话内冻结常驻，体积极小</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-slate-400 transform transition-transform ${expandedLayer === 'hot' ? 'rotate-90' : ''}`} />
                </div>

                <AnimatePresence>
                  {expandedLayer === 'hot' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3.5 space-y-3 pt-3 border-t border-dashed border-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1 text-[9px] text-slate-400">
                          <span className="font-mono font-bold">MEMORY.md</span>
                          <span>会话一次性硬编码常置</span>
                        </div>
                        <textarea
                          rows={3}
                          value={memoryMd}
                          onChange={(e) => setMemoryMd(e.target.value)}
                          className="w-full p-2 bg-white border rounded-xl text-[10px] font-mono leading-relaxed text-slate-705 focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1 text-[9px] text-slate-400">
                          <span className="font-mono font-bold">USER.md</span>
                          <span>用户信息及终端上下文属性</span>
                        </div>
                        <textarea
                          rows={3}
                          value={userMd}
                          onChange={(e) => setUserMd(e.target.value)}
                          className="w-full p-2 bg-white border rounded-xl text-[10px] font-mono leading-relaxed text-slate-705 focus:outline-none focus:border-red-400"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ② 冷记忆 CARD (BLUE accent) */}
              <div className={`border rounded-2.5xl p-4 transition-all ${
                expandedLayer === 'cold' 
                ? 'bg-blue-50/20 border-blue-200 ring-2 ring-blue-50' 
                : 'bg-white hover:bg-slate-50 border-slate-205 cursor-pointer shadow-xs'
              }`}
              onClick={() => setExpandedLayer('cold')}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white p-1.5 rounded-xl">
                      <Database size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>② 冷记忆 (情节库 - SQLite)</span>
                        <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-bold">按需动态检索</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">会话历史、海量非活动教案、底层寄存器参数</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-slate-400 transform transition-transform ${expandedLayer === 'cold' ? 'rotate-90' : ''}`} />
                </div>

                <AnimatePresence>
                  {expandedLayer === 'cold' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-dashed border-slate-200 space-y-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-[10px] text-slate-400 leading-normal">
                        冷区对应本地 state 数据库储存。
                        当前通过右侧的<strong>“教案实体文档库”</strong>加载了 <strong>{docs.length} 篇</strong> 高保真理论文章。
                      </p>
                      
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 space-y-1.5 max-h-[140px] overflow-y-auto font-sans">
                        <span className="text-[9px] text-slate-450 uppercase tracking-widest font-extrabold flex items-center gap-1">
                          <History size={10} className="text-blue-500" />
                          <span>历史会话存档轮询条目</span>
                        </span>
                        {docs.map(doc => (
                          <div key={doc.id} className="text-[10px] text-slate-600 flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <span className="truncate max-w-[200px] font-medium">{doc.title}</span>
                            <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold ${doc.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                              {doc.enabled ? '已激活可检索' : '非活动'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ③ 过程记忆 CARD (GREEN accent) */}
              <div className={`border rounded-2.5xl p-4 transition-all ${
                expandedLayer === 'process' 
                ? 'bg-emerald-50/20 border-emerald-205 ring-2 ring-emerald-50' 
                : 'bg-white hover:bg-slate-50 border-slate-205 cursor-pointer shadow-xs'
              }`}
              onClick={() => setExpandedLayer('process')}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-600 text-white p-1.5 rounded-xl">
                      <Cpu size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>③ 过程记忆 (工作流技能)</span>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">按功能调用</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">复用度高，如 React 框架、ADC 中断防抖协议</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-slate-400 transform transition-transform ${expandedLayer === 'process' ? 'rotate-90' : ''}`} />
                </div>

                <AnimatePresence>
                  {expandedLayer === 'process' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-dashed border-slate-200 space-y-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-[10px] text-slate-400 leading-normal">
                        勾选您需要让 Hermes 对话自动加载复用的标准化微操作技能规约：
                      </p>
                      
                      <div className="space-y-1.5">
                        {processSkills.map((skill) => (
                          <label key={skill.id} className="flex items-start gap-2 bg-white border border-slate-150 p-2 rounded-xl cursor-pointer hover:border-emerald-300 transition text-left">
                            <input
                              type="checkbox"
                              checked={skill.active}
                              onChange={() => {
                                setProcessSkills(processSkills.map(s => s.id === skill.id ? { ...s, active: !s.active } : s));
                              }}
                              className="w-3.5 h-3.5 mt-0.5 text-emerald-600 rounded"
                            />
                            <div>
                              <strong className="text-[10px] font-bold text-slate-800 tracking-tight block">{skill.name}</strong>
                              <span className="text-[9px] text-slate-400 leading-normal block">{skill.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ④ 深度记忆 CARD (YELLOW/ORANGE accent - Optional) */}
              <div className={`border rounded-2.5xl p-4 transition-all ${
                expandedLayer === 'deep' 
                ? 'bg-amber-50/20 border-amber-205 ring-2 ring-amber-50' 
                : 'bg-white hover:bg-slate-50 border-slate-205 cursor-pointer shadow-xs'
              }`}
              onClick={() => setExpandedLayer('deep')}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-500 text-white p-1.5 rounded-xl">
                      <User size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>④ 深度记忆 (用户模型 Honcho)</span>
                        <span className="text-[8px] bg-amber-105 text-amber-800 px-1.5 py-0.5 rounded-md font-bold">按需跨会话注入</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">描述用户或学生偏好、行为特质与激励层</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-slate-400 transform transition-transform ${expandedLayer === 'deep' ? 'rotate-90' : ''}`} />
                </div>

                <AnimatePresence>
                  {expandedLayer === 'deep' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-dashed border-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-slate-400 uppercase font-bold font-mono">honcho.db (JSON-Mock)</span>
                        <span className="text-[8px] text-slate-400 italic">跨周期的认知记录资产</span>
                      </div>
                      <textarea
                        rows={5}
                        value={honchoDb}
                        onChange={(e) => setHonchoDb(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-250 rounded-xl text-[10px] font-mono leading-relaxed text-slate-705 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* RIGHT COLUMN: INTERACTIVE PIPELINE ROUTER (COL-SPAN-7) */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-[2.25rem] p-5 flex flex-col justify-between shadow-xs">
              
              <div className="space-y-4">
                
                {/* 🚀 QUICK SCENARIO SELECTOR */}
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-2">⚡ 快速载入系统设计大纲提问模版：</span>
                  <div className="flex flex-wrap gap-2">
                    {PIPELINE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPipelineQuery(preset.query);
                          setPipelineStatus('idle');
                          showToast(`已加载：${preset.title}`);
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 hover:border-indigo-305 text-slate-705 font-bold rounded-lg text-[10px] border transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare size={10} className="text-indigo-500" />
                        <span>{preset.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 🚀 INPUT ZONE */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">即时设计指示输入 (User Context)</span>
                    <span className="text-[9px] text-amber-500 font-mono">Input Line</span>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={pipelineQuery}
                      onChange={(e) => {
                        setPipelineQuery(e.target.value);
                        setPipelineStatus('idle');
                      }}
                      className="w-full p-3 pr-24 bg-white border border-slate-250 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-indigo-400 shadow-inner"
                      placeholder="我想让 AI 帮我设计..."
                    />
                    
                    <button
                      onClick={handleRunHermesPipeline}
                      disabled={pipelineStatus !== 'idle' && pipelineStatus !== 'completed'}
                      className="absolute right-3.5 bottom-3.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl py-1.5 px-3 text-xs font-black transition flex items-center gap-1 cursor-pointer shadow active:scale-95 disabled:opacity-50"
                    >
                      {pipelineStatus === 'idle' || pipelineStatus === 'completed' ? (
                        <>
                          <Zap size={11} fill="currentColor" />
                          <span>一键智能拼装</span>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 items-stretch">
                          <span className="animate-spin text-[10px]">⚙️</span>
                          <span>处理中 ({pipelineStepIndex}/6)</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* 🚀 ANIMATED PIPELINE SYSTEM GRID */}
                <div className="bg-white p-4.5 rounded-2.5xl border border-slate-200 shadow-inner space-y-3.5 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block text-left">🧠 赫尔墨斯四重记忆合并拼装流程监控</span>
                  
                  {/* Row of visual icons representing the flowchart exactly! */}
                  <div className="flex items-center justify-between gap-1 overflow-x-auto py-2 no-scrollbar">
                    
                    {/* Step A: User Query */}
                    <div className="flex flex-col items-center shrink-0 w-[14%]">
                      <div className={`p-2 rounded-xl transition-all ${pipelineStepIndex >= 1 ? 'bg-indigo-600 text-white border-2 border-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                        <MessageSquare size={14} />
                      </div>
                      <span className="text-[8px] font-black mt-1 text-slate-700">①用户提问</span>
                    </div>

                    <ArrowRight size={10} className={pipelineStepIndex >= 1 ? 'text-indigo-500' : 'text-slate-300'} />

                    {/* Step B: Cold db search */}
                    <div className="flex flex-col items-center shrink-0 w-[14%]">
                      <div className={`p-2 rounded-xl transition-all ${pipelineStepIndex >= 1 ? 'bg-blue-600 text-white animate-bounce' : 'bg-slate-100 text-slate-500'}`}>
                        <Search size={14} />
                      </div>
                      <span className="text-[8px] font-black mt-1 text-slate-705">②冷库检索</span>
                    </div>

                    <ArrowRight size={10} className={pipelineStepIndex >= 2 ? 'text-blue-500' : 'text-slate-300'} />

                    {/* Step C: Context Compressing */}
                    <div className="flex flex-col items-center shrink-0 w-[14%]">
                      <div className={`p-2 rounded-xl transition-all ${pipelineStepIndex >= 2 ? 'bg-purple-650 text-white border-2 border-purple-200' : 'bg-slate-100 text-slate-500'}`}>
                        <Sparkles size={14} />
                      </div>
                      <span className="text-[8px] font-black mt-1 text-slate-705">③提炼摘要</span>
                    </div>

                    <ArrowRight size={10} className={pipelineStepIndex >= 3 ? 'text-purple-500' : 'text-slate-300'} />

                    {/* Step D: Active skills */}
                    <div className="flex flex-col items-center shrink-0 w-[14%]">
                      <div className={`p-2 rounded-xl transition-all ${pipelineStepIndex >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Cpu size={14} />
                      </div>
                      <span className="text-[8px] font-black mt-1 text-slate-7‘5">④匹配技能</span>
                    </div>

                    <ArrowRight size={10} className={pipelineStepIndex >= 4 ? 'text-emerald-500' : 'text-slate-300'} />

                    {/* Step E: Context Assembly */}
                    <div className="flex flex-col items-center shrink-0 gap-[2px] w-[15%] relative">
                      <div className={`p-1.5 rounded-xl transition-all border ${
                        pipelineStepIndex >= 5 ? 'bg-amber-500 border-amber-300 text-slate-950 shadow shadow-amber-200 animate-pulse' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <BookOpen size={13} />
                      </div>
                      <span className="text-[8.5px] font-black text-slate-800">⑤组装上下文</span>
                    </div>

                    <ArrowRight size={10} className={pipelineStepIndex >= 6 ? 'text-amber-500' : 'text-slate-300'} />

                    {/* Step F: LLM Response */}
                    <div className="flex flex-col items-center shrink-0 w-[14%]">
                      <div className={`p-2 rounded-xl transition-all ${pipelineStepIndex >= 6 ? 'bg-slate-900 text-yellow-300 border border-slate-750 font-mono text-[9px] font-black' : 'bg-slate-100 text-slate-500'}`}>
                        <span>LLM</span>
                      </div>
                      <span className="text-[8px] font-black mt-1 text-slate-705">⑥响应生成</span>
                    </div>

                  </div>

                  {/* Operational details readout */}
                  <div className="text-left bg-slate-50 border p-3 rounded-xl min-h-[95px] flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-extrabold uppercase font-mono text-indigo-500 flex items-center justify-between">
                        <span>实时日志/Pipeline Data Streaming</span>
                        <span className="bg-indigo-100 text-indigo-800 font-bold px-1 rounded text-[7px]" style={{ fontSize: '7px' }}>ACTIVE ROUTING</span>
                      </div>
                      
                      <div className="mt-1 flex flex-col gap-1">
                        {pipelineStatus === 'idle' && (
                          <div className="text-[10px] text-slate-500 italic flex items-center gap-1.5">
                            <InfoDot />
                            <span>输入您的设计指令，或选择上方的快捷模版开始触发 4 层记忆中枢路由拼装过程...</span>
                          </div>
                        )}
                        {pipelineStatus === 'searching' && (
                          <div className="text-[10px] text-blue-650 font-bold flex items-center gap-1.5 animate-pulse">
                            <SpinnerIcon />
                            <span>正在在 冷记忆数据库(SQLite) 内全文交叉相关条目，载入非活动高保真参考片段...</span>
                          </div>
                        )}
                        {pipelineStatus === 'summarizing' && (
                          <div className="text-[10px] text-purple-600 font-bold flex items-center gap-1.5">
                            <SpinnerIcon />
                            <span>[冷区中转] 检索匹配完成。正在计算提炼此条目的内容摘要并对多媒体音频数据做提炼压缩...</span>
                          </div>
                        )}
                        {pipelineStatus === 'skills' && (
                          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5">
                            <SpinnerIcon />
                            <span>过程记忆匹配：正在基于大模版拼装加载 [montessori-pedagogy]、[dr-zhang-baritone] 标准技能规约...</span>
                          </div>
                        )}
                        {pipelineStatus === 'honcho' && (
                          <div className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5">
                            <SpinnerIcon />
                            <span>深度记忆层轮换：正在注入 [Honcho 用户模型对准资产] (3-6岁学前感知实操特质偏向)...</span>
                          </div>
                        )}
                        {pipelineStatus === 'assembling' && (
                          <div className="text-[10px] text-orange-600 font-bold flex items-center gap-1.5 animate-pulse">
                            <SpinnerIcon />
                            <span>【拼装大满贯】正在重写当前会话 prompt，将 [热记忆 + 深度 + 冷检索摘要 + 过程技能] 整合成标准提纲指令段。</span>
                          </div>
                        )}
                        {pipelineStatus === 'completed' && (
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-800 flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              <span className="font-extrabold">拼装路由完成！已编译一个极纯、小体积的上下文馈送大模型。</span>
                            </div>
                            <div className="text-[9px] text-slate-400 leading-normal pl-4">
                              冷记忆检索出 <strong>{retrievedSnippets.length} 个</strong> 规则，并成功压缩了上下文，技能库中已挂载 <strong>{processSkills.filter(s => s.active).length} 项</strong> 工作流约束。
                              {pipelineSummary && <div className="mt-1 text-[9.5px] text-indigo-600 bg-indigo-50/55 p-2 rounded-xl border border-indigo-100/50 leading-relaxed font-sans">{pipelineSummary}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
              
              {/* 🚀 ASSEMBLED CONTEXT PREVIEW & GENERATION (Visible after completion) */}
              {pipelineStatus === 'completed' && (
                <div className="mt-5 space-y-4">
                  
                  {/* Left: Combined Markdown Payload */}
                  <div className="bg-white border rounded-2xl p-4 shadow-sm text-left">
                    <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest block mb-1">⑤ 组装就绪的上下文大纲 (System Prompt Payload Preview)</span>
                    <textarea
                      readOnly
                      rows={4}
                      className="w-full p-2.5 bg-slate-900 text-yellow-100 font-mono text-[9px] leading-relaxed rounded-xl focus:outline-none"
                      value={assembledContext}
                    />
                  </div>

                  {/* Right: Simulated final response output */}
                  <div className="bg-indigo-950/95 border border-indigo-900 rounded-2xl p-4 text-white shadow-md text-left">
                    <span className="text-[9.5px] text-emerald-400 font-black uppercase tracking-widest block mb-1">⑥ 赫尔墨斯认知编译器返回教案 (LLM Final Response)</span>
                    <div className="font-sans text-[10.5px] bg-indigo-900/40 border border-white/5 p-3 rounded-xl leading-relaxed text-justify text-indigo-100 max-h-[160px] overflow-y-auto">
                      {renderMarkdownText(simulatedLLMOutput)}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: RAW CRUD KNOWLEDGE DATABASE (THE ORIGINAL CRUD VIEW)
          ---------------------------------------------------- */}
      {activeWorkspaceTab === 'raw' && (
        <div className="space-y-4">
          
          {/* Main search filter bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="全文检索数据库文档..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-450 placeholder:text-slate-450"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar-x">
              {[
                { key: 'all', val: '🗂️ 全部文章' },
                { key: 'pedagogy', val: '🎓 教学理论' },
                { key: 'hardware', val: '🔌 硬件规格' },
                { key: 'interaction', val: '💬 交互方法' },
                { key: 'voice', val: '🎙️ 音素音调' },
                { key: 'other', val: '📁 其它' }
              ].map((cat) => {
                const isActive = catFilter === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCatFilter(cat.key)}
                    className={`px-3.5 py-2 rounded-xl text-[11px] font-black tracking-tight whitespace-nowrap transition cursor-pointer border ${
                      isActive 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {cat.val}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-xs text-slate-400 font-bold">目前共库中登记了 <strong>{filteredDocs.length} 篇</strong> 精细教案规制：</span>
            <div className="flex gap-2">
              <button
                onClick={handleResetPresets}
                className="px-3 py-1.5 bg-slate-50 border hover:bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>恢复出厂原色指示</span>
              </button>
              
              <button
                onClick={handleTriggerAdd}
                className="px-3 border py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-[10px] font-black transition flex items-center gap-1.5 cursor-pointer shadow-indigo-100 shadow-sm"
              >
                <Plus size={11} />
                <span>撰写特设 Markdown 文章</span>
              </button>
            </div>
          </div>

          {/* Core CRUD View Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* List */}
            <div className={`col-span-1 ${isEditorOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3.5`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-slate-50 border border-dashed rounded-3xl">
                    <FileText size={32} className="mx-auto text-slate-350 mb-3" />
                    <span className="text-xs font-black text-slate-700 block">库中暂未添加教学条目</span>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                      建议直接恢复出厂设置重置，或者点击上方“撰写特设 Markdown 文章”进行添加。
                    </p>
                  </div>
                ) : (
                  filteredDocs.map((doc) => {
                    const catInfo = CATEGORY_MAP[doc.category] || CATEGORY_MAP.other;
                    return (
                      <div
                        key={doc.id}
                        onClick={(e) => handleTriggerEdit(doc, e)}
                        className={`border transition-all rounded-2xl p-4 text-left relative cursor-pointer flex flex-col justify-between hover:shadow h-[180px] ${
                          doc.enabled 
                          ? 'bg-white border-indigo-200 ring-2 ring-indigo-50/20' 
                          : 'bg-slate-50/70 border-slate-200 opacity-70'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border shrink-0 ${catInfo.style}`}>
                              {catInfo.label.split('(')[0]}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {doc.isPreset && (
                                <span className="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md font-bold">预设</span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => handleToggleDoc(doc.id, e)}
                                className={`p-1 rounded-md border transition-transform ${
                                  doc.enabled ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-400 bg-slate-100'
                                }`}
                                title={doc.enabled ? "点击停用" : "点击在此课件中启用"}
                              >
                                <Check size={10} className={doc.enabled ? "opacity-100" : "opacity-40"} />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDeleteDoc(doc.id, e)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                                title="立刻物理删除此项"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>

                          <strong className="text-xs font-black text-slate-900 tracking-tight block truncate mb-1">
                            {doc.title}
                          </strong>

                          <p className="text-[10px] text-slate-500 leading-normal text-justify line-clamp-3">
                            {doc.content.replace(/[#*`]/g, '')}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 font-bold font-mono">
                          <span className="truncate max-w-[150px] flex items-center gap-1 text-indigo-500">
                            <Tag size={8} />
                            <span>{doc.tags.join(' | ')}</span>
                          </span>
                          <span>最后更新: {doc.lastUpdated}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Editor drawer */}
            <AnimatePresence>
              {isEditorOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="col-span-1 lg:col-span-5 w-full shrink-0"
                >
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 relative flex flex-col shadow-sm text-left">
                    <div className="flex justify-between items-center pb-2.5 border-b mb-4">
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={14} className="text-indigo-600" />
                        <h3 className="text-xs font-black text-slate-900">
                          {formDocId ? '✏️ 编辑冷数据库文本' : '➕ 增加自定义冷属性 Markdown'}
                        </h3>
                      </div>
                      <button
                        onClick={() => { setIsEditorOpen(false); setFormDocId(null); }}
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-red-500 transition"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className="flex bg-slate-200 p-1 rounded-xl mb-4 self-start">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('edit')}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${previewTab === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-850'}`}
                      >
                        <Code size={10} />
                        <span>源码编辑</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('preview')}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${previewTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-650 hover:text-slate-850'}`}
                      >
                        <Eye size={10} />
                        <span>效果合成预览</span>
                      </button>
                    </div>

                    <form onSubmit={handleSubmitForm} className="space-y-4">
                      {previewTab === 'edit' ? (
                        <div className="space-y-3.5">
                          <div>
                            <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">大纲标题</label>
                            <input
                              type="text"
                              required
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 bg-white border border-slate-350 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="例如：视觉传导颜色消除教理大纲"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] text-slate-400 font-black block mb-1">栏目划分</label>
                              <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value as KbDocCategory})}
                                className="w-full p-1.5 bg-white border rounded-xl text-xs focus:outline-none"
                              >
                                <option value="pedagogy">🎓 教学理论 (Pedagogy)</option>
                                <option value="hardware">🔌 硬件规格 (Hardware)</option>
                                <option value="interaction">💬 交互方法 (Interaction)</option>
                                <option value="voice">🎙️ 配音语素 (Voice Cues)</option>
                                <option value="other">📁 其它</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block mb-1">标签</label>
                              <input
                                type="text"
                                value={formData.tagsStr}
                                onChange={(e) => setFormData({...formData, tagsStr: e.target.value})}
                                className="w-full p-2 bg-white border rounded-xl text-xs focus:outline-none"
                                placeholder="蒙氏, 消除, 配件"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">Markdown 正文</label>
                            <textarea
                              rows={8}
                              required
                              value={formData.content}
                              onChange={(e) => setFormData({...formData, content: e.target.value})}
                              className="w-full p-2.5 bg-white border rounded-xl text-xs font-mono leading-relaxed focus:outline-none"
                              placeholder="### 一、核心要求\n1. 配对时需要阻抗反馈...\n2. 伴读语音下沉..."
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              id="enabled-chk-2"
                              type="checkbox"
                              checked={formData.enabled}
                              onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                              className="w-3.5 h-3.5 text-indigo-600 rounded cursor-pointer"
                            />
                            <label htmlFor="enabled-chk-2" className="text-xs text-slate-700 font-extrabold cursor-pointer">
                              启用此规则（在 Hermes / LLM 编译时可被检索合并）
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border rounded-2xl p-4 min-h-[250px] overflow-y-auto max-h-[350px]">
                          <div className="border-b pb-2 mb-3">
                            <span className="text-[8.5px] uppercase font-black text-indigo-500">
                              {CATEGORY_MAP[formData.category]?.label || '其它'}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 mt-1">{formData.title || '（未输入标题）'}</h4>
                          </div>
                          {renderMarkdownText(formData.content)}
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-tight"
                        >
                          保存更改入库
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsEditorOpen(false); setFormDocId(null); }}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-350 rounded-xl text-xs font-black text-slate-700"
                        >
                          退出取消
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

    </div>
  );
}

// --- Minimal Helper Visual Components for clean render ---
function InfoDot() {
  return (
    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 block shrink-0" />
  );
}

function SpinnerIcon() {
  return (
    <span className="animate-spin text-xs" style={{ display: 'inline-block' }}>⚙️</span>
  );
}
