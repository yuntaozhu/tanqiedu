import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const apiKey = envFile.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY=')).split('=')[1].trim();

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const names = data.models.map(m => m.name);
  console.log(names.join('\n'));
}
test();
