import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, MonitorPlay, Blocks } from 'lucide-react';

export default function Tools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'print-my-dream',
      title: '造梦打印机',
      subtitle: 'Print My Dream',
      desc: '语音描述想象，大模型为你生成线稿，并控制小布米打印出物理画纸供孩子涂色。',
      icon: Printer,
      color: 'bg-blue-500',
      bgImg: 'https://picsum.photos/seed/drawingart/400/300'
    },
    {
      id: 'ai-dance',
      title: '镜像伴舞',
      subtitle: 'AI Dance Mirroring',
      desc: '深度相机实时捕获孩子骨骼点，将律动映射到机器人关节，专属的艺术玩伴 (概念演示)。',
      icon: MonitorPlay,
      color: 'bg-orange-500',
      bgImg: 'https://picsum.photos/seed/dancekid/400/300'
    },
    {
      id: 'block-animator',
      title: '积木复活引擎',
      subtitle: 'Block Animator',
      desc: '将探奇积木作品拍照，AI 自动去除背景并将其融入动画童话场景中 (概念演示)。',
      icon: Blocks,
      color: 'bg-yellow-500',
      bgImg: 'https://picsum.photos/seed/blocks/400/300'
    }
  ];

  if (activeTool === 'print-my-dream') {
    return (
      <div className="fixed inset-0 z-[100] bg-black">
        <button 
          onClick={() => setActiveTool(null)}
          className="absolute top-4 left-4 z-[999] bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
        {/* Render the Web Component directly */}
        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: '<gdm-live-audio></gdm-live-audio>' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 w-full py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-4">赋能孩子的想象力</h1>
        <p className="text-xl text-slate-500">探奇特色的多模态 AI 生成与交互体验矩阵</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className="relative group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 cursor-pointer h-96 flex flex-col"
              onClick={() => setActiveTool(tool.id)}
              whileHover={{ y: -8 }}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                <img src={tool.bgImg} alt={tool.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className={`absolute top-4 right-4 z-20 ${tool.color} text-white p-3 rounded-2xl shadow-lg`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{tool.title}</h3>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{tool.subtitle}</p>
                    <p className="text-slate-600 line-clamp-3">{tool.desc}</p>
                 </div>
                 <div className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    开始体验 &rarr;
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Alert modal when clicking concepts */}
      {activeTool && activeTool !== 'print-my-dream' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative"
            >
              <button 
                onClick={() => setActiveTool(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-blue-50 text-primary mx-auto rounded-full flex items-center justify-center mb-6">
                <Blocks size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">即将上线</h3>
              <p className="text-slate-500 mb-6">该功能模块正在研发中，敬请期待！请体验「造梦打印机」。</p>
              <button onClick={() => setActiveTool(null)} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90">
                知道了
              </button>
            </motion.div>
         </div>
      )}
    </div>
  );
}
