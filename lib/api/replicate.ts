/**
 * Replicate API Service
 * 
 * Uses the Replicate HTTP API to generate images via black-forest-labs/flux-schnell
 * and text via meta/meta-llama-3-8b-instruct.
 */
export class ReplicateApiService {
  private apiKey = import.meta.env.VITE_REPLICATE_API_TOKEN || 'r8_6wC8A7FzqarTRNf0UcViIRpkdVY903r4eqpGV';
  private baseUrl = '/replicate-proxy';

  /**
   * Helper to make authenticated requests to Replicate
   */
  private async makeRequest(modelEndpoint: string, body: any): Promise<any> {
    if (!this.apiKey) {
      console.error("Replicate API Token is missing.");
      return null;
    }

    // Ensure endpoint uses the proxy path
    const endpoint = `${this.baseUrl}/${modelEndpoint}`;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const fallbackProxy = 'https://corsproxy.io/?' + encodeURIComponent(`https://api.replicate.com/${modelEndpoint}`);

    let response: Response | null = null;
    let currentEndpoint = endpoint;

    // Retry logic
    for (let i = 0; i < 2; i++) {
      try {
        response = await fetch(currentEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Token ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

        // Fallback for localhost if proxy missing (404)
        if (response.status === 404 && isLocalhost && currentEndpoint !== fallbackProxy) {
          console.warn("Switching to fallback proxy for Replicate");
          currentEndpoint = fallbackProxy;
          i--; // Retry immediately
          continue;
        }

        if (response.ok) break;

        // Log detailed error for 422 or others
        if (!response.ok) {
           const errText = await response.text();
           console.warn(`Replicate request failed [${response.status}]:`, errText);
           // If 422, it's a payload error, don't retry
           if (response.status === 422 || response.status === 401) return null;
        }

        if (i < 1) await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.warn(`Replicate network error (Attempt ${i+1}):`, e);
        if (i < 1) await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!response || !response.ok) return null;
    
    let data = await response.json();
    
    // Polling
    const maxPolls = 60;
    let polls = 0;
    while (
      data.status !== 'succeeded' && 
      data.status !== 'failed' && 
      data.status !== 'canceled' && 
      polls < maxPolls
    ) {
      if (!data.urls?.get) break;
      await new Promise(r => setTimeout(r, 1000)); 
      
      let pollUrl = data.urls.get;
      // Adjust poll URL to go through proxy
      if (pollUrl.includes('api.replicate.com')) {
        pollUrl = pollUrl.replace('https://api.replicate.com', this.baseUrl);
      } else if (isLocalhost && !pollUrl.includes(this.baseUrl)) {
        pollUrl = 'https://corsproxy.io/?' + encodeURIComponent(data.urls.get);
      }

      try {
        const pollResp = await fetch(pollUrl, {
          headers: {
            "Authorization": `Token ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        });
        if (pollResp.ok) {
          data = await pollResp.json();
        } else {
           // If poll fails, might be transient
        }
      } catch (e) { /* ignore poll error */ }
      polls++;
    }

    if (data.status === 'succeeded') {
      return data.output;
    } else {
        console.warn("Replicate prediction failed or timed out:", data.status);
    }
    return null;
  }

  /**
   * Generates text using Llama 3 on Replicate.
   * Uses model alias endpoint for stability.
   */
  async generateText(prompt: string, maxTokens = 100): Promise<string | null> {
    const endpoint = "v1/models/meta/meta-llama-3-8b-instruct/predictions";
    
    const body = {
      input: {
        prompt: prompt,
        max_tokens: maxTokens,
        temperature: 0.1,
        top_p: 0.9,
      }
    };

    try {
      const output = await this.makeRequest(endpoint, body);
      if (output && Array.isArray(output)) {
        return output.join('').trim();
      }
      return null;
    } catch (e) {
      console.error("Replicate text generation failed:", e);
      return null;
    }
  }

  /**
   * Generates an image using Replicate Flux Schnell.
   * Uses model alias endpoint.
   */
  async generateImage(
    prompt: string, 
    seed?: number, 
    protagonist?: string, 
    referenceImageBase64?: string
  ): Promise<string | null> {
    // Standardize Prompt
    const characterContext = protagonist ? `Main character: ${protagonist}. ` : '';
    const refContext = referenceImageBase64 ? `Maintain visual style of previous drawings. ` : '';
    const fullPrompt = `${characterContext}${refContext}Scenario: ${prompt}. Simple black and white line art, 1-bit color style, binary image, no gray, high contrast, sharp edges, pure white background, centered, vector line style. CRITICAL: NO TEXT, NO ENGLISH WORDS.`;

    console.log(`Generating image with Replicate Flux Schnell...`);
    
    const endpoint = "v1/models/black-forest-labs/flux-schnell/predictions";
    
    const body: any = {
      input: { 
        prompt: fullPrompt,
        aspect_ratio: "1:1",
        go_fast: true,
        megapixels: "1"
      }
    };

    if (seed !== undefined) {
        body.input.seed = seed;
    }

    try {
      const output = await this.makeRequest(endpoint, body);
      if (output) {
        return Array.isArray(output) ? output[0] : output;
      }
    } catch (error) {
      console.error("Replicate image generation exception:", error);
    }
    return null;
  }
}
