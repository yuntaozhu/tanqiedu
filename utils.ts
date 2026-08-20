/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Blob} from '@google/genai';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // convert float32 -1 to 1 to int16 -32768 to 32767
    int16[i] = data[i] * 32768;
  }

  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

/**
 * Decodes raw PCM audio data returned by the Gemini Live API.
 * This implementation follows the recommended logic for handling raw PCM streams.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Processes an image to meet printing specs:
 * 1. Resizes to approx 57mm x 57mm at 200dpi (~448x448 px).
 * 2. Converts to Grayscale.
 * 3. Binarizes (Threshold) for pure black and white.
 */
export async function processLineArtImage(
  imageSource: string, 
  size: number = 448 // Default to 448px for 57mm @ 200dpi
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    // Enable CORS for external images (like Ideogram) to allow canvas processing
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSource); // Fallback
        return;
      }
      
      // Draw and Resize
      ctx.drawImage(img, 0, 0, size, size);

      try {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        const threshold = 180;
        for (let i = 0; i < data.length; i += 4) {
          const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const val = avg < threshold ? 0 : 255;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn("Canvas tainted, using original image URL.", err);
        resolve(imageSource);
      }
    };
    
    img.onerror = (e) => {
      console.warn("Image processing failed, using original.", e);
      // If weserv fails, try original as last resort
      if (imageSource.includes('weserv.nl')) {
          // Attempt to extract original URL if proxy fails
          try {
            const decoded = decodeURIComponent(imageSource.split('url=')[1].split('&')[0]);
            resolve(imageSource.startsWith('http') ? decoded : `https://${decoded}`);
          } catch(err) {
            resolve(imageSource);
          }
      } else {
          resolve(imageSource);
      }
    };
    
    // Check if it's an external URL (http/https) and not already a Data URI
    if (imageSource.startsWith('http')) {
        // Use images.weserv.nl as a CORS proxy and image optimizer.
        // It's generally accessible globally and handles SSL/CORS well.
        // Remove the protocol from the source URL as weserv expects just the domain+path sometimes,
        // but passing the full URL in the 'url' param usually works best if stripped of protocol or encoded properly.
        // Weserv documentation: ?url=example.com/image.jpg
        const urlNoProto = imageSource.replace(/^https?:\/\//, '');
        img.src = `https://images.weserv.nl/?url=${encodeURIComponent(urlNoProto)}&output=png`;
    } else {
        img.src = imageSource;
    }
  });
}

export {createBlob, decode, decodeAudioData, encode};
