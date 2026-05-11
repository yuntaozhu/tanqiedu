import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const apiKey = envFile.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY=')).split('=')[1].trim();

const ai = new GoogleGenAI({ apiKey });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function classify() {
  const prompts = [
    { name: 'l1', start: 62, end: 81, projects: ['小乌龟', '看台', '小桥', '鱼', '金字塔', '狮身人面像', '神秘宝箱', '骆驼', '天鹅', '小刺猬', '老虎拔牙', '大树', '火箭', '花朵', '奖杯', '兔子', '小提篮', '抽屉', '乌篷船', '风扇'] },
    { name: 'l2', start: 82, end: 101, projects: ['人形机器人', '蛇形机器人', '海底探测器', '瓦力机器人', '消防车', '装甲车', '移动风车', '沙漠越野车', '直升飞机', '潜水艇', '海盗船', '热气球', '挖掘机', '卡车', '压路机', '雷达探测车', '钻孔机', '移动监控', '显微镜', '狙击枪'] },
    { name: 'l3', start: 102, end: 121, projects: ['踢球', '趣味三轮车', '神奇飞椅', '脚踏船', '道闸', '智能牙科椅', '潜水艇', '果酱机器人', '抽油机', '压路机', '防空火炮', '千斤顶', '自动雨刷器', '摆动的鱼', '布谷钟', '机械抓手', '吊桥', '跳舞机器人', '烧烤架', '玉兔捣药'] },
    { name: 'l4', start: 122, end: 141, projects: ['机械木鱼', '除草机', '雷达探测车', '打蛋机', '收割机', '机械狗', '宠物投喂器', '跳舞的小鸟', '击球游戏', '打鼓机器人', '太空漫步机', '划船小人', '变速风扇', '时钟', '巡逻机器人', '清扫车', '擦玻璃机器人', '扫地车', '洗衣机', '平板支架'] }
  ];

  let resStr = "";
  
  for (const level of prompts) {
    console.log(`Processing ${level.name}...`);
    for (let i = level.start; i <= level.end; i++) {
        let ext = '.png';
        const url = `https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/image${i}`;
        
        try {
            const resp = await fetch(url + '.png', { method: 'HEAD' });
            if (!resp.ok) ext = '.jpeg';
        } catch(e) {}
        
        try {
           const imageResp = await fetch(url + ext);
           const arrayBuffer = await imageResp.arrayBuffer();
           const buffer = Buffer.from(arrayBuffer);
           
           const response = await ai.models.generateContent({
               model: 'gemini-2.5-flash',
               contents: [
                   { 
                       role: 'user', 
                       parts: [
                           { inlineData: { data: buffer.toString("base64"), mimeType: ext === '.png' ? 'image/png' : 'image/jpeg' } },
                           { text: `Which toy block model does this image show from this list: ${level.projects.join(', ')}? Reply ONLY with the exact chinese name, with NO formatting or other words.` }
                       ] 
                   }
               ]
           });
           
           console.log(`Image ${i}: ${response.text.trim()}`);
           fs.appendFileSync('final-mapping.txt', `imgIndex: ${i} => ${response.text.trim()}\n`);
           
           // Sleep to avoid rate limits
           await sleep(1000);
        } catch(e) {
           console.log(`Failed for image ${i}: ${e.message}`);
           await sleep(15000); // Backoff on failure
           i--; // retry this image
        }
    }
  }
}
classify();
