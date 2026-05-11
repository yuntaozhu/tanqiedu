import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Cpu, Sparkles, Rocket, Globe, Lightbulb, Users, Trophy, PlayCircle, ShieldCheck, CheckCircle2, MonitorPlay, Languages } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { CourseIllustration } from '../components/CourseIllustration';

function BlobImage({ baseName, alt, className }: { baseName: string, alt: string, className?: string }) {
  const exts = ['.png', '.jpeg', '.jpg', '.PNG', '.JPEG', '.JPG'];
  const [attempt, setAttempt] = useState(0);

  if (attempt >= exts.length) {
    return <div className={twMerge("bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-sm", className)}>图片加载中 / Loading...</div>;
  }

  const url = `https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/${baseName}${exts[attempt]}`;

  return (
    <img 
      src={url} 
      alt={alt} 
      className={className} 
      onError={() => setAttempt(a => a + 1)}
    />
  );
}

const courseLevels = [
  {
    id: 'l1',
    name: { zh: '小建筑师', en: 'LITTLE ARCHITECT' },
    subtitle: { zh: '标准版（第2册）', en: 'LEVEL 1 (BOX 2)' },
    icon: Box,
    desc: { 
      zh: '从基础积木零件认识开始，逐步学习两块甚至多块积木的连接与固定，掌握复杂双锁、互锁等搭建技巧，接触并学习录音播放模块，培养幼儿耐心、信心及基础规则意识。', 
      en: 'Introduction to foundational blocks and complex double/interlocking techniques. Cultivates patience, confidence, and rule comprehension. Helps young learners understand the world of construction and mechanisms.' 
    },
    components: { zh: '录音播放模块', en: 'Voice Playback Module' },
    mechanics: { zh: '基础结构、双锁互锁', en: 'Basic structure, Interlocking' },
    projects: [
      { zh: '小乌龟', en: 'Little Turtle', imgIndex: 62 }, { zh: '看台', en: 'Grandstand', imgIndex: 63 }, { zh: '小桥', en: 'Tiny Bridge', imgIndex: 64 }, { zh: '鱼', en: 'Fish', imgIndex: 65 },
      { zh: '金字塔', en: 'Pyramid', imgIndex: 66 }, { zh: '狮身人面像', en: 'Sphinx', imgIndex: 67 }, { zh: '神秘宝箱', en: 'Treasure Box', imgIndex: 68 }, { zh: '骆驼', en: 'Camel', imgIndex: 69 },
      { zh: '天鹅', en: 'Swan', imgIndex: 70 }, { zh: '小刺猬', en: 'Hedgehog', imgIndex: 71 }, { zh: '老虎拔牙', en: 'Tiger Pulling', imgIndex: 72 }, { zh: '大树', en: 'Tree', imgIndex: 73 },
      { zh: '火箭', en: 'Rocket', imgIndex: 74 }, { zh: '花朵', en: 'Flower', imgIndex: 75 }, { zh: '奖杯', en: 'Trophy', imgIndex: 76 }, { zh: '兔子', en: 'Rabbit', imgIndex: 77 },
      { zh: '小提篮', en: 'Basket', imgIndex: 78 }, { zh: '抽屉', en: 'Drawer', imgIndex: 79 }, { zh: '乌篷船', en: 'Awning Boat', imgIndex: 80 }, { zh: '风扇', en: 'Fan', imgIndex: 81 }
    ],
    color: 'bg-rose-500',
    hoverColor: 'hover:bg-rose-50',
    ringColor: 'ring-rose-200',
    textColor: 'text-rose-600',
    image: 'image11',
    syllabusImg: 'image16',
  },
  {
    id: 'l2',
    name: { zh: '百变工程', en: 'TRANSFORM ENGINEERING' },
    subtitle: { zh: '标准版（第4册）', en: 'LEVEL 2 (BOX 4)' },
    icon: Cpu,
    desc: { 
      zh: '引入灵犀智能马达，锻炼小肌肉的精细动作及双手协调，熟练使用螺丝刀完成拆卸和固定。通过分享与团队合作完成场景搭建，掌握马达传感器的三种操作模式。', 
      en: 'Dive into mechanics with gear transmissions and acceleration/deceleration structures. Encourages teamwork, hands-on assembly, and fine motor skills by completing dynamic engineering scenarios.' 
    },
    components: { zh: '灵犀智能马达（3种操作）', en: 'Lingxi Smart Motor (3 Modes)' },
    mechanics: { zh: '各种传动、结构拆解传感', en: 'Gears, Transmission, Wheels' },
    projects: [
      { zh: '人形机器人', en: 'Humanoid', imgIndex: 82 }, { zh: '蛇形机器人', en: 'Snake Bot', imgIndex: 83 }, { zh: '海底探测器', en: 'Sub Explorer', imgIndex: 84 }, { zh: '瓦力机器人', en: 'Wall-E Bot', imgIndex: 85 },
      { zh: '消防车', en: 'Firetruck', imgIndex: 86 }, { zh: '装甲车', en: 'Armored Car', imgIndex: 87 }, { zh: '移动风车', en: 'Mobile Windmill', imgIndex: 88 }, { zh: '沙漠越野车', en: 'Desert Rover', imgIndex: 89 },
      { zh: '直升飞机', en: 'Helicopter', imgIndex: 90 }, { zh: '潜水艇', en: 'Submarine', imgIndex: 91 }, { zh: '海盗船', en: 'Pirate Ship', imgIndex: 92 }, { zh: '热气球', en: 'Hot Air Balloon', imgIndex: 93 },
      { zh: '挖掘机', en: 'Excavator', imgIndex: 94 }, { zh: '卡车', en: 'Truck', imgIndex: 95 }, { zh: '压路机', en: 'Road Roller', imgIndex: 96 }, { zh: '雷达探测车', en: 'Radar Vehicle', imgIndex: 97 },
      { zh: '钻孔机', en: 'Drilling Machine', imgIndex: 98 }, { zh: '移动监控', en: 'Mobile Monitor', imgIndex: 99 }, { zh: '显微镜', en: 'Microscope', imgIndex: 100 }, { zh: '狙击枪', en: 'Sniper Rifle', imgIndex: 101 }
    ],
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-50',
    ringColor: 'ring-amber-200',
    textColor: 'text-amber-600',
    image: 'image12',
    syllabusImg: 'image17',
  },
  {
    id: 'l3',
    name: { zh: '小发明家', en: 'LITTLE INVENTOR' },
    subtitle: { zh: '标准版（第6册）', en: 'LEVEL 3 (BOX 6)' },
    icon: Lightbulb,
    desc: { 
      zh: '初步学习并在多场景运用齿轮传动、加速/减速传动机构。通过图灵编程板为作品注入“灵魂与大脑”，让静止作品动起来。鼓励大胆探索复杂结构，不怕失败。', 
      en: 'Injecting "soul" and "brain" into static creations. Kids learn active problem-solving through introductory programming, gaining the courage to explore and innovate without fear of failure.' 
    },
    components: { zh: '图灵编程板、灵犀马达', en: 'Turing Board, Lingxi Motor' },
    mechanics: { zh: '编程启蒙、逻辑思维', en: 'Logic, Programming Intro' },
    projects: [
      { zh: '踢球', en: 'Kicking Game', imgIndex: 102 }, { zh: '趣味三轮车', en: 'Tricycle', imgIndex: 103 }, { zh: '神奇飞椅', en: 'Flying Chair', imgIndex: 104 }, { zh: '脚踏船', en: 'Pedal Boat', imgIndex: 105 },
      { zh: '道闸', en: 'Toll Gate', imgIndex: 106 }, { zh: '智能牙科椅', en: 'Dental Chair', imgIndex: 107 }, { zh: '潜水艇', en: 'Submarine II', imgIndex: 108 }, { zh: '果酱机器人', en: 'Jam Robot', imgIndex: 109 },
      { zh: '抽油机', en: 'Oil Pump', imgIndex: 110 }, { zh: '压路机', en: 'Roller II', imgIndex: 111 }, { zh: '防空火炮', en: 'AA Gun', imgIndex: 112 }, { zh: '千斤顶', en: 'Jack', imgIndex: 113 },
      { zh: '自动雨刷器', en: 'Wiper', imgIndex: 114 }, { zh: '摆动的鱼', en: 'Swinging Fish', imgIndex: 115 }, { zh: '布谷钟', en: 'Cuckoo Clock', imgIndex: 116 }, { zh: '机械抓手', en: 'Mechanical Claw', imgIndex: 117 },
      { zh: '吊桥', en: 'Drawbridge', imgIndex: 118 }, { zh: '跳舞机器人', en: 'Dancing Robot', imgIndex: 119 }, { zh: '烧烤架', en: 'BBQ Grill', imgIndex: 120 }, { zh: '玉兔捣药', en: 'Jade Rabbit', imgIndex: 121 }
    ],
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-50',
    ringColor: 'ring-emerald-200',
    textColor: 'text-emerald-600',
    image: 'image13',
    syllabusImg: 'image18',
  },
  {
    id: 'l4',
    name: { zh: '创意空间', en: 'CREATIVE SPACE' },
    subtitle: { zh: '标准版（第8册）', en: 'LEVEL 4 (BOX 8)' },
    icon: Rocket,
    desc: { 
      zh: '高阶进阶课程，使用遥控马达及多种复杂多连杆、齿轮传动结构。挑战双遥控马达的操控协作。引导孩子主动参与机器人竞赛和构建创意作品。', 
      en: 'Advanced robotics utilizing dual remote controls. Focuses on spatial thinking, complex linkages, and competitive engineering. Empowers kids to share works and bravely conquer sophisticated mechanical structures.' 
    },
    components: { zh: '双电机马达、编程遥控手柄', en: 'Dual Remote Motors, Pad' },
    mechanics: { zh: '遥控操纵、双电机协作', en: 'Remote Control, Dual Motors' },
    projects: [
      { zh: '机械木鱼', en: 'Mech Wooden Fish', imgIndex: 122 }, { zh: '除草机', en: 'Lawn Mower', imgIndex: 123 }, { zh: '雷达探测车', en: 'Radar Rover', imgIndex: 124 }, { zh: '打蛋机', en: 'Beater', imgIndex: 125 },
      { zh: '收割机', en: 'Harvester', imgIndex: 126 }, { zh: '机械狗', en: 'Mech Dog', imgIndex: 127 }, { zh: '宠物投喂器', en: 'Pet Feeder', imgIndex: 128 }, { zh: '跳舞的小鸟', en: 'Dancing Bird', imgIndex: 129 },
      { zh: '击球游戏', en: 'Batting Game', imgIndex: 130 }, { zh: '打鼓机器人', en: 'Drumming Robot', imgIndex: 131 }, { zh: '太空漫步机', en: 'Space Walker', imgIndex: 132 }, { zh: '划船小人', en: 'Rowing Robot', imgIndex: 133 },
      { zh: '变速风扇', en: 'Speed Fan', imgIndex: 134 }, { zh: '时钟', en: 'Clock', imgIndex: 135 }, { zh: '巡逻机器人', en: 'Patrol Robot', imgIndex: 136 }, { zh: '清扫车', en: 'Sweeper', imgIndex: 137 },
      { zh: '擦玻璃机器人', en: 'Glass Cleaner', imgIndex: 138 }, { zh: '扫地车', en: 'Sweeping Mower', imgIndex: 139 }, { zh: '洗衣机', en: 'Washing Machine', imgIndex: 140 }, { zh: '平板支架', en: 'Tablet Stand', imgIndex: 141 }
    ],
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-50',
    ringColor: 'ring-blue-200',
    textColor: 'text-blue-600',
    image: 'image14',
    syllabusImg: 'image19',
  }
];

const benefits = [
  { icon: Globe, text: { zh: "提升幼儿专注力", en: "ENHANCES FOCUS" } },
  { icon: Lightbulb, text: { zh: "培养创造力", en: "CULTIVATES CREATIVITY" } },
  { icon: Cpu, text: { zh: "学习物理力学", en: "PHYSICS & MECHANICS" } },
  { icon: Sparkles, text: { zh: "锻炼解决问题", en: "PROBLEM SOLVING" } },
  { icon: Users, text: { zh: "表达与自信心", en: "EXPRESSION & CONFIDENCE" } },
  { icon: Trophy, text: { zh: "为未来打下基础", en: "FUTURE FOUNDATION" } },
];

export default function Products() {
  const [activeTab, setActiveTab] = useState(courseLevels[0].id);
  const [activeProjectIdx, setActiveProjectIdx] = useState<number | null>(null);
  const [isEnglish, setIsEnglish] = useState(false);

  const activeProduct = courseLevels.find(p => p.id === activeTab);

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-12 pb-24 font-sans relative">
      <button 
        onClick={() => setIsEnglish(!isEnglish)} 
        className="fixed bottom-8 right-8 z-50 bg-white shadow-xl hover:shadow-2xl transition-all w-16 h-16 rounded-full flex flex-col items-center justify-center border border-slate-100 text-slate-700 hover:text-primary active:scale-95 group"
      >
        <Languages size={24} className="mb-1 group-hover:-translate-y-0.5 transition-transform" />
        <span className="text-[11px] font-black tracking-widest uppercase">{isEnglish ? '中文' : 'EN'}</span>
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header / About Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 rounded-[2rem] overflow-hidden shadow-2xl relative shadow-slate-200 w-full bg-white"
          >
             <BlobImage baseName="image1" alt="探奇星球标准版单盒机器人课程" className="w-full h-auto object-contain" />
          </motion.div>
        
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-6 text-sm font-bold tracking-wide"
          >
            <Sparkles size={16} />
            <span className={clsx(isEnglish && 'uppercase')}>{isEnglish ? 'Proven in Top Kindergartens' : '北京探奇星球体系，幼儿园实战见证'}</span>
          </motion.div>
          <h1 className={twMerge(clsx(
              "md:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight",
              isEnglish ? "text-5xl uppercase" : "text-4xl"
          ))}>
            {isEnglish ? (
              <>Empowering the world with <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">creative minds.</span></>
            ) : (
              <>让世界充满更多 <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">会玩又有创造力</span> 的人</>
            )}
          </h1>
          <p className={twMerge(clsx("text-lg md:text-xl text-slate-600 leading-relaxed mb-6 font-medium text-left md:text-center", isEnglish && "text-xl"))}>
            {isEnglish ? "Led by experts from the Chinese Academy of Sciences and Beijing Normal University, Tanqi Planet introduces Dr. Papert's (MIT) constructivist STEAM framework. Widely adopted by top-tier kindergartens in Beijing, significantly boosting creativity, logic, focus, and observation skills in early childhood education." : "由中科院、北师大专家团队主导，引进基于美国麻省理工 PAPERT 博士建构主义理论的 STEAM 课程。在北京多所重点幼儿园实践（并与北京航天机关幼儿园联合出版），对提升学前教育阶段儿童的创造力、逻辑思维和专注力有显著提升，广受园长及家长好评。"}
          </p>
        </div>

        {/* Benefits Strip */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.text.en}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-slate-100"
            >
              <benefit.icon className="text-primary shrink-0" size={20} />
              <span className={clsx("font-bold text-slate-700 whitespace-nowrap", isEnglish && "uppercase tracking-wide text-sm")}>
                {isEnglish ? benefit.text.en : benefit.text.zh}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-10 w-full flex flex-col items-center">
            <h2 className={clsx("font-black text-slate-900 mb-4 tracking-tight", isEnglish ? "text-4xl uppercase" : "text-3xl")}>
              {isEnglish ? 'Core Curriculum System' : '核心学期课程体系'}
            </h2>
            <div className="w-16 h-1.5 bg-primary rounded-full mb-4"></div>
        </div>

        {/* Course Details Split */}
        <div className="flex flex-col xl:flex-row gap-12 bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 mb-20 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
           
           {/* Navigation */}
           <div className="w-full xl:w-1/3 flex flex-col gap-3 relative z-10 shrink-0">
              <h3 className="text-sm font-bold text-slate-400 tracking-widest mb-2 px-4 uppercase">
                {isEnglish ? 'FOUR STAGES' : '四大年龄段 / 上下学期'}
              </h3>
              {courseLevels.map((prod) => {
                const Icon = prod.icon;
                const isActive = activeTab === prod.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setActiveTab(prod.id);
                      setActiveProjectIdx(null); // reset project selection on tab switch
                    }}
                    className={twMerge(clsx(
                      "flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 relative border-2 border-transparent w-full",
                      isActive ? `bg-white shadow-md ${prod.ringColor} border-slate-100 scale-100` : `hover:bg-slate-50 text-slate-500 hover:text-slate-900 border-transparent scale-[0.98]`
                    ))}
                  >
                    <span className={twMerge(clsx(
                      "relative z-10 flex items-center justify-center w-14 h-14 rounded-xl shadow-sm transition-colors shrink-0",
                      isActive ? prod.color + ' text-white' : 'bg-slate-100 text-slate-500'
                    ))}>
                      <Icon size={24} />
                    </span>
                    <div className="relative z-10 flex-1 min-w-0">
                      <h4 className={clsx("font-black truncate", isActive ? 'text-slate-900 mx-auto text-xl' : 'text-slate-600 text-lg', isEnglish && 'uppercase tracking-wide')}>
                        {isEnglish ? prod.name.en : prod.name.zh}
                      </h4>
                      <p className="text-sm font-medium text-slate-400 mt-0.5 truncate uppercase tracking-widest">
                        {isEnglish ? prod.subtitle.en : prod.subtitle.zh}
                      </p>
                    </div>
                  </button>
                );
              })}
           </div>

           {/* Content Display */}
           <div className="w-full xl:w-2/3 flex flex-col relative z-10 min-w-0">
              <AnimatePresence mode="wait">
                {activeProduct && (
                  <motion.div
                    key={activeProduct.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col"
                  >
                    {/* Image Area */}
                    <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-3xl overflow-hidden mb-8 shadow-inner bg-slate-50 group shrink-0">
                      <CourseIllustration 
                        id={activeProduct.id}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className={`inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-sm font-bold tracking-wide mb-3 shadow-sm uppercase`}>
                          {isEnglish ? '20 BLOCKS LESSONS + 16 SPATIAL LESSONS' : '20节 积木建构课 + 16节 空间思维课'}
                        </div>
                        <h2 className={clsx("font-black", isEnglish ? 'text-4xl md:text-5xl tracking-tight uppercase' : 'text-3xl md:text-4xl')}>
                          {isEnglish ? activeProduct.name.en : activeProduct.name.zh}
                        </h2>
                      </div>
                    </div>
                    
                    {/* Info Text */}
                    <p className={clsx("text-slate-600 leading-relaxed mb-8 font-medium", isEnglish ? 'text-lg md:text-xl' : 'text-base md:text-lg')}>
                      {isEnglish ? activeProduct.desc.en : activeProduct.desc.zh}
                    </p>
                    
                    {/* Specs Grid */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-10 shrink-0">
                      <div className={`rounded-2xl p-5 border border-slate-100 ${activeProduct.hoverColor} transition-colors bg-white/50 backdrop-blur-sm`}>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          {isEnglish ? 'Core Component' : '主打能力模块'}
                        </h4>
                        <p className={`font-black text-base md:text-lg ${activeProduct.textColor} leading-snug mt-1 uppercase`}>
                          {isEnglish ? activeProduct.components.en : activeProduct.components.zh}
                        </p>
                      </div>
                      <div className={`rounded-2xl p-5 border border-slate-100 ${activeProduct.hoverColor} transition-colors bg-white/50 backdrop-blur-sm`}>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                           {isEnglish ? 'Mechanics Focus' : '核心认知方向'}
                        </h4>
                        <p className={`font-black text-base md:text-lg text-slate-800 leading-snug mt-1 uppercase`}>
                           {isEnglish ? activeProduct.mechanics.en : activeProduct.mechanics.zh}
                        </p>
                      </div>
                    </div>

                    {/* Example Projects */}
                    <div className="pt-8 border-t border-slate-200 mt-auto">
                      <h4 className={clsx("font-black text-slate-900 mb-6 flex items-center gap-2", isEnglish ? 'text-lg uppercase tracking-wide' : 'text-base')}>
                        <PlayCircle size={20} className="text-slate-400"/> 
                        {isEnglish ? `PROJECT SHOWCASE (${activeProduct.projects.length})` : `包含的精彩构建关卡 (${activeProduct.projects.length})`}
                        <span className="text-slate-400 font-medium text-sm ml-2 hidden xl:inline uppercase">
                          {isEnglish ? '(Click to view)' : '(点击名称查看)'}
                        </span>
                      </h4>
                      <div className="flex flex-wrap gap-2.5 text-sm justify-start">
                        {activeProduct.projects.map((proj, idx) => (
                          <button 
                            key={proj.zh} 
                            onClick={() => setActiveProjectIdx(idx)}
                            className={twMerge(clsx(
                              "px-3 py-2 rounded-xl font-bold shadow-sm transition-all border outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 text-left flex flex-col gap-0.5",
                              activeProjectIdx === idx 
                                ? "bg-primary text-white border-primary transform scale-105" 
                                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-primary/50"
                            ))}
                          >
                            <span className={clsx(isEnglish ? 'uppercase tracking-wide text-[13px] leading-tight mb-1' : 'text-[15px]')}>{isEnglish ? proj.en : proj.zh}</span>
                            <span className={twMerge(clsx(
                                activeProjectIdx === idx ? 'text-white/80' : 'text-slate-400',
                                "text-[10px] uppercase font-bold tracking-widest leading-none pt-0.5 border-t border-current/20 inline-block"
                            ))}>
                                {isEnglish ? proj.zh : proj.en}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Display Selected Image or Placeholder */}
                    <div className="mt-8 rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-slate-50 p-5">
                       <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-2">
                          <MonitorPlay size={16} /> 
                          {activeProjectIdx !== null 
                            ? (isEnglish ? `VIEWING: ${activeProduct.projects[activeProjectIdx].en} (${activeProduct.projects[activeProjectIdx].zh})` : `展示：${activeProduct.projects[activeProjectIdx].zh} (${activeProduct.projects[activeProjectIdx].en})`)
                            : (isEnglish ? `SELECT A PROJECT ABOVE` : `选择上方关卡查看图片`)}
                       </h4>
                       <AnimatePresence mode="wait">
                          <motion.div
                            key={activeProjectIdx !== null ? activeProjectIdx : 'empty'}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl p-2 w-full aspect-video flex items-center justify-center border border-slate-100 overflow-hidden"
                          >
                            {activeProjectIdx !== null ? (
                               <BlobImage 
                                 baseName={`image${activeProduct.projects[activeProjectIdx].imgIndex}`}
                                 alt={activeProduct.projects[activeProjectIdx].zh}
                                 className="w-full h-full object-contain mix-blend-multiply"
                               />
                            ) : (
                               <div className="text-slate-300 flex flex-col items-center gap-3 py-12">
                                  <Box size={48} strokeWidth={1.5} />
                                  <span className="text-sm font-bold uppercase tracking-widest">Preview Area</span>
                               </div>
                            )}
                          </motion.div>
                       </AnimatePresence>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Global Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all h-full">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                 <MonitorPlay size={26} strokeWidth={2.5}/>
              </div>
              <h3 className={clsx("font-black text-slate-900 mb-3", isEnglish && 'uppercase tracking-wide text-lg')}>
                {isEnglish ? 'Interactive Classes' : '一键双师课堂'}
              </h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                {isEnglish 
                  ? 'Includes animated e-lesson plans and exhaustive structural breakdown videos ensuring teachers can prepare easily.' 
                  : '提供动画课件、电子详尽教案。每节课附加示范视频，教师轻松备课，还原高品质教学。'
                }
              </p>
           </div>
           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all h-full">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                 <CheckCircle2 size={26} strokeWidth={2.5}/>
              </div>
              <h3 className={clsx("font-black text-slate-900 mb-3", isEnglish && 'uppercase tracking-wide text-lg')}>
                 {isEnglish ? '100+ Pieces Per Box' : '每盒足量100件'}
              </h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                 {isEnglish
                   ? 'Continuously updated curriculum ensuring robust hands-on practice (50-60 min/class), tailored for early childhood education.'
                   : '教具零件充沛，上课时长50-60分钟设计，匹配学前教育生理节奏，让课程更新毫无负担。'
                 }
              </p>
           </div>
           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all h-full">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                 <Lightbulb size={26} strokeWidth={2.5}/>
              </div>
              <h3 className={clsx("font-black text-slate-900 mb-3", isEnglish && 'uppercase tracking-wide text-lg')}>
                 {isEnglish ? 'Dual Curriculum' : '双料课程并行'}
              </h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                 {isEnglish
                   ? 'Each semester integrates 20 building lessons with 16 spatial thinking logic courses to elevate multidimensional skills.'
                   : '每学期包含 20 节积木建构课，同时穿插 16 节空间思维课，多维度提升能力。'
                 }
              </p>
           </div>
           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all h-full">
              <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                 <ShieldCheck size={26} strokeWidth={2.5}/>
              </div>
              <h3 className={clsx("font-black text-slate-900 mb-3", isEnglish && 'uppercase tracking-wide text-lg')}>
                 {isEnglish ? 'Awards & Certificates' : '认证与荣誉评定'}
              </h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                 {isEnglish
                   ? 'Integrates competitive activity cards to challenge kids, validating their progress with exclusive honorable certificates.'
                   : '提供专属荣誉证书与“期末活动竞赛卡”，引导完成挑战赛事，获取专属证明认证与奖励，深受信赖。'
                 }
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
