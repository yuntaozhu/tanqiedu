/**
 * Ideogram API Service
 * 
 * Uses the official Ideogram v3 API to generate images.
 */
export class IdeogramApiService {
  
  /**
   * Generates an image mirroring the signature of GoogleApiService.
   */
  async generateImage(
    prompt: string, 
    seed?: number, 
    protagonist?: string, 
    referenceImageBase64?: string
  ): Promise<string | null> {
    const apiKey = process.env.IDEOGRAM_API_KEY;
    
    if (!apiKey) {
      console.error("Ideogram API Key is missing.");
      return null;
    }

    try {
      // 1. Construct Prompt
      const characterContext = protagonist ? `Main character: ${protagonist}. ` : '';
      // We rely on style_reference_images for style now, but keeping text reinforcement helps.
      const styleKeywords = "Line art artistic cartoon work, black and white, coloring book style.";
      const constraints = "CRITICAL: NO TEXT, NO ENGLISH WORDS, white background.";
      
      const fullPrompt = `${styleKeywords} ${characterContext} Scenario: ${prompt}. ${constraints}`;

      console.log(`Generating image with Ideogram v3 (Seed: ${seed ?? 'random'})...`);

      // 2. Prepare FormData
      const fd = new FormData();
      fd.append('prompt', fullPrompt);
      fd.append('aspect_ratio', '1x1'); 
      fd.append('rendering_speed', 'FLASH');   // Use FLASH for speed
      fd.append('style_type', 'AUTO');         // AUTO is required when using style_reference_images
      fd.append('magic_prompt', 'ON');         // Requested by user
      
      if (seed !== undefined) {
        fd.append('seed', seed.toString());
      }

      // 3. Handle Reference Image (Style Reference)
      if (referenceImageBase64) {
        try {
          // Convert Base64 to Blob
          const res = await fetch(referenceImageBase64);
          const blob = await res.blob();
          // Append as 'style_reference_images' (plural, implies array support in API)
          fd.append('style_reference_images', blob, 'reference.png');
        } catch (e) {
          console.warn("Failed to attach reference image to Ideogram request:", e);
        }
      }

      // 4. Endpoint configuration
      // Vercel proxy rewrite: /ideogram-proxy/v1/ideogram-v3/generate -> https://api.ideogram.ai/v1/ideogram-v3/generate
      const endpoint = '/ideogram-proxy/v1/ideogram-v3/generate';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const fallbackProxy = 'https://corsproxy.io/?' + encodeURIComponent('https://api.ideogram.ai/v1/ideogram-v3/generate');
      
      let currentEndpoint = endpoint;
      let response = await fetch(currentEndpoint, {
        method: 'POST',
        headers: {
          'Api-Key': apiKey,
          // Content-Type is set automatically with boundary by fetch when using FormData
        },
        body: fd,
      });

      // Fallback logic for localhost (no vercel rewrite)
      if (response.status === 404 && isLocalhost) {
        console.warn("Vercel proxy not found, trying fallback proxy for Ideogram v3...");
        response = await fetch(fallbackProxy, {
            method: 'POST',
            headers: { 'Api-Key': apiKey },
            body: fd,
        });
      }

      const responseText = await response.text();

      if (!response.ok) {
        console.error(`Ideogram API Error: ${response.status}`, responseText);
        return null;
      }

      const data = JSON.parse(responseText);
      
      // Ideogram v3 response structure usually contains `data` array
      if (data && data.data && data.data.length > 0) {
        return data.data[0].url;
      }
      
    } catch (error) {
      console.error("Ideogram generation failed:", error);
      return null;
    }
    return null;
  }
}
