import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Plus, Trash2, Check, BookOpen, 
  RefreshCw, Search, Tag, Eye, Code, FileText, CheckCircle2, X
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
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  
  // Edit & Form state
  const [formDocId, setFormDocId] = useState<string | null>(null); // null means adding a new doc, filled means editing
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

  // Load from localStorage on mount
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
    // Fallback to initial preset data if empty
    setDocs(CONST_PRESETS);
    onKnowledgeChanged(CONST_PRESETS);
    localStorage.setItem('tanqi_knowledge_documents', JSON.stringify(CONST_PRESETS));
  }, []);

  // Save to localStorage helper
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

  // Toggle active status
  const handleToggleDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = docs.map(d => {
      if (d.id === id) {
        const current = !d.enabled;
        showToast(current ? '已启用此知识文档' : '已停用此知识文档_');
        return { ...d, enabled: current };
      }
      return d;
    });
    saveDocs(updated);
  };

  // Delete doc
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

  // Trigger form for Addition
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

  // Trigger form for Edition
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

  // Submit form (handles both Add and Update)
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
      // Editing an existing doc
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
      // Creating a new doc
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

  // Reset to original preset data
  const handleResetPresets = () => {
    if (window.confirm('确定要恢复出厂推荐的教案指导吗？这将覆盖您现有的修改。')) {
      saveDocs(CONST_PRESETS);
      showToast('已重置回推荐指南知识方案');
      setIsEditorOpen(false);
      setFormDocId(null);
    }
  };

  // Render basic markdown strings in beautiful styles
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
              <div key={idx} className="pl-4 relative before:absolute before:left-1 before:top-2 before:w-1.5 before:height-1.5 before:bg-indigo-400 before:rounded-full py-0.5">
                {line.startsWith('- ') ? line.slice(2) : line}
              </div>
            );
          }
          if (line.startsWith('   - ') || line.startsWith('  - ')) {
            return (
              <div key={idx} className="pl-8 text-slate-550 border-l border-slate-100 py-0.5 italic">
                {line.trim().slice(2)}
              </div>
            );
          }
          if (line.trim().startsWith('```')) {
            if (line.includes('```') && lines[idx+1] && !lines[idx+1].includes('```')) {
              return null; // Handle codeblocks simply
            }
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
    <div className="bg-white border border-slate-150 rounded-[2.25rem] p-6 shadow-xs flex flex-col">
      
      {/* Dynamic Toast feedback */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-black tracking-tight"
          >
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header zone */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>教学知识本源管理仓库</span>
                <span className="text-[10px] py-0.5 px-2 bg-indigo-100 text-indigo-800 rounded-lg uppercase tracking-wider font-extrabold font-mono">
                  localstorage
                </span>
              </h2>
              <p className="text-xs text-slate-400">增减、编译或重写蒙台梭利原辅教案，让大模型在第五步沙箱装配代码时，完全尊重您的知识训阻与硬件规格。</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetPresets}
            type="button"
            className="px-3.5 py-2.5 bg-slate-50 border hover:bg-slate-100 rounded-2xl text-xs font-black text-slate-600 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>恢复出厂重置</span>
          </button>
          
          <button
            onClick={handleTriggerAdd}
            type="button"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-md shadow-indigo-150 cursor-pointer"
          >
            <Plus size={15} />
            <span>增加知识文档 (Markdown)</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND NAVIGATION TABS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        
        {/* Search Input */}
        <div className="md:col-span-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="全文检索知识文档..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-400 placeholder:text-slate-400"
          />
        </div>

        {/* Category Filters */}
        <div className="md:col-span-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { key: 'all', val: '🗂️ 全部规章' },
            { key: 'pedagogy', val: '🎓 教学理论' },
            { key: 'hardware', val: '🔌 硬件规格' },
            { key: 'interaction', val: '💬 交互方法' },
            { key: 'voice', val: '🎙️ 音素对白' },
            { key: 'other', val: '📁 其它' }
          ].map((cat) => {
            const isActive = catFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCatFilter(cat.key)}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-black tracking-tight whitespace-nowrap transition cursor-pointer border ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}
              >
                {cat.val}
              </button>
            );
          })}
        </div>

      </div>

      {/* CORE DISPLAY WORKSPACE (LIST & EDITOR PANEL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: MASTER LISTING */}
        <div className={`col-span-1 ${isEditorOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-slate-50 border border-dashed rounded-3xl">
                <FileText size={32} className="mx-auto text-slate-350 mb-3" />
                <span className="text-xs font-black text-slate-700 block">
                  没有找到符合条件的特种先验规范
                </span>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                  您可以一键恢复出模版教案，或者使用右上角的“增加知识文档”自行编译教学标准。
                </p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const catInfo = CATEGORY_MAP[doc.category] || CATEGORY_MAP.other;
                return (
                  <div
                    key={doc.id}
                    onClick={(e) => handleTriggerEdit(doc, e)}
                    className={`border transition-all rounded-2xl p-4.5 text-left relative cursor-pointer flex flex-col justify-between hover:shadow-md h-[190px] ${doc.enabled ? 'bg-white border-indigo-200 ring-2 ring-indigo-50/50' : 'bg-slate-50/70 border-slate-200 opacity-70 hover:opacity-100'}`}
                  >
                    <div>
                      {/* Top Meta info */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border shrink-0 ${catInfo.style}`}>
                          {catInfo.label.split('(')[0]}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {doc.isPreset && (
                            <span className="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md font-bold">
                              官方
                            </span>
                          )}

                          {/* Close/Toggle Switch button */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleDoc(doc.id, e)}
                            className={`p-1.5 rounded-lg transition-transform hover:scale-105 active:scale-95 ${doc.enabled ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 'text-slate-400 bg-slate-200'}`}
                            title={doc.enabled ? "点击禁用课件此项注入" : "点击启用课件此项注入"}
                          >
                            <Check size={12} className={doc.enabled ? "opacity-100" : "opacity-40"} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteDoc(doc.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                            title="立刻物理删除此文"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Main Title */}
                      <strong className="text-xs font-black text-slate-900 tracking-tight block truncate group-hover:text-indigo-600 transition-colors mb-1.5">
                        {doc.title}
                      </strong>

                      {/* Snippet body */}
                      <p className="text-[10px] text-slate-500 leading-relaxed overflow-hidden text-justify line-clamp-3">
                        {doc.content.replace(/[#*`]/g, '')}
                      </p>
                    </div>

                    {/* Tags bottom metadata */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 font-bold font-mono">
                      <span className="truncate max-w-[150px] flex items-center gap-1 text-indigo-500">
                        <Tag size={8} />
                        <span>{doc.tags.join(' | ')}</span>
                      </span>
                      <span>更新: {doc.lastUpdated}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT: INTEGRATED RICH EDITOR / MARKDOWN PREVIEW */}
        <AnimatePresence>
          {isEditorOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="col-span-1 lg:col-span-5 w-full shrink-0"
            >
              <div className="bg-slate-50 border border-slate-250 rounded-3xl p-5 shadow-sm text-left relative flex flex-col">
                
                {/* Form header */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4 bg-slate-100/60 p-4 -mx-5 -mt-5 rounded-t-3xl">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={15} className="text-indigo-650" />
                    <h3 className="text-xs font-black text-slate-900">
                      {formDocId ? '✏️ 编辑教学大纲重组规章' : '➕ 增加自定义教学规范文章'}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setIsEditorOpen(false);
                      setFormDocId(null);
                    }}
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition hover:bg-slate-200"
                    title="关闭编辑器"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Tab selectors for Editor and Live Preview */}
                <div className="flex bg-slate-200 p-1 rounded-xl mb-4 self-start">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('edit')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${previewTab === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-650 hover:text-slate-800'}`}
                  >
                    <Code size={11} />
                    <span>源文本输入</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('preview')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${previewTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-650 hover:text-slate-800'}`}
                  >
                    <Eye size={11} />
                    <span>排版效果预览</span>
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4">
                  {previewTab === 'edit' ? (
                    <div className="space-y-3.5">
                      {/* Document title input */}
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">文章标题</label>
                        <input
                          type="text"
                          required
                          placeholder="小班色彩感官多维融合范例-2"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Category list */}
                        <div>
                          <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">重组分类</label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value as KbDocCategory})}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none"
                          >
                            <option value="pedagogy">🎓 教学理论 (Pedagogy)</option>
                            <option value="hardware">🔌 硬件规范 (Hardware)</option>
                            <option value="interaction">💬 交互方法 (Interaction)</option>
                            <option value="voice">🎙️ 配音语素 (Voice Cues)</option>
                            <option value="other">📁 其它参考资料</option>
                          </select>
                        </div>

                        {/* Tag lists */}
                        <div>
                          <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">标签字段 (逗号切分)</label>
                          <input
                            type="text"
                            placeholder="教研, 蒙代尔, 暴击消除"
                            value={formData.tagsStr}
                            onChange={(e) => setFormData({...formData, tagsStr: e.target.value})}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Large text editor textarea */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] text-slate-400 uppercase font-black block">
                            指南指南内容 (Markdown / Plaintext)
                          </label>
                          <span className="text-[8px] text-slate-400 italic">支持标准 `#` 和 `列表` 标记</span>
                        </div>
                        <textarea
                          rows={8}
                          required
                          placeholder="### 设计细节：\n1. 请在画布上使用渐进水粉笔触；\n2. 增加通关声波暴击特效..."
                          value={formData.content}
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none font-mono leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id="enabled-checkbox"
                          type="checkbox"
                          checked={formData.enabled}
                          onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="enabled-checkbox" className="text-xs text-slate-700 font-extrabold cursor-pointer">
                          立即关联到课件 AI 装配编译器中
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border rounded-2xl p-4 min-h-[300px] overflow-y-auto max-h-[380px]">
                      <div className="border-b border-slate-100 pb-2 mb-3">
                        <span className="text-[9px] uppercase font-black text-indigo-500 tracking-wider">
                          {CATEGORY_MAP[formData.category]?.label || '其他参考资料'}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 mt-1">{formData.title || '（标题未指定）'}</h4>
                      </div>
                      {renderMarkdownText(formData.content)}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-tight transition active:scale-95 cursor-pointer text-center"
                    >
                      {formDocId ? '同步保存更改 (Save)' : '将此指南注入仓库 (Add)'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditorOpen(false);
                        setFormDocId(null);
                      }}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black text-slate-700 transition"
                    >
                      取消
                    </button>
                  </div>
                </form>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
