import fs from 'fs';

const urlsToCheck = Array.from({length: 30}, (_, i) => [
  `https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/image${i+1}.png`,
  `https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/image${i+1}.jpeg`,
  `https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/image${i+1}.jpg`
]).flat();

async function check() {
  const existing = [];
  for (const url of urlsToCheck) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) {
        existing.push(url);
        console.log("EXISTING:", url);
      }
    } catch(e) {}
  }
}
check();
