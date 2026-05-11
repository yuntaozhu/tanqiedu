import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const apiKey = envFile.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY=')).split('=')[1].trim();

const ai = new GoogleGenAI({ apiKey });

async function classify() {
  const parts = [];
  parts.push({ text: `Identify which is which from this list: 小乌龟, 看台, 小桥, 鱼, 金字塔. Format: imageXX: name` });
       
  for (let i = 62; i <= 66; i++) {
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
         parts.push({ text: `Image ${i}:` });
         parts.push({ inlineData: { data: buffer.toString("base64"), mimeType: ext === '.png' ? 'image/png' : 'image/jpeg' } });
     } catch(e) {
         console.log(`Failed to fetch image${i}`);
     }
  }

  try {
     const response = await ai.models.generateContent({
         model: 'gemini-2.0-flash',
         contents: [ { role: 'user', parts: parts } ]
     });
     console.log("RESULT::");
     console.log(response.text);
  } catch(e) {
     console.log(`Failed: ${e.message}`);
  }
}
classify();
