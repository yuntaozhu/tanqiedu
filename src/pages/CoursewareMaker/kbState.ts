export type KbCategory = 'pedagogy' | 'hardware' | 'interaction' | 'voice' | 'other';

export interface KbItem {
  id: string;
  title: string;
  content: string;
  category: KbCategory;
  tags: string[];
  lastUpdated: string;
  enabled: boolean;
  isPreset?: boolean;
}

export const KB_PRESETS: KbItem[] = [
  {
    id: 'p-1',
    title: '蒙台梭利感官匹配法 (Montessori Sensory Integration)',
    category: 'pedagogy',
    tags: ['建构主义', '感官训练', '错误自我修正'],
    enabled: true,
    isPreset: true,
    lastUpdated: '2026-06-11',
    content: '皮亚杰与蒙台梭利提倡通过实体操作培养幼儿的心智。具身游戏应符合以下原则：\n1. 孤立单一属性刺激：仅进行红黄蓝三原色的视觉分类配对，排斥多余干扰；\n2. 错误自纠机制：当木塞放入不相配卡孔时触发温柔语音音色包，引导幼儿重新比对观察；\n3. 具身探索闭环：完成清点后有明确动作奖励（彩带、夸张语音），固化操作记忆。'
  },
  {
    id: 'p-2',
    title: '探奇 21-自由度智能教具底座感应协议',
    category: 'hardware',
    tags: ['物理引脚', '边缘感知', '低功耗感应'],
    enabled: true,
    isPreset: true,
    lastUpdated: '2026-06-11',
    content: '硬件设备包含 9x9 感应点和 RGB 配对滑轨：\n1. 定位传感：底纸需与插孔呈 100% 同轴切齐，通过三个物理定位微调按钮进行初始化；\n2. 阻抗探测：检测红黄蓝棋子插入对应插孔物理连接的微小电极偏置，返回 AD 模拟量数据；\n3. HMR 软件对接：动态 Canvas 代码需要侦听底层 \`device_state\` 广播，并提供百分比(%)视口缩放判定点以防适配溢出。'
  },
  {
    id: 'p-3',
    title: 'Dr. Zhang 启发式人声对白语调库',
    category: 'voice',
    tags: ['语音伴读', '张博士', '正面鼓励'],
    enabled: false,
    isPreset: true,
    lastUpdated: '2026-06-05',
    content: '交互音轨伴读设计脚本：\n1. 激励肯定：“哇，你做到了！红色的木块稳稳地坐进了轨道，太空舱大门要打开咯！”\n2. 温和微调：“呀，这个格子的颜色好像跟木块不一样，仔细瞧瞧它上面的提示，我们再试一次吧！”\n3. 清点语调：“备备包里的好东西都被你召唤出来啦！准备就绪，开启神奇的时空站挑战！”'
  },
  {
    id: 'p-4',
    title: 'STEAM 探究式机械连觉融合设计指导',
    category: 'interaction',
    tags: ['声画同步', '多模态反馈', '顺连暴击'],
    enabled: false,
    isPreset: true,
    lastUpdated: '2026-05-20',
    content: '基于 STEAM 教学标准：\n1. 增加颜色-声音多模态映射：消除红色对应宫调（高昂），黄色对应商调（清脆），蓝色对应羽调（辽阔）；\n2. 引入渐进式消除：支持多阶段渐进反馈，记录孩子的连续配对速度（连消积分）；\n3. 物理触觉与声画融合：利用 canvas 波纹体现扩散消除感，配合物理振颤伴读强化成就感。'
  }
];
