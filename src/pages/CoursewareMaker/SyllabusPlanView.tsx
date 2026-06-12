import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, ListOrdered } from 'lucide-react';
import { Slide } from './types';

interface SyllabusPlanViewProps {
  courseTitle: string;
  setCourseTitle: (t: string) => void;
  targetAge: string;
  setTargetAge: (a: string) => void;
  teachingObjectives: string;
  setTeachingObjectives: (o: string) => void;
  slides: Slide[];
  onAddSlide: (title: string, intent: string) => void;
  onDeleteSlide: (id: string) => void;
  onUpdateSlide: (id: string, title: string, intent: string) => void;
}

export default function SyllabusPlanView({
  courseTitle,
  setCourseTitle,
  targetAge,
  setTargetAge,
  teachingObjectives,
  setTeachingObjectives,
  slides,
  onAddSlide,
  onDeleteSlide,
  onUpdateSlide
}: SyllabusPlanViewProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newIntent, setNewIntent] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddSlide(newTitle, newIntent || '介绍本课时核心互动内容。');
    setNewTitle('');
    setNewIntent('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Metadata & Pedagogical Targets */}
      <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <BookOpen className="text-blue-600" size={20} />
          <h2 className="text-sm font-black text-slate-850 tracking-wider">课程大纲根配置</h2>
        </div>

        {/* Course Title input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black tracking-widest text-slate-400 uppercase">课程主题名称</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none transition-colors"
            placeholder="例如: 红黄蓝配对大闯关"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          />
        </div>

        {/* Target Age input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black tracking-widest text-slate-400 uppercase">幼儿建议适龄段</label>
          <div className="relative">
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-850 bg-slate-50 focus:bg-white focus:outline-none appearance-none transition-colors"
              value={targetAge}
              onChange={(e) => setTargetAge(e.target.value)}
            >
              <option value="2-3岁 (托班探索)">2-3岁 (托班探索)</option>
              <option value="3-4岁 (小班感知)">3-4岁 (小班感知)</option>
              <option value="4-5岁 (中班思维)">4-5岁 (中班思维)</option>
              <option value="5-6岁 (大班探奇)">5-6岁 (大班探奇)</option>
              <option value="3-6岁 (幼小衔接)">3-6岁 (幼小衔接)</option>
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Objectives textarea */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-black tracking-widest text-slate-400 uppercase">核心融合教学目标</label>
            <span className="text-[9px] text-slate-400 font-bold">配合教具说明</span>
          </div>
          <textarea
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-750 bg-slate-50 focus:bg-white focus:outline-none transition-colors font-sans leading-relaxed"
            placeholder="格式例: 1. 认知红色原色... 2. 自主插木彩块..."
            value={teachingObjectives}
            onChange={(e) => setTeachingObjectives(e.target.value)}
          />
        </div>
      </div>

      {/* Right Column: Lessons Sequence Timeline & Adding Tools */}
      <div className="lg:col-span-8 space-y-6">
        {/* Adds New Slide Form */}
        <form onSubmit={handleCreate} className="bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border border-blue-100 rounded-[2rem] p-5">
          <h3 className="text-xs font-black text-blue-900 tracking-wider mb-3 flex items-center gap-1.5">
            <Plus size={15} />
            <span>规划添加新课时页面</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
            <div className="md:col-span-4 space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">页面名称 (标题)</label>
              <input
                type="text"
                placeholder="例如: 智能色彩合成仪"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="md:col-span-6 space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">备课引导意图 / 幼儿交互方案</label>
              <input
                type="text"
                placeholder="在此描述此阶段孩子配合实物教具要完成的事情..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                value={newIntent}
                onChange={(e) => setNewIntent(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
              >
                加入大纲
              </button>
            </div>
          </div>
        </form>

        {/* Existing Timeline */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="text-indigo-600" size={18} />
              <h3 className="text-xs font-black text-slate-850">教学大纲顺序规划 ({slides.length} 个页面)</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">请核对各关卡页面顺序</span>
          </div>

          {slides.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <BookOpen size={30} className="mx-auto opacity-30 text-indigo-500" />
              <p className="text-xs font-bold">暂无课时，请在上方规划输入一个页面大纲！</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {slides.map((slide) => (
                <div key={slide.id} className="relative pl-10 group">
                  {/* Timeline Badge */}
                  <div className="absolute left-1.5 top-1.5 w-7.5 h-7.5 rounded-xl bg-indigo-50 border border-indigo-155 text-indigo-700 flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-250">
                    P{slide.pageNum}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl group-hover:border-indigo-200 transition-colors duration-250 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => onUpdateSlide(slide.id, e.target.value, slide.intent)}
                          className="font-black text-xs text-slate-800 bg-transparent border-b border-transparent hover:border-slate-350 focus:border-indigo-500 focus:outline-none transition-colors duration-150 px-0.5 py-0"
                        />
                      </div>
                      <input
                        type="text"
                        value={slide.intent}
                        onChange={(e) => onUpdateSlide(slide.id, slide.title, e.target.value)}
                        className="text-[11px] text-slate-500 w-full bg-transparent border-b border-transparent hover:border-slate-350 focus:border-indigo-500 focus:outline-none transition-colors duration-150 px-0.5 py-0 leading-relaxed font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0 md:self-center">
                      <button
                        onClick={() => onDeleteSlide(slide.id)}
                        className="p-1 px-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer self-start md:self-auto"
                        title="删除该规划页"
                      >
                        <Trash2 size={12} />
                        <span>移除</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
