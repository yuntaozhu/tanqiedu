import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Cpu, Sparkles, Rocket } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const productsData = [
  {
    id: 'l1',
    name: 'Level 1: 小建筑师',
    tags: ['小班', '2册版'],
    icon: Box,
    desc: '启蒙期探索。以颗粒积木拼搭为主，结合基础音频互动。',
    components: '录音播放模块、红外感应模块',
    lessons: '埃及之旅、创意乐园',
    color: 'bg-blue-500',
    image: 'https://picsum.photos/seed/level1/600/400'
  },
  {
    id: 'l2',
    name: 'Level 2: 百变工程',
    tags: ['中班', '4册版'],
    icon: Cpu,
    desc: '引入基础动态模块，让静态模型动起来，培养物理直觉。',
    components: '灵犀马达（自带传感器三种模式）',
    lessons: '各种各样的车、科技博物馆',
    color: 'bg-emerald-500',
    image: 'https://picsum.photos/seed/level2/600/400'
  },
  {
    id: 'l3',
    name: 'Level 3: 小发明家',
    tags: ['大班', '6册版'],
    icon: Sparkles,
    desc: '高阶编程启蒙。通过图灵编程板为作品注入"灵魂和大脑"。',
    components: '图灵编程板',
    lessons: '趣味游戏、游乐场',
    color: 'bg-orange-500',
    image: 'https://picsum.photos/seed/level3/600/400'
  },
  {
    id: 'l4',
    name: 'Level 4: 创意空间',
    tags: ['学前班', '8册版'],
    icon: Rocket,
    desc: '综合机电工程。多电机协同与复杂逻辑控制。',
    components: '三电机动力组、双遥控马达',
    lessons: '奇妙的发明、智慧生活',
    color: 'bg-purple-500',
    image: 'https://picsum.photos/seed/level4/600/400'
  }
];

export default function Products() {
  const [activeTab, setActiveTab] = useState(productsData[0].id);

  const activeProduct = productsData.find(p => p.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-4">阶梯式成长体系</h1>
        <p className="text-xl text-slate-500">实体教具与智能硬件的完美融合，陪孩子一路打怪升级。</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Tabs */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">核心产品套装</h3>
           {productsData.map((prod) => {
              const Icon = prod.icon;
              const isActive = activeTab === prod.id;
              return (
                 <button
                    key={prod.id}
                    onClick={() => setActiveTab(prod.id)}
                    className={twMerge(
                       clsx(
                          "flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden",
                          isActive ? "bg-white shadow-xl ring-1 ring-slate-100" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                       )
                    )}
                 >
                    {isActive && (
                       <motion.div layoutId="tab-bg" className="absolute inset-0 bg-white" />
                    )}
                    <span className="relative z-10 flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-md" style={{ backgroundColor: isActive ? 'var(--color-primary)' : '#cbd5e1' }}>
                       <Icon size={24} />
                    </span>
                    <div className="relative z-10">
                       <h4 className={`font-bold ${isActive ? 'text-slate-900 text-lg' : 'text-slate-600'}`}>{prod.name}</h4>
                       <div className="flex gap-2 mt-1">
                          {prod.tags.map(t => (
                             <span key={t} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{t}</span>
                          ))}
                       </div>
                    </div>
                 </button>
              );
           })}

           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-8 mb-2">旗舰硬件</h3>
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer">
              <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Rocket size={150} />
              </div>
              <h4 className="text-xl font-bold mb-2 relative z-10">小布米具身机器人</h4>
              <ul className="text-slate-300 space-y-1 text-sm relative z-10 list-disc ml-4">
                 <li>21 自由度仿生关节</li>
                 <li>NVIDIA Jetson 边缘算力中心</li>
                 <li>高精度深度相机阵列</li>
              </ul>
              <div className="mt-6 inline-block bg-white/20 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-md">了解详情 &rarr;</div>
           </div>
        </div>

        {/* Content */}
        <div className="w-full lg:w-2/3">
           <AnimatePresence mode="wait">
              {activeProduct && (
                 <motion.div
                    key={activeProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full flex flex-col"
                 >
                    <div className="relative w-full h-80 rounded-2xl overflow-hidden mb-8 shadow-inner">
                       <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover" />
                       <div className={`absolute top-4 left-4 ${activeProduct.color} text-white px-4 py-1.5 rounded-lg font-bold shadow-lg`}>
                         {activeProduct.tags.join(" · ")}
                       </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{activeProduct.name}</h2>
                    <p className="text-slate-600 text-lg mb-8 leading-relaxed">{activeProduct.desc}</p>
                    
                    <div className="grid sm:grid-cols-2 gap-6 mt-auto">
                       <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">核心部件</h4>
                          <p className="font-semibold text-slate-800">{activeProduct.components}</p>
                       </div>
                       <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">代表课程</h4>
                          <p className="font-semibold text-primary">{activeProduct.lessons}</p>
                       </div>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
