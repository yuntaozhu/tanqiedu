import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { logger } from '../../logger';

export interface LiveConfig {
  model: string;
  systemInstruction: string;
  tools?: any[];
  callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (error: any) => void;
    onclose: (event: any) => void;
  };
}

export class GoogleApiService {
  public session: any = null;

  get isConnected(): boolean {
    return !!this.session;
  }

  /**
   * Establishes a Gemini Live real-time audio connection.
   * This MUST remain using @google/genai as it supports the WebSocket streaming protocol.
   */
  async connectLive(config: LiveConfig) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBySQCaSZJUJcHSoBlPy_TM7VoNJ6ahHF4';
    if (!apiKey) {
      logger.error("GEMINI_API_KEY is missing in GoogleApiService");
      throw new Error("GEMINI_API_KEY is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    await this.close();

    try {
      logger.info(`Initiating Gemini Live connection to model: ${config.model}`);
      
      const timeoutMs = 20000; // Increased to 20s
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`连接超时 (WebSocket timeout)`)), timeoutMs);
      });

      const connectPromise = ai.live.connect({
        model: config.model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: config.systemInstruction,
          tools: config.tools,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
             logger.info("Gemini Live WebSocket opened successfully.");
             config.callbacks.onopen();
          },
          onmessage: (msg) => config.callbacks.onmessage(msg),
          onerror: (err) => {
             logger.error("Gemini Live WebSocket Error (callback):", err);
             config.callbacks.onerror(err);
          },
          onclose: (ev) => {
             logger.warn("Gemini Live WebSocket Closed (callback):", ev);
             config.callbacks.onclose(ev);
          }
        }
      });

      this.session = await Promise.race([connectPromise, timeoutPromise]);
      logger.info("Gemini Live Session established.");
      return this.session;
    } catch (err) {
      logger.error("Gemini Live Connection Failed (initialization):", err);
      this.session = null;
      throw err;
    }
  }

  /**
   * Generates a coloring book image using Google's Imagen 4 model VIA REPLICATE.
   * Replaces the direct Gemini image generation.
   */
  async generateImage(
    prompt: string, 
    seed?: number, 
    protagonist?: string, 
    referenceImageBase64?: string
  ): Promise<string | null> {
    const replicateToken = import.meta.env.VITE_REPLICATE_API_TOKEN || 'r8_6wC8A7FzqarTRNf0UcViIRpkdVY903r4eqpGV';
    if (!replicateToken) {
      console.error("REPLICATE_API_TOKEN is missing for Google Imagen 4");
      return null;
    }

    // Consistency Logic: Match Flux implementation exactly
    const characterContext = protagonist ? `Main character: ${protagonist}. ` : '';
    const refContext = referenceImageBase64 ? `Maintain visual style of previous drawings. ` : '';
    
    // Identical prompt suffix to ReplicateApiService for visual consistency across engines
    const fullPrompt = `${characterContext}${refContext}Scenario: ${prompt}. Simple black and white line art, 1-bit color style, binary image, no gray, high contrast, sharp edges, pure white background, centered, vector line style. CRITICAL: NO TEXT, NO ENGLISH WORDS.`;

    console.log(`Generating image with Google Imagen 4 (via Replicate)...`);

    const input: any = {
      prompt: fullPrompt,
      aspect_ratio: "1:1", // Default to square
      safety_filter_level: "block_medium_and_above"
    };
    
    if (seed !== undefined) {
      input.seed = seed;
    }

    // Call Replicate API for google/imagen-4
    return this.callReplicateImagen4(input, replicateToken);
  }

  private async callReplicateImagen4(input: any, apiKey: string): Promise<string | null> {
    const baseUrl = '/replicate-proxy';
    // Use the model alias endpoint
    const endpoint = `${baseUrl}/v1/models/google/imagen-4/predictions`;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const fallbackProxy = 'https://corsproxy.io/?' + encodeURIComponent('https://api.replicate.com/v1/models/google/imagen-4/predictions');

    let currentEndpoint = endpoint;

    try {
      // 1. Start Prediction
      let response = await fetch(currentEndpoint, {
        method: "POST",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input })
      });

      // Fallback for localhost if proxy missing
      if (response.status === 404 && isLocalhost) {
        console.warn("Switching to fallback proxy for Imagen 4");
        currentEndpoint = fallbackProxy;
        response = await fetch(currentEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Token ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ input })
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error("Imagen 4 Request Failed:", response.status, errText);
        return null;
      }

      let data = await response.json();
      
      // 2. Poll for results
      const maxPolls = 60;
      let polls = 0;
      
      while (
        data.status !== 'succeeded' && 
        data.status !== 'failed' && 
        data.status !== 'canceled' && 
        polls < maxPolls
      ) {
        if (!data.urls?.get) break;
        await new Promise(r => setTimeout(r, 1000)); // 1s wait
        
        let pollUrl = data.urls.get;
        // Adjust poll URL to go through proxy
        if (pollUrl.includes('api.replicate.com')) {
          pollUrl = pollUrl.replace('https://api.replicate.com', baseUrl);
        } else if (isLocalhost && !pollUrl.includes(baseUrl) && currentEndpoint === fallbackProxy) {
             pollUrl = 'https://corsproxy.io/?' + encodeURIComponent(data.urls.get);
        }

        try {
          const pollResp = await fetch(pollUrl, {
            headers: {
              "Authorization": `Token ${apiKey}`,
              "Content-Type": "application/json"
            }
          });
          
          if (pollResp.ok) {
            data = await pollResp.json();
          }
        } catch (e) {
          // ignore poll transient errors
        }
        polls++;
      }

      if (data.status === 'succeeded' && data.output) {
        // Output is usually an array of URLs for Imagen models
        return Array.isArray(data.output) ? data.output[0] : data.output;
      }
      
    } catch (e) {
      console.error("Imagen 4 Generation Exception:", e);
    }
    
    return null;
  }

  async close() {
    if (this.session) {
      const tempSession = this.session;
      this.session = null; 
      try {
        await tempSession.close();
      } catch (e) {
      }
    }
  }
}
