
import { GoogleGenAI, Type } from '@google/genai';
import { addJob } from '../../_store';
import { Buffer } from 'buffer';

// Hardcoded API Key as fallback to ensure serverless function works
const API_KEY = process.env.VITE_GEMINI_API_KEY || 'AIzaSyBySQCaSZJUJcHSoBlPy_TM7VoNJ6ahHF4';

const GENERATE_DRAWING_TOOL = {
  name: 'generate_drawing',
  description: 'Generate a black and white line art drawing for kids based on the prompt.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'Visual description of the drawing for children.',
      },
    },
    required: ['prompt'],
  },
};

export default async function handler(req: any, res: any) {
  console.log('Voice Handler Started');
  
  // CORS Support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-device-token'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = req.headers['x-device-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Read Audio Data Safely
    // Check if body is already parsed (Vercel sometimes does this)
    let base64Audio = '';
    
    if (req.body && Buffer.isBuffer(req.body)) {
       base64Audio = req.body.toString('base64');
    } else if (typeof req.body === 'string') {
       // If already string, assume it might be base64 or raw? 
       // For audio/wav, it's safer to rely on buffer.
       base64Audio = Buffer.from(req.body).toString('base64');
    } else {
        // Stream reading fallback
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);
        base64Audio = audioBuffer.toString('base64');
    }

    if (!base64Audio) {
        throw new Error("Empty audio body received");
    }

    if (!API_KEY) {
      throw new Error("Server Misconfiguration: API_KEY is missing.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // 2. Gemini Call
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview',
      contents: {
        role: 'user',
        parts: [{ inlineData: { mimeType: 'audio/wav', data: base64Audio } }]
      },
      config: {
        systemInstruction: "You are a gentle kindergarten teacher named 'Xiao Yi'. Speak in Chinese. If the child asks to draw something, call the generate_drawing function. Keep responses short and sweet.",
        tools: [{ functionDeclarations: [GENERATE_DRAWING_TOOL] }]
      }
    });

    let textResponse = response.text || "";
    let action = null;

    // 3. Handle Function Calls
    if (response.functionCalls && response.functionCalls.length > 0) {
       const call = response.functionCalls[0];
       if (call.name === 'generate_drawing') {
           const prompt = (call.args as any).prompt;
           
           // Mock Image for Device Demo (Pokemon 25 - Pikachu)
           const mockImageUrl = "https://images.weserv.nl/?url=raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";
           addJob(mockImageUrl);
           
           action = { type: 'print', prompt: prompt, job_id: 'mock_job' };
           
           if (!textResponse) {
               textResponse = `好的，我这就画一张${prompt}。`;
           }
       }
    }

    if (!textResponse) {
        textResponse = "我没听清，请再说一遍。";
    }

    return res.status(200).json({
      text_response: textResponse,
      action: action,
      audio_base64: null 
    });

  } catch (error: any) {
    console.error('Voice Handler Critical Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
