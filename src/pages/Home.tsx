import { motion, Variants } from 'framer-motion';
import { 
  PlayCircle, Calendar, Eye, Layers, Bot, SquareActivity, Printer, Camera, 
  CircleX, CircleCheck, ChevronRight, Box, Cpu, Sparkles, Rocket,
  Quote, Flag, Heart, ShieldCheck, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="flex flex-col w-full bg-slate-50">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden w-full bg-slate-950 px-4 sm:px-6 lg:px-8 py-32 lg:py-48 mb-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[100px] mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/techbg/1920/1080')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        </div>
        
        <motion.div 
          className="relative z-10 text-center max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 font-medium text-sm mb-8 backdrop-blur-md">
            <Sparkles size={16} className="text-secondary" />
            全新一代双师互动生态发布
          </motion.div>
          
          <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-tight">
            让知识，拥有真实的<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">身体</span>。
          </motion.h1>
          
          <motion.p variants={fadeUpVariants} className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            探奇 AI 具身智能教育系统 —— 融合 Web3D 大屏与 21 自由度仿生机器人，跨越屏幕，开启数字与物理共生的下一代双师课堂。
          </motion.p>
          
          <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-3">
              <PlayCircle size={24} /> 观看概念影片
            </button>
            <Link to="/products" className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 text-white border border-slate-700 backdrop-blur-md rounded-2xl font-bold text-lg hover:bg-slate-700 hover:scale-105 transition-all flex items-center justify-center gap-2">
              <Calendar size={20} /> 预约线下体验
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Concept Explanation */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <motion.div 
          className="text-center mb-20"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariants}
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">真正的教育，<br className="md:hidden"/>不应被困在 2D 屏幕里。</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">我们将物理触感、环境视觉感知能力赋予探奇课堂，让孩子的每一次好奇都能得到物理世界的真实反馈。</p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-10"
          variants={staggerContainer}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
        >
          {[
            { icon: Bot, title: "物理触感", desc: "不仅仅是点读和看动画。小布米机器人拥有 21 个高精电机，用真实的肢体动作（挥手、欢呼、跳跃）与孩子进行物理世界的双向交互。", color: "text-blue-600", bg: "bg-blue-100" },
            { icon: Eye, title: "边缘视觉", desc: "搭载 NVIDIA Jetson Orin 边缘算力与 3D 深度相机，实时捕捉孩子的骨骼与动作，毫秒级响应，无需上传云端，极致保护儿童隐私。", color: "text-emerald-600", bg: "bg-emerald-100" },
            { icon: Layers, title: "软硬解耦", desc: "创新的 WebOS 大屏与实体机器人解耦架构，大屏展示知识的广度，机器人提供互动的温度，动静结合，永不冷场。", color: "text-orange-600", bg: "bg-orange-100" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div key={idx} variants={fadeUpVariants} className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${item.bg} ${item.color}`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{item.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* 3. Bento Box Scenarios */}
      <section className="py-24 bg-slate-900 text-white mt-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariants}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">四大颠覆性教学场景</h2>
            <p className="text-xl text-slate-400">将多模态 AI 与机器人技术完美融入日常课堂。</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[700px]"
          >
            {/* 1. TPR */}
            <motion.div variants={fadeUpVariants} className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/tpr/800/400')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity mix-blend-luminosity"></div>
              <div className="relative z-10 h-full flex flex-col justify-end w-full md:w-2/3">
                <div className="bg-blue-500 w-12 h-12 flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-blue-500/30">
                  <SquareActivity size={24} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-3">沉浸式 TPR 语言启蒙</h3>
                <p className="text-slate-300 text-lg">大屏播放场景，机器人同步发音并做手势。孩子跟着做动作，用肢体记忆激发大脑语言中枢。</p>
              </div>
            </motion.div>

            {/* 2. Dance Mirror */}
            <motion.div variants={fadeUpVariants} className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-orange-900 to-slate-900 rounded-3xl p-8 border border-slate-700 relative overflow-hidden group flex flex-col">
               <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/danceik/400/800')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
               <div className="relative z-10 mt-auto">
                <div className="bg-orange-500 w-12 h-12 flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-orange-500/30">
                  <Camera size={24} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-3">镜像伴舞玩伴</h3>
                <p className="text-slate-300 text-lg">逆运动学 (IK) 算法加持，深度相机实时捕获，机器人在物理世界实时复刻孩子的手臂律动。</p>
               </div>
            </motion.div>

            {/* 3. Printer */}
            <motion.div variants={fadeUpVariants} className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="bg-purple-500 w-12 h-12 flex items-center justify-center rounded-xl mb-4 shadow-lg shadow-purple-500/30">
                  <Printer size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">造梦打印机</h3>
                <p className="text-slate-400">大屏生成AIGC画作，机器人随身打印纸质线稿。想象力触手可及。</p>
              </div>
            </motion.div>

            {/* 4. Coach */}
            <motion.div variants={fadeUpVariants} className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-8 border border-slate-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/aicoach/400/400')] bg-cover bg-center opacity-20 mix-blend-screen group-hover:opacity-30 transition-opacity"></div>
              <div className="relative z-10 h-full flex flex-col justify-start">
                <div className="bg-emerald-500 w-12 h-12 flex items-center justify-center rounded-xl mb-4 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">AI 金牌教练</h3>
                <p className="text-slate-300">机器人标准示教，3D 相机实时捕捉姿态，大屏骨骼雷达图红点精准纠偏。</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Company Background & Brand Story */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariants}
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">探奇星球：信任与热爱的源头</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">做客户信任、值得尊敬的教育公司，共同培养未来的创造者。</p>
          </motion.div>

          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-stretch"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {/* Left: Origin & Values */}
            <motion.div variants={fadeUpVariants} className="space-y-6 flex flex-col h-full">
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 relative flex-1">
                <Quote className="absolute top-8 right-8 text-primary/10" size={80} />
                <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-bold text-sm rounded-full mb-6">品牌原点</div>
                <p className="text-2xl font-serif text-slate-800 mb-6 leading-relaxed">
                  “落日山水好，漾舟信归风。<br/>
                  <span className="text-primary font-black">探奇不觉远，因以缘源穷。</span>”
                </p>
                <p className="text-slate-500 text-sm font-medium mb-6">— 唐 · 王维《蓝田山石门精舍》</p>
                <div className="text-slate-600 leading-relaxed">
                  由兴趣引发的学习就像是一场有兴致的旅游。在好奇心的驱使下，每一次成绩都是路上的美景。过程不觉辛苦，终能到达梦想地。
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2rem]">
                   <Flag className="text-blue-500 mb-4" size={32}/>
                   <div className="font-bold text-slate-900 text-lg mb-2">企业使命</div>
                   <div className="text-slate-600 leading-snug">让世界充满<br/>更多会玩又有创造力的人</div>
                 </div>
                 <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem]">
                   <Heart className="text-orange-500 mb-4" size={32}/>
                   <div className="font-bold text-slate-900 text-lg mb-2">价值观</div>
                   <div className="text-slate-600 leading-snug">简单、诚信、勤奋、坚韧、合作</div>
                 </div>
              </div>
            </motion.div>

            {/* Right: Academic & Practical Backing */}
            <motion.div variants={fadeUpVariants} className="flex flex-col gap-6 h-full">
               <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex-1">
                  <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary/20 blur-[80px] pointer-events-none" />
                  <ShieldCheck size={48} className="text-emerald-400 mb-8" />
                  <h3 className="text-3xl font-black mb-6 tracking-tight">顶级学术与实践背书</h3>
                  <p className="text-slate-300 leading-relaxed text-lg mb-8">
                    由<span className="text-white font-bold mx-1">中科院、北师大</span>专家团队主导，引进基于美国麻省理工 PAPERT 博士的<span className="text-white font-bold mx-1">建构主义理论 STEAM 课程</span>。将幼儿教育建立在坚实的科学与技术前沿基础之上。
                  </p>
                  <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex gap-4 items-start">
                    <Target className="text-yellow-400 shrink-0 mt-1" size={24} />
                    <div>
                      <span className="font-bold text-white text-lg block mb-1">权威园所实践</span>
                      <span className="text-slate-300 leading-snug block">课程已在北京众多一级一类重点幼儿园实践，并与<span className="text-white font-bold">北京航天机关幼儿园</span>联合出版园本教材。</span>
                    </div>
                  </div>
               </div>

               <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex items-center gap-6">
                  <div className="w-20 h-20 bg-emerald-200/50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-300 shadow-inner">
                     <span className="text-4xl filter drop-shadow-md">🦖</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">专属玩伴：小探宝</h4>
                    <p className="text-slate-600 leading-relaxed">探奇星球是真实世界的缩印版。活泼聪明的小探宝将陪伴孩子们，全面提升专注力与创造能力。</p>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. Comparison */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <motion.div 
          className="text-center mb-16"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariants}
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">不仅仅是升级，而是维度的跃迁</h2>
        </motion.div>

        <motion.div 
          className="flex flex-col lg:flex-row gap-8 items-stretch"
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
           {/* Traditional */}
           <motion.div variants={fadeUpVariants} className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-10 shadow-lg">
             <div className="text-slate-400 font-bold text-xl mb-8 border-b border-slate-100 pb-4">传统互动课堂</div>
             <ul className="space-y-8">
               <li className="flex gap-4 items-start">
                 <CircleX className="text-red-500 shrink-0 mt-1" />
                 <div><span className="font-bold text-slate-800 block mb-1">低头看屏交互</span>容易伤眼分心，局限于2D平面的被动接收。</div>
               </li>
               <li className="flex gap-4 items-start">
                 <CircleX className="text-red-500 shrink-0 mt-1" />
                 <div><span className="font-bold text-slate-800 block mb-1">“伪AI”逻辑</span>只能做到选项判断、点选读评，无法感知孩子的真实行为。</div>
               </li>
               <li className="flex gap-4 items-start">
                 <CircleX className="text-red-500 shrink-0 mt-1" />
                 <div><span className="font-bold text-slate-800 block mb-1">高度依赖名师</span>需要教师具备极强的肢体表现力才能活跃气氛，复制难度大。</div>
               </li>
             </ul>
           </motion.div>

           {/* Embodied */}
           <motion.div  variants={fadeUpVariants} className="flex-1 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-[2rem] p-10 shadow-xl relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none" />
             <div className="text-primary font-black text-2xl mb-8 border-b border-primary/10 pb-4 flex items-center gap-3">
                <Sparkles size={28} />
                探奇具身智能课堂
             </div>
             <ul className="space-y-8 relative z-10">
               <li className="flex gap-4 items-start">
                 <CircleCheck className="text-emerald-500 shrink-0 mt-1" strokeWidth={3} />
                 <div><span className="font-bold text-slate-900 block mb-1 text-lg">抬头真实交互</span>离开屏幕限制，与物理空间的机器人自然交流，保护视力。</div>
               </li>
               <li className="flex gap-4 items-start">
                 <CircleCheck className="text-emerald-500 shrink-0 mt-1" strokeWidth={3} />
                 <div><span className="font-bold text-slate-900 block mb-1 text-lg">“感知型”真AI</span>能看懂孩子的物理动作，并立即给出物理反馈与情绪价值（如伸开双臂拥抱）。</div>
               </li>
               <li className="flex gap-4 items-start">
                 <CircleCheck className="text-emerald-500 shrink-0 mt-1" strokeWidth={3} />
                 <div><span className="font-bold text-slate-900 block mb-1 text-lg">标准化大师级表现</span>系统一键触发机器人的情感级生动表现，完美赋能每一个新手老师。</div>
               </li>
             </ul>
           </motion.div>
        </motion.div>
      </section>

      {/* 6. Courseware System Routing */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full text-center">
         <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-2xl border border-slate-100"
         >
            <motion.h2 variants={fadeUpVariants} className="text-3xl md:text-5xl font-black mb-6">接轨未来的实体课程体系</motion.h2>
            <motion.p variants={fadeUpVariants} className="text-xl text-slate-500 mb-16 max-w-2xl mx-auto">整合 STEAM 实体建构软硬件教具，从实物拼搭到智能控制，阶梯式培养下一代硬核创造者。</motion.p>
            
            <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
               {[
                 { icon: Box, name: "小建筑师", level: "小班", color: "text-blue-500 bg-blue-50" },
                 { icon: Cpu, name: "百变工程", level: "中班", color: "text-emerald-500 bg-emerald-50" },
                 { icon: Sparkles, name: "小发明家", level: "大班", color: "text-orange-500 bg-orange-50" },
                 { icon: Rocket, name: "创意空间", level: "学前班", color: "text-purple-500 bg-purple-50" }
               ].map((item, i) => {
                 const Icon = item.icon;
                 return (
                   <motion.div key={i} variants={fadeUpVariants} className="flex flex-col items-center">
                     <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${item.color}`}>
                       <Icon size={32} />
                     </div>
                     <h4 className="font-bold text-slate-900 text-lg">{item.name}</h4>
                     <p className="text-slate-400 font-semibold text-sm">{item.level}</p>
                   </motion.div>
                 )
               })}
            </motion.div>

            <motion.div variants={fadeUpVariants}>
               <Link to="/products" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-xl hover:bg-primary transition-colors duration-300 shadow-xl">
                 探索全系探奇产品 <ChevronRight size={24} />
               </Link>
            </motion.div>
         </motion.div>
      </section>

    </div>
  );
}
