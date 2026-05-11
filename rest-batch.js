import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const apiKey = envFile.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY=')).split('=')[1].trim();

const sleep = ms => new Promise(r => setTimeout(r, ms));

const list1 = ['小乌龟', '看台', '小桥', '鱼', '金字塔', '狮身人面像', '神秘宝箱', '骆驼', '天鹅', '小刺猬', '老虎拔牙', '大树', '火箭', '花朵', '奖杯', '兔子', '小提篮', '抽屉', '乌篷船', '风扇'];
const list2 = ['人形机器人', '蛇形机器人', '海底探测器', '瓦力机器人', '消防车', '装甲车', '移动风车', '沙漠越野车', '直升飞机', '潜水艇', '海盗船', '热气球', '挖掘机', '卡车', '压路机', '雷达探测车', '钻孔机', '移动监控', '显微镜', '狙击枪'];
const list3 = ['踢球', '趣味三轮车', '神奇飞椅', '脚踏船', '道闸', '智能牙科椅', '潜水艇', '果酱机器人', '抽油机', '压路机', '防空火炮', '千斤顶', '自动雨刷器', '摆动的鱼', '布谷钟', '机械抓手', '吊桥', '跳舞机器人', '烧烤架', '玉兔捣药'];
const list4 = ['机械木鱼', '除草机', '雷达探测车', '打蛋机', '收割机', '机械狗', '宠物投喂器', '跳舞的小鸟', '击球游戏', '打鼓机器人', '太空漫步机', '划船小人', '变速风扇', '时钟', '巡逻机器人', '清扫车', '擦玻璃机器人', '扫地车', '洗衣机', '平板支架'];

const ranges = [
  { start: 62, end: 81, list: list1 },
  { start: 82, end: 101, list: list2 },
  { start: 102, end: 121, list: list3 },
  { start: 122, end: 141, list: list4 }
];

async function run() {
  for (const range of ranges) {
    console.log(`Processing list...`);
    for (let c = 0; c < 4; c++) {
      const chunkStart = range.start + c * 5;
      const chunkEnd = chunkStart + 4;
      const outFile = `map-${chunkStart}-${chunkEnd}.txt`;
      
      if (fs.existsSync(outFile)) continue;

      console.log(`Chunk ${chunkStart} to ${chunkEnd}`);
      const parts = [];
      parts.push({ text: `Please identify the following 5 images. Pick the exact chinese name from this list: ${range.list.join(', ')}. Format your output strictly as:\n62: name\n... up to your last image.` });

      for (let i = chunkStart; i <= chunkEnd; i++) {
        let ext = '.png';
        const url = `https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/image${i}`;
        
        try {
            const resp = await fetch(url + '.png', { method: 'HEAD' });
            if (!resp.ok) ext = '.jpeg';
        } catch(e) {}
        
        try {
           const imageResp = await fetch(url + ext);
           const arrayBuffer = await imageResp.arrayBuffer();
           parts.push({ text: `Image ${i}:` });
           parts.push({ inline_data: { data: Buffer.from(arrayBuffer).toString("base64"), mime_type: ext === '.png' ? 'image/png' : 'image/jpeg' } });
        } catch(e) {
           console.log(`Failed to fetch image${i}`);
        }
      }

      let attempt = 0;
      while(attempt < 3) {
        attempt++;
        try {
          console.log("Fetching API...");
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
          });
          const data = await res.json();
          if (data.error) {
            console.log("API Error:", data.error.message);
            if(data.error.code === 429) {
                console.log("Rate limit, waiting 15s...");
                await sleep(15000);
                continue;
            }
            break;
          }
          const text = data.candidates[0].content.parts[0].text;
          console.log(text);
          fs.writeFileSync(outFile, text);
          break;
        } catch(e) {
          console.log("Request failed:", e.message);
          await sleep(5000);
        }
      }
      await sleep(2000);
    }
  }
}
run();
