/** Route Ideogram CDN URLs through our Vercel proxy so classroom networks load them faster. */
export function proxiedIdeogramUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "api.ideogram.ai") {
      return `/ideogram-proxy${u.pathname}${u.search}`;
    }
    if (u.hostname === "ideogram.ai") {
      return `/ideogram-img${u.pathname}${u.search}`;
    }
  } catch {
    /* keep original */
  }
  return url;
}

/**
 * Ideogram API Service — Ideogram 4.0 generate
 * POST /v1/ideogram-v4/generate  (text_prompt + square 1024 TURBO)
 */
export class IdeogramApiService {
  async generateImage(
    prompt: string,
    seed?: number,
    protagonist?: string,
    _referenceImageBase64?: string
  ): Promise<string | null> {
    const apiKey = import.meta.env.VITE_IDEOGRAM_API_KEY;

    if (!apiKey) {
      console.error("Ideogram API Key is missing.");
      return null;
    }

    try {
      const characterContext = protagonist ? `Main character: ${protagonist}. ` : "";
      const styleKeywords =
        "Children coloring-book line art, black and white cartoon outlines, thick clean contours, pure white background.";
      const constraints = "CRITICAL: NO TEXT, NO LETTERS, NO WATERMARK, no shading, no grayscale fill.";
      const fullPrompt = `${styleKeywords} ${characterContext}Scenario: ${prompt}. ${constraints}`;

      console.log(`Generating image with Ideogram v4 (Seed: ${seed ?? "random"})...`);

      const fd = new FormData();
      fd.append("text_prompt", fullPrompt);
      fd.append("resolution", "1024x1024");
      fd.append("rendering_speed", "TURBO");
      if (seed !== undefined) {
        fd.append("seed", seed.toString());
      }

      const endpoint = "/ideogram-proxy/v1/ideogram-v4/generate";
      const isLocalhost =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const directUrl = "https://api.ideogram.ai/v1/ideogram-v4/generate";

      let response = await fetch(endpoint, {
        method: "POST",
        headers: { "Api-Key": apiKey },
        body: fd,
      });

      if ((response.status === 404 || response.status === 0) && isLocalhost) {
        console.warn("Ideogram proxy miss, calling api.ideogram.ai directly...");
        response = await fetch(directUrl, {
          method: "POST",
          headers: { "Api-Key": apiKey },
          body: fd,
        });
      }

      const responseText = await response.text();
      if (!response.ok) {
        console.error(`Ideogram API Error: ${response.status}`, responseText);
        return null;
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Ideogram response is not valid JSON:", responseText);
        return null;
      }

      const url = data?.data?.[0]?.url;
      if (url) return proxiedIdeogramUrl(url);
      console.error("Ideogram v4 returned no image url:", data);
    } catch (error) {
      console.error("Ideogram generation failed:", error);
      return null;
    }
    return null;
  }
}
