import { motion } from 'framer-motion';
import { FileText, Clapperboard, ActivitySquare, Plus } from 'lucide-react';

export default function Courseware() {
  const cards = [
    {
      title: '智能 TPR 教案生成',
      desc: '输入单元主题（如“埃及之旅”），AI 自动生成含“活动目标、活动过程”的完整教案，并自动编排机器人的肢体动作。',
      icon: FileText,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: '双师课件编辑器',
      desc: '支持拖拽视频、图片、H5 游戏，并在时间轴上插入“小布米唤醒节点”。实现大屏展示与线下机器人声光电完美同频。',
      icon: Clapperboard,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      title: 'AI 体适能/动作评测',
      desc: '配置标准动作模型，调用机器视觉实时对比孩子的姿态（如马步角度），大屏自动标红纠错，并生成期末能力雷达图证书。',
      icon: ActivitySquare,
      color: 'text-emerald-600 bg-emerald-100',
    }
  ];

  return (
    <div className="flex w-full max-w-7xl mx-auto min-h-[calc(100vh-200px)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 pr-6 py-8 hidden lg:block">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">教师工作台</h2>
        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-primary rounded-xl font-medium">
            <Plus size={18} />
            新建课件
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">
            <FileText size={18} />
            我的云盘
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">
            <ActivitySquare size={18} />
            评测档案
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-10 py-8 px-4 lg:px-0">
        <div className="flex justify-between items-end mb-10">
           <div>
             <h1 className="text-3xl font-bold text-slate-900 mb-2">一键式具身教学排版</h1>
             <p className="text-slate-500">探奇老师专属的创作引擎</p>
           </div>
           <div className="hidden sm:block">
             <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
               快速导入
             </button>
           </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${card.color}`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-3">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-white border text-center border-slate-200 border-dashed rounded-3xl p-12 text-slate-400">
           <FileText size={48} className="mx-auto mb-4 opacity-50" />
           <p className="text-lg">近期暂无编辑记录</p>
           <p className="text-sm">点击左侧“新建课件”开启创作。</p>
        </div>
      </main>
    </div>
  );
}
