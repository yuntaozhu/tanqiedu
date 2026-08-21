/** 飞机发射器课件 — 资源文件名与脚本完全一致 */

export const PLANE_BLOB =
  'https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/planecourse';

export const PLANE_ROBOT: Record<number, string> = {
  1: 'swing',
  2: 'shake',
  3: 'cheer',
  11: 'dance',
  13: 'standtofall',
  14: 'dance1',
  15: 'dance2',
};

export type PlaneMedia = { file: string; url: string; proxyUrl: string; loops: number; kind: 'image' | 'video' | 'audio' };

export function parsePlaneMedia(tag: string): PlaneMedia {
  const raw = tag.replace(/^@/, '');
  const star = raw.lastIndexOf('*');
  let file = raw;
  let loops = 1;
  if (star > 0 && /^\d+$/.test(raw.slice(star + 1))) {
    file = raw.slice(0, star);
    loops = Number(raw.slice(star + 1));
  }
  const ext = file.split('.').pop()?.toLowerCase() || '';
  const kind = ext === 'mp4' ? 'video' : ext === 'mp3' ? 'audio' : 'image';
  const encoded = encodeURIComponent(file);
  return {
    file,
    loops,
    kind,
    url: `${PLANE_BLOB}/${encoded}`,
    proxyUrl: `/planecourse-media/${encoded}`,
  };
}

export type PlaneNode = {
  id: number;
  type: string;
  phase: string;
  title: string;
  tts?: string;
  media?: string[];
  robotAction?: number;
  wait: number;
  originalTag?: string;
  quiz?: { options: string[]; answer: number };
};

export const PLANE_NODES: PlaneNode[] = [
  { id: 1, type: 'speech', phase: '开场导入', title: '挥手问好', tts: '小朋友们大家好，今天又到了机器人课程的时间了。今天我们要搭什么作品呢？让我们一起来看一看吧！', robotAction: 1, wait: 0 },
  { id: 2, type: 'media_speech', phase: '导入认知', title: '认识纸飞机', media: ['@纸飞机图.png'], tts: '小朋友们，你们玩过这个玩具吗？', wait: 2 },
  { id: 3, type: 'media_speech', phase: '导入认知', title: '飞得更远', media: ['@纸飞机图.png'], tts: '没错，是纸飞机。小朋友们，你们知道怎么让纸飞机飞得更远吗？', wait: 5 },
  { id: 4, type: 'media_speech', phase: '主题揭示', title: '今天搭发射器', media: ['@发射器图.png'], tts: '那我们今天就来搭建一个飞机发射器，看一看哪个小朋友的飞机飞得最远。', robotAction: 3, wait: 0 },
  { id: 5, type: 'media_speech', phase: '观察提问', title: '由几部分组成', media: ['@发射器图.png'], tts: '小朋友，请你们观察一下发射器是由几部分组成的呢？', wait: 5 },
  { id: 6, type: 'media_speech', phase: '结构讲解', title: '支架和发射装置', media: ['@分部图.png'], tts: '发射器分为支架和发射装置两个部分。', wait: 0 },
  { id: 7, type: 'media_speech', phase: '观察确认', title: '看清楚了吗', media: ['@分部图.png'], tts: '小朋友们，你们清楚发射器的各部分了吗？', wait: 5 },
  { id: 8, type: 'speech', phase: '课堂常规', title: '坐好安静', tts: '太棒了，现在请小朋友们大眼睛向前看、小手放在膝盖上，小嘴巴保持安静。', wait: 0 },
  { id: 9, type: 'speech', phase: '取盒准备', title: '打开宝箱', tts: '首先请小朋友们将零件宝箱的盖子打开，然后把盖子放在桌子上。', wait: 5 },
  { id: 10, type: 'speech', phase: '找零件', title: '对照清单', tts: '接下来，请你们根据零件清单，找出搭建飞机发射器所需要的对应零件，分类并整齐的放在盖子上！', wait: 0 },
  { id: 11, type: 'media_wait', phase: '零件盘点', title: '找零件时间', media: ['@零件.png'], wait: 500 },
  { id: 12, type: 'speech', phase: '盘点确认', title: '找全了吗', tts: '小朋友们，零件都找全了吗？', wait: 2 },
  { id: 13, type: 'speech', phase: '盖盒坐好', title: '扣回宝箱', tts: '非常棒，请你们将装有零件的盖子扣回宝箱上，并迅速坐好，小手放在膝盖上。', wait: 10 },
  { id: 14, type: 'speech', phase: '规则讲解', title: '拿哪个用哪个', tts: '一会在搭建的过程中，老师请小朋友拿哪个零件块，小朋友们就把哪个零件块拿出来，用不到的零件不可以拿出来放到桌子上。', wait: 0 },
  { id: 15, type: 'speech', phase: '听讲要求', title: '先看后做', tts: '搭建的时候请小朋友们先仔细观察老师是怎样操作的，等老师讲完小朋友们在动手操作，好不好呀？', wait: 2 },
  { id: 16, type: 'speech', phase: '开启搭建', title: '开始搭建之旅', tts: '小朋友们太棒啦，下面我们开始神奇的搭建之旅吧！', robotAction: 3, wait: 0 },
  { id: 17, type: 'video', phase: '视频指导', title: '跟随搭建', media: ['@1.mp4'], wait: 0 },
  { id: 18, type: 'speech', phase: '搭建确认', title: '搭出来了吗', tts: '小朋友们，你们的飞机发射器都搭建出来了吗？', wait: 2 },
  { id: 19, type: 'speech', phase: '改装引导', title: '发挥想象', tts: '哇，你们可太棒了，下面请小朋友们发挥想象改装一下自己的作品吧。', robotAction: 3, wait: 0 },
  { id: 20, type: 'media_bgm', phase: '改装进行', title: '创意改装', media: ['@改装.png', '@改装音乐.mp3'], robotAction: 14, wait: 0 },
  { id: 21, type: 'speech', phase: '改装确认', title: '改装完了吗', tts: '小朋友们，你们的作品改装完了吗？', wait: 3 },
  { id: 22, type: 'media_speech', phase: '比赛导入', title: '飞行比赛', media: ['@比赛.png'], tts: '接下来让我们来进行飞机飞行比赛吧，比赛开始前老师要跟小朋友们介绍一下比赛规则，请小朋友认真听。', wait: 0 },
  { id: 23, type: 'media_speech', phase: '规则说明', title: '发射要领', media: ['@比赛.png'], tts: '我们请每一组小朋友分别从老师手中领取1个纸飞机，然后拿起自己的飞机发射器站在起点线上，拉动皮筋连接在小齿轮上，并将飞机放置在皮筋上，当老师说出3、2、1的时候，就打开短梁，飞机就能发出去了。', wait: 8 },
  { id: 24, type: 'speech', phase: '赛前动员', title: '准备好了吗', tts: '小朋友们，准备好了吗？接下来我们就正式开始了。', wait: 3 },
  { id: 25, type: 'speech', phase: '发令准备', title: '准备', tts: '准备', wait: 1 },
  { id: 26, type: 'video', phase: '倒计时', title: '3-2-1 起飞', media: ['@倒计时.mp4'], wait: 0 },
  { id: 27, type: 'media_bgm', phase: '比赛进行', title: '射飞比赛', media: ['@比赛.png', '@比赛音乐.mp3*3'], robotAction: 15, wait: 0 },
  { id: 28, type: 'speech', phase: '比赛结束', title: '游戏结束', tts: '好啦，小朋友们，我们游戏时间结束了。', wait: 0 },
  { id: 29, type: 'speech', phase: '胜利互动', title: '谁飞得最远', tts: '刚刚谁的飞机发射的最远，获得胜利了呢？快快举起你的小手让老师看一下吧。', wait: 1 },
  { id: 30, type: 'speech', phase: '互动夸奖', title: '为你们鼓掌', tts: '哇，有这么多小朋友呀，你们可真厉害！为你们鼓掌哦！', robotAction: 3, originalTag: '#摇头', wait: 0 },
  { id: 31, type: 'audio', phase: '欢呼掌声', title: '喝彩鼓掌', media: ['@喝彩鼓掌.mp3'], robotAction: 3, wait: 0 },
  { id: 32, type: 'media_speech', phase: '整理指令', title: '零件回家', media: ['@整理零件.png'], tts: '小朋友们，零件宝宝要回家了。现在让我们一起把零件拆下来，轻轻地送回到宝箱里面吧。放好的小朋友请你坐在自己的位置上坐好哦。', wait: 0 },
  { id: 33, type: 'media_bgm', phase: '收纳进行', title: '收零件', media: ['@整理零件.png', '@收零件.mp3*5'], robotAction: 11, wait: 0 },
  { id: 34, type: 'speech', phase: '复习过渡', title: '回顾今天', tts: '最后，让我们一起再来回顾一下今天的内容吧。', wait: 0 },
  { id: 35, type: 'media_speech', phase: '知识提问1', title: '作品是什么', media: ['@作品图.png'], tts: '我们今天搭建的作品是什么？', wait: 5, quiz: { options: ['陪伴机器人', '飞机发射器', '颜色王国'], answer: 1 } },
  { id: 36, type: 'media_speech', phase: '知识提问2', title: '怎样飞更远', media: ['@结构图.png'], tts: '飞机怎样才能飞的更远呢？', wait: 5, quiz: { options: ['皮筋弹力和棘轮棘爪', '走得更快', '涂上颜色'], answer: 0 } },
  { id: 37, type: 'media_speech', phase: '表扬反馈', title: '给你们点赞', media: ['@点赞.png'], tts: '你们回答的太棒了，给你们点赞哦。', robotAction: 3, wait: 0 },
  { id: 38, type: 'media_speech', phase: '原理精讲', title: '棘轮棘爪与弹力', media: ['@结构图.png'], tts: '今天搭建的飞机发射器，主要分为两部分——支架和发射装置，搭建过程中使用到棘轮、棘爪机构，作用是让棘轮只能往一个方向转动，防止棘轮逆转，有自锁的功能。还利用了皮筋的弹力，可以使飞机发射出去，飞得更远。你们记住了吗？', wait: 2 },
  { id: 39, type: 'speech', phase: '拓展导入', title: '听听小任务', tts: '今天的机器人课程上到这就结束了，我们一起听听今天的小任务吧。', wait: 0 },
  { id: 40, type: 'media_speech', phase: '课后小任务', title: '回家折飞机', media: ['@作品图.png'], tts: '请各位小朋友回到家中和爸爸妈妈分享一下今天搭建的作品，并和爸爸妈妈一起折一个纸飞机，看看谁的飞机飞的最远，我相信你的爸爸妈妈一定会给你竖大拇哥点赞的！', robotAction: 2, wait: 0 },
  { id: 41, type: 'speech', phase: '告别结束', title: '挥手再见', tts: '最后，让我们挥挥小手一起说再见吧！', robotAction: 1, wait: 0 },
];
