/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, css, html, PropertyValues, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { createBlob, decode, decodeAudioData, processLineArtImage } from '../../utils';
import { GoogleApiService, IdeogramApiService, ReplicateApiService } from '../../lib/api';
import { LiveServerMessage, FunctionDeclaration, Type } from '@google/genai';
import '../../visual-3d';
import '../../log-viewer';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const GENERATE_DRAWING_TOOL: FunctionDeclaration = {
  name: 'generate_drawing',
  description: '生成一张黑白线条画。',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: '要绘画内容的详细描述。必须是纯视觉描述，不要包含文字。',
      },
    },
    required: ['prompt'],
  },
};

type EngineType = 'google' | 'ideogram' | 'replicate';

interface StoryPanel {
  id: string;
  url: string;
  prompt: string;
  title: string;
  timestamp: number;
}

interface SavedScroll {
  id: string;
  name: string;
  panels: StoryPanel[];
  protagonist?: string;
  anchorImage?: string;
  timestamp: number;
}

const AUDIO_WORKLET_SRC = `
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.index = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.index++] = channelData[i];
        if (this.index >= this.bufferSize) {
          this.port.postMessage(this.buffer);
          this.index = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() isRecording = false;
  @state() status = '正在启动探奇系统...';
  @state() error = '';
  @state() storyPanels: StoryPanel[] = [];
  @state() savedScrolls: SavedScroll[] = [];
  @state() drawingEngine: EngineType = 'ideogram'; // Default to Ideogram (灵犀)
  @state() isConnecting = false;
  @state() isMuted = false;
  @state() seed: number | undefined = undefined;
  @state() textInputValue = '';
  @state() showGallery = false;
  @state() protagonistDescription = ''; 
  @state() anchorImageBase64 = ''; 

  private _currentSessionId = 0;
  private isSocketPoisoned = false;
  private isProcessingTool = false;

  @query('.paper-scroll-container')
  private scrollContainer!: HTMLDivElement;

  private googleApi = new GoogleApiService();
  private ideogramApi = new IdeogramApiService();
  private replicateApi = new ReplicateApiService();
  
  private inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
  private outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  
  @state() inputNode = this.inputAudioContext.createGain();
  @state() outputNode = this.outputAudioContext.createGain();
  
  private nextStartTime = 0;
  private mediaStream: MediaStream | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private isWorkletInitialized = false;

  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      font-family: 'STKaiti', 'Kaiti SC', '楷体', serif;
      position: relative;
      background: #f5f0e1;
    }

    #status {
      position: absolute;
      top: 25px;
      left: 0;
      right: 0;
      z-index: 20;
      text-align: center;
      color: #5D4037;
      text-shadow: 0 1px 2px rgba(255,255,255,0.8);
      font-size: 1.4rem;
      pointer-events: none;
      font-weight: bold;
      padding: 0 20px;
    }

    .protagonist-badge {
      position: absolute;
      top: calc(45% - 32.5vh - 75px);
      left: 50%;
      transform: translateX(-50%);
      background: #FFD700;
      color: #8B0000;
      padding: 6px 18px;
      border-radius: 25px;
      font-size: 0.95rem;
      font-weight: bold;
      border: 2px solid #8B0000;
      box-shadow: 0 6px 15px rgba(0,0,0,0.25);
      z-index: 100;
      white-space: nowrap;
      max-width: 350px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .protagonist-thumb {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      border: 1.5px solid #8B0000;
      object-fit: cover;
    }

    .paper-scroll-container {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 480px; 
      max-width: 90vw;
      height: 65vh;
      overflow-y: auto;
      overflow-x: hidden;
      z-index: 10;
      scrollbar-width: none; 
      -ms-overflow-style: none;
      scroll-behavior: smooth;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      background: #fdf5e6; 
      border: 14px solid #8B0000;
      border-image: repeating-linear-gradient(45deg, #8B0000, #8B0000 10px, #B22222 10px, #B22222 20px) 20;
    }
    
    .paper-scroll-container::-webkit-scrollbar { display: none; }

    .paper-strip {
      display: flex;
      flex-direction: column;
      background: #fdf5e6;
      min-height: 100%;
      width: 100%;
      align-items: center;
      padding: 0;
    }

    .scroll-handle {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 530px;
      height: 32px;
      background: #3e2723;
      border-radius: 16px;
      z-index: 15;
      box-shadow: 0 5px 15px rgba(0,0,0,0.5);
      pointer-events: none;
    }
    .handle-top { top: calc(45% - 32.5vh - 35px); }
    .handle-bottom { bottom: calc(55% - 32.5vh - 35px); }

    .story-panel {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: transparent;
      margin-bottom: 20px;
      padding: 0;
      border-bottom: 2px dashed #D7CCC8;
    }

    .story-panel img {
      width: 100%; 
      height: auto;
      display: block;
      filter: contrast(1.1) grayscale(1);
    }

    .panel-prompt {
      width: 100%;
      background: rgba(255, 255, 255, 0.5);
      font-size: 1.3rem; /* Reduced from 1.8rem */
      color: #5D4037;
      padding: 18px 10px;
      text-align: center;
      border-top: 1px solid #8B0000;
      font-weight: bold;
    }

    .panel-actions {
      position: absolute;
      top: 15px;
      right: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 25;
    }

    .action-btn-circle {
      background: rgba(255, 255, 255, 0.9);
      border: 3px solid #8B0000;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s, background 0.2s;
    }

    .action-btn-circle:hover {
      transform: scale(1.15) rotate(10deg);
      background: #FFD700;
    }

    .footer-controls {
      position: absolute;
      bottom: 2vh;
      left: 0; right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      z-index: 100;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .text-input-bar {
      width: 500px;
      max-width: 85vw;
      background: #f5f0e1;
      border: 3px solid #8B0000;
      border-radius: 40px;
      display: flex;
      align-items: center;
      padding: 4px 18px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      gap: 8px;
    }

    .text-input-bar input {
      flex: 1;
      border: none;
      outline: none;
      padding: 10px;
      font-size: 1.1rem;
      font-family: inherit;
      background: transparent;
    }

    .send-text-btn {
      background: #8B0000;
      color: white;
      border: none;
      width: 38px; height: 38px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }

    button.control-btn {
      outline: none;
      border: none;
      color: white;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      cursor: pointer;
      box-shadow: 0 6px 15px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }

    #startButton { background: #4CAF50; width: 66px; height: 66px; font-size: 1.8rem; }
    #stopButton { background: #F44336; }
    #muteButton { background: #2196F3; }
    
    .side-controls {
      position: absolute;
      right: 25px;
      bottom: 15vh;
      display: flex;
      flex-direction: column;
      gap: 15px;
      z-index: 101;
    }

    .side-btn {
      width: 56px;
      height: 56px;
      font-size: 1.6rem;
      border-radius: 50%;
      border: 3px solid #fff;
      color: white;
      cursor: pointer;
      box-shadow: 0 6px 15px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }

    .side-btn:hover { transform: scale(1.1); }
    #downloadButton { background: #FF9800; }
    #printButton { background: #2196F3; }
    #galleryButton { background: #673AB7; }
    #clearButton { background: #9E9E9E; }

    .engine-switch {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 15;
      background: rgba(255,255,255,0.9);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      cursor: pointer;
      border: 2px solid #8B0000;
      color: #8B0000;
      font-weight: bold;
      user-select: none;
    }

    .gallery-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      z-index: 200;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(5px);
    }

    .gallery-modal {
      background: #fdf5e6;
      width: 90%;
      max-width: 850px;
      max-height: 85vh;
      border: 10px solid #8B0000;
      border-radius: 15px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 30px 60px rgba(0,0,0,0.6);
    }

    .gallery-header {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #8B0000;
      background: #8B0000;
      color: white;
    }

    .gallery-header h2 { margin: 0; font-size: 1.8rem; }

    .gallery-close-btn {
      background: #FFD700;
      color: #8B0000;
      border: 2px solid #fff;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      cursor: pointer;
      font-size: 1.1rem;
      transition: background 0.2s;
    }

    .gallery-close-btn:hover { background: #fff; }

    .gallery-container {
      flex: 1;
      overflow-y: auto;
      padding: 25px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 25px;
    }

    .gallery-item {
      background: white;
      border: 3px solid #D7CCC8;
      padding: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.3s ease;
      position: relative;
    }

    .gallery-item:hover {
      border-color: #8B0000;
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    }

    .gallery-item img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      background: #f5f5f5;
      filter: grayscale(1);
    }

    .gallery-item-info {
      margin-top: 10px;
      text-align: center;
      color: #5D4037;
      font-weight: bold;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .gallery-empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 100px 20px;
      color: #8B4513;
      font-size: 1.4rem;
    }

    /* Print Specific Styles */
    @media print {
      body, html, :host {
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
        height: auto !important;
        overflow: visible !important;
      }
      
      gdm-live-audio-visuals-3d, .footer-controls, .side-controls, .engine-switch, #status, .scroll-handle, .panel-actions, .gallery-overlay, .protagonist-badge, gdm-log-viewer {
        display: none !important;
      }

      .paper-scroll-container {
        position: static !important;
        transform: none !important;
        width: 100% !important;
        height: auto !important;
        border: none !important;
        box-shadow: none !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .story-panel {
        page-break-inside: avoid;
        border-bottom: 2px solid #000 !important;
      }

      .story-panel img {
        filter: contrast(1.5) grayscale(1) !important;
      }

      .panel-prompt {
        border-top: 1px solid #000 !important;
      }
    }
  `;

  protected async firstUpdated() {
    this.status = '探奇画院已开张，请赐画题。';
    this.loadPersistence();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopRecording();
    if (this.inputAudioContext.state !== 'closed') this.inputAudioContext.close().catch(() => {});
    if (this.outputAudioContext.state !== 'closed') this.outputAudioContext.close().catch(() => {});
  }

  private loadPersistence() {
    try {
      const current = localStorage.getItem('gdm_current_scroll');
      if (current && current.trim()) {
        try {
          if (current.startsWith('[')) {
            this.storyPanels = JSON.parse(current);
          } else {
            console.warn("localStorage 'gdm_current_scroll' is not a JSON array.");
          }
        } catch (e) {
          console.error("Failed to parse storyPanels", e);
          this.storyPanels = [];
        }
      }
      
      const archives = localStorage.getItem('gdm_archived_scrolls');
      if (archives && archives.trim()) {
        try {
          if (archives.startsWith('[')) {
            this.savedScrolls = JSON.parse(archives);
          } else {
            console.warn("localStorage 'gdm_archived_scrolls' is not a JSON array.");
          }
        } catch (e) {
          console.error("Failed to parse savedScrolls", e);
          this.savedScrolls = [];
        }
      }
      
      const proto = localStorage.getItem('gdm_current_protagonist');
      if (proto) this.protagonistDescription = proto;
      
      const anchor = localStorage.getItem('gdm_current_anchor');
      if (anchor) this.anchorImageBase64 = anchor;
    } catch (e) {
      console.error("Persistence loading failed totally", e);
    }
  }

  private savePersistence() {
    try {
      localStorage.setItem('gdm_current_scroll', JSON.stringify(this.storyPanels));
      localStorage.setItem('gdm_current_protagonist', this.protagonistDescription);
      localStorage.setItem('gdm_current_anchor', this.anchorImageBase64);
    } catch (e) {}
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('storyPanels')) {
      this.scrollToBottom();
      this.savePersistence();
    }
    if (changedProperties.has('savedScrolls')) {
      localStorage.setItem('gdm_archived_scrolls', JSON.stringify(this.savedScrolls));
    }
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      setTimeout(() => {
        this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight;
      }, 100);
    }
  }

  private handlePrint() {
    window.print();
  }

  private async printSinglePanel(panel: StoryPanel) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>单幅打印 - ${panel.title}</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; font-family: serif; }
            img { width: 100%; max-width: 57mm; filter: grayscale(1) contrast(1.5); }
            h1 { font-size: 1.2rem; margin-top: 10px; border-top: 2px solid #000; padding-top: 10px; width: 100%; text-align: center; }
            @page { margin: 0; size: 57mm auto; }
          </style>
        </head>
        <body>
          <img src="${panel.url}" />
          <h1>${panel.title.replace(/[a-zA-Z]/g, '')}</h1>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  private async extractProtagonist(prompt: string): Promise<string> {
    try {
      const systemPrompt = `从以下描述中提取主角。要求：
          1. 必须是纯中文词汇。
          2. 必须是幼儿易懂的极简词汇（如：小兔子、红赛车、大恐龙）。
          3. 严禁包含任何英文字符或拼音。
          描述：${prompt}`;
      
      const result = await this.replicateApi.generateText(systemPrompt);
      return result?.trim() || '';
    } catch (e) {
      console.warn("Protagonist extraction failed", e);
      return '';
    }
  }

  private async summarizePrompt(prompt: string): Promise<string> {
    try {
      const systemPrompt = `请将绘画描述总结为一个幼儿标题。要求：
          1. 必须是2-5个字的极简中文词汇，适合3岁幼儿（如：漂亮小鱼、开心小熊）。
          2. 严禁出现任何英文单词、字母或拼音。
          3. 在标题开头或结尾增加一个匹配的表情符号(Emoji)。
          描述内容：${prompt}`;
          
      const result = await this.replicateApi.generateText(systemPrompt);
      return result?.trim() || '🎨 奇妙画作';
    } catch (e) {
      return '🎨 奇妙画作';
    }
  }

  private async translatePrompt(text: string): Promise<string> {
    try {
      const systemPrompt = `Translate the following text into English. Output ONLY the English translation, no other text.
      Text: ${text}`;
      
      const translated = await this.replicateApi.generateText(systemPrompt);
      if (translated) return translated.trim();
      throw new Error("Translation returned empty");
    } catch (e) {
      console.warn("Replicate translation failed, using original prompt as fallback", e);
      return text;
    }
  }

  private async callGenerateImage(englishPrompt: string, seed?: number): Promise<string | null> {
    // Order: Ideogram -> Google -> Replicate -> Ideogram
    const engines: EngineType[] = ['ideogram', 'google', 'replicate'];
    
    const apis = {
      'google': this.googleApi,
      'replicate': this.replicateApi,
      'ideogram': this.ideogramApi
    };
    
    // Filter engines to exclude current if needed, but ensure list is valid
    const orderedEngines = [
      this.drawingEngine,
      ...engines.filter(e => e !== this.drawingEngine)
    ];

    // FIX: Only use reference (anchor) image if we are on the 2nd panel or later
    const referenceImage = this.storyPanels.length > 0 ? this.anchorImageBase64 : undefined;

    let englishProtagonist = this.protagonistDescription;
    if (englishProtagonist && /[\u4e00-\u9fa5]/.test(englishProtagonist)) {
        try {
           englishProtagonist = await this.translatePrompt(englishProtagonist);
        } catch(e) {
           console.warn("Protagonist translation failed, proceeding with original.");
        }
    }

    const tryGen = async (api: GoogleApiService | IdeogramApiService | ReplicateApiService, engineName: string) => {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`${engineName} Timeout`)), 60000)
      );
      
      return Promise.race([
        api.generateImage(englishPrompt, seed, englishProtagonist, referenceImage),
        timeoutPromise
      ]) as Promise<string | null>;
    };

    for (const engine of orderedEngines) {
       try {
         if (engine !== this.drawingEngine) {
           let engineName = '灵犀';
           if (engine === 'google') engineName = '妙笔';
           if (engine === 'replicate') engineName = '幻影';
           this.status = `${engineName}正在接力...`;
         }
         
         const result = await tryGen(apis[engine], engine);
         if (result) return result;
         console.warn(`${engine} returned null, trying next...`);
       } catch (error) {
         console.warn(`${engine} failed:`, error);
       }
    }

    return null;
  }

  private async handleTextSubmit(e?: Event) {
    if (e) e.preventDefault();
    const prompt = this.textInputValue.trim();
    if (!prompt) return;

    this.textInputValue = '';
    this.status = `正在挥毫：${prompt}...`;
    this.isProcessingTool = true;

    try {
      if (this.seed === undefined) this.seed = Math.floor(Math.random() * 2147483647);
      
      const englishPromptPromise = this.translatePrompt(prompt);
      
      const protagonistPromise = (!this.protagonistDescription && this.storyPanels.length === 0) 
          ? this.extractProtagonist(prompt) 
          : Promise.resolve(null);
          
      const titlePromise = this.summarizePrompt(prompt);

      const englishPrompt = await englishPromptPromise;
      
      const [newProtagonist, kidFriendlyTitle] = await Promise.all([protagonistPromise, titlePromise]);
      
      if (newProtagonist) {
          this.protagonistDescription = newProtagonist;
      }
      
      const imageUrl = await this.callGenerateImage(englishPrompt, this.seed);

      if (imageUrl) {
        const processedImage = await processLineArtImage(imageUrl, 800);
        if (!this.anchorImageBase64 && this.storyPanels.length === 0) {
          this.anchorImageBase64 = processedImage;
        }
        this.storyPanels = [...this.storyPanels, {
          id: Date.now().toString(),
          url: processedImage,
          prompt, 
          title: kidFriendlyTitle,
          timestamp: Date.now()
        }];
        this.status = '画成。';
      } else {
        throw new Error('Image generation returned null from all engines');
      }
    } catch (err) {
      console.error(err);
      this.status = '笔墨受阻，请稍后再试。';
    } finally { this.isProcessingTool = false; }
  }

  private async handleSparkleRemix(panel: StoryPanel) {
    if (this.isProcessingTool) return;
    this.status = `正在施展闪耀魔法...`;
    this.isProcessingTool = true;
    try {
      const magicPrompt = `${panel.prompt}, 画面充满魔法闪光，梦幻气息`;
      
      const englishPrompt = await this.translatePrompt(magicPrompt);
      const kidFriendlyTitle = await this.summarizePrompt(magicPrompt);
      
      const imagePromise = this.callGenerateImage(englishPrompt, Math.floor(Math.random() * 2147483647));
      const imageUrl = await imagePromise;

      if (imageUrl) {
        const processedImage = await processLineArtImage(imageUrl, 800);
        this.storyPanels = [...this.storyPanels, {
          id: Date.now().toString(),
          url: processedImage,
          prompt: magicPrompt,
          title: `✨ ${kidFriendlyTitle}`,
          timestamp: Date.now()
        }];
        this.status = '魔法完成。';
      }
    } catch (err) { this.status = '咒语失效。'; } finally { this.isProcessingTool = false; }
  }

  private async stopRecording() {
    this.isRecording = false;
    this.isSocketPoisoned = true;
    this.isConnecting = false;
    this._currentSessionId++; 
    if (this.audioWorkletNode) {
      this.audioWorkletNode.port.onmessage = null; 
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    await this.googleApi.close();
    this.status = '画师已歇息。';
  }

  private async connectLive() {
    if (this.isConnecting) return;

    // Check for API key selection if in AI Studio environment
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        this.status = '请先选择 API Key 以启动探奇画院。';
        await window.aistudio.openSelectKey();
        // Proceed after dialog closes (assuming success as per guidelines)
      }
    }

    this._currentSessionId++;
    const mySessionId = this._currentSessionId;
    this.isConnecting = true;
    this.status = '正在铺卷...';
    try {
      await Promise.all([this.inputAudioContext.resume(), this.outputAudioContext.resume()]);
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!this.isWorkletInitialized) {
        const blob = new Blob([AUDIO_WORKLET_SRC], { type: 'application/javascript' });
        await this.inputAudioContext.audioWorklet.addModule(URL.createObjectURL(blob));
        this.isWorkletInitialized = true;
      }
      const sessionPromise = this.googleApi.connectLive({
        model: 'gemini-3.1-flash-live-preview',
        systemInstruction: `你是绘画大师"探奇"。
        1. 严禁用任何英文或拼音交流。
        2. 说话语气要像温柔的幼儿园老师。
        3. 严禁在给 generate_drawing 的指令中包含任何英文。
        4. 当用户说"开始作画"、"开始画画"、"开始画"、"开始画图"、"帮我画一个"或表达出想看画的意思时，你必须立即结合之前的聊天内容，总结出一个丰富的黑白线条画视觉描述作为 prompt 调用 generate_drawing。
        5. 对话中要引导孩子多描述细节，捕捉他们的想象力，然后再根据这些细节开始作画。
        目前锁定的主角是：${this.protagonistDescription || '未定'}。`,
        tools: [{ functionDeclarations: [GENERATE_DRAWING_TOOL] }],
        callbacks: {
          onopen: async () => {
            if (this._currentSessionId !== mySessionId) return;
            this.isRecording = true;
            this.isConnecting = false;
            this.status = '请赐题。';
            const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream!);
            this.audioWorkletNode = new AudioWorkletNode(this.inputAudioContext, 'pcm-processor');
            this.audioWorkletNode.port.onmessage = async (event) => {
              if (this.isSocketPoisoned || !this.isRecording || this.isMuted || this.isProcessingTool) return;
              try { 
                const session = await sessionPromise;
                session.sendRealtimeInput({ audio: createBlob(event.data) });
              } catch (e) { 
                this.isSocketPoisoned = true; 
              }
            };
            source.connect(this.inputNode);
            this.inputNode.connect(this.audioWorkletNode);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (this._currentSessionId !== mySessionId) return;
            if (message.serverContent?.interrupted) {
              // Clear upcoming audio queue on interruption
              this.nextStartTime = this.outputAudioContext.currentTime;
              this.outputNode.gain.cancelScheduledValues(this.nextStartTime);
              // Note: We might want to stop currently playing source, but that's complex with the current buffer source strategy
            }

            if (message.toolCall && message.toolCall.functionCalls) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'generate_drawing') {
                  this.isProcessingTool = true;
                  const prompt = (fc.args as any).prompt;
                  this.status = `正在作画...`;
                  try {
                    const englishPrompt = await this.translatePrompt(prompt);
                    const imageUrl = await this.callGenerateImage(englishPrompt, this.seed);
                    
                    if (imageUrl) {
                      const processed = await processLineArtImage(imageUrl, 800);
                      if (!this.anchorImageBase64) this.anchorImageBase64 = processed;
                      const title = await this.summarizePrompt(prompt); 
                      this.storyPanels = [...this.storyPanels, { id: Date.now().toString(), url: processed, prompt, title, timestamp: Date.now() }];
                    }

                    const session = await sessionPromise;
                    session.sendToolResponse({
                      functionResponses: [{
                        name: fc.name,
                        id: (fc as any).id, // Using 'id' as per skill example
                        response: { result: "已完成绘图并添加到卷轴。" }
                      }]
                    });
                  } finally { this.isProcessingTool = false; }
                }
              }
            }
            
            // Transcription Support: update input box with user's words
            const inputTranscript = (message as any).inputTranscription?.text || 
                                     (message as any).inputAudioTranscription?.text ||
                                     (message as any).serverContent?.inputTranscription?.text;
            if (inputTranscript) {
              this.textInputValue = inputTranscript;
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const buffer = await decodeAudioData(decode(audioData), this.outputAudioContext, 24000, 1);
              const source = this.outputAudioContext.createBufferSource();
              source.buffer = buffer; source.connect(this.outputNode);
              source.start(this.nextStartTime);
              this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime) + buffer.duration;
            }
          },
          onerror: (err) => {
            console.error("Gemini Live API Error:", err);
            this.status = '语音引擎故障，请重试。';
            this.stopRecording();
          }, 
          onclose: (ev) => {
            console.warn("Gemini Live Connection Closed:", ev);
            this.stopRecording();
          }
        }
      });
    } catch (e: any) {
      this.isConnecting = false;
      if (e.message?.includes('Requested entity was not found')) {
        this.status = 'API Key 无效，请重新选择。';
        if (window.aistudio) await window.aistudio.openSelectKey();
      } else {
        this.status = '连接失败，请重试。';
      }
    }
  }

  private handleClearScroll() {
    if (this.storyPanels.length === 0) return;
    if (confirm("是否封存当前画卷，开启新画？")) {
      const newSaved = { 
        id: Date.now().toString(), 
        name: this.storyPanels[0].title, 
        panels: [...this.storyPanels], 
        protagonist: this.protagonistDescription, 
        anchorImage: this.anchorImageBase64, 
        timestamp: Date.now() 
      };
      this.savedScrolls = [newSaved, ...this.savedScrolls];
      this.storyPanels = []; this.seed = undefined; this.protagonistDescription = ''; this.anchorImageBase64 = '';
      localStorage.removeItem('gdm_current_scroll');
      this.status = '新轴已铺好。';
    }
  }

  private async downloadStoryStrip() {
    if (this.storyPanels.length === 0) return;
    this.status = '正在装裱并收藏画卷...';
    
    const currentSnapshot: SavedScroll = {
      id: Date.now().toString(),
      name: this.storyPanels[this.storyPanels.length - 1].title || '🎨 我的画卷',
      panels: [...this.storyPanels],
      protagonist: this.protagonistDescription,
      anchorImage: this.anchorImageBase64,
      timestamp: Date.now()
    };
    
    this.savedScrolls = [currentSnapshot, ...this.savedScrolls];
    localStorage.setItem('gdm_archived_scrolls', JSON.stringify(this.savedScrolls));

    try {
      const CANVAS_WIDTH = 800; const PADDING = 40; const TITLE_HEIGHT = 100;
      const images: HTMLImageElement[] = await Promise.all(this.storyPanels.map(p => new Promise<HTMLImageElement>(res => { const img = new Image(); img.crossOrigin="Anonymous"; img.onload=()=>res(img); img.src=p.url; })));
      const canvas = document.createElement('canvas'); canvas.width = CANVAS_WIDTH + PADDING*2; canvas.height = images.reduce((a, b) => a + (CANVAS_WIDTH/b.width*b.height) + TITLE_HEIGHT, 0) + PADDING*2;
      const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#fdf5e6'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.strokeStyle = '#8B0000'; ctx.lineWidth = 15; ctx.strokeRect(7,7,canvas.width-14,canvas.height-14);
      let y = PADDING; images.forEach((img, i) => { const h = CANVAS_WIDTH/img.width*img.height; ctx.drawImage(img, PADDING, y, CANVAS_WIDTH, h); y+=h; ctx.fillStyle = '#3e2723'; ctx.font = 'bold 42px STKaiti, Kaiti SC, 楷体'; ctx.textAlign='center'; ctx.fillText(this.storyPanels[i].title, canvas.width/2, y + 60); y+=TITLE_HEIGHT; });
      const link = document.createElement('a'); link.download = `探奇画卷-${Date.now()}.png`; link.href = canvas.toDataURL(); link.click(); 
      this.status = '画卷已下载并存入画库。';
    } catch (e) { 
      this.status = '下载失败，但已存入画库。'; 
      console.error(e);
    }
  }

  private toggleGallery(show: boolean) {
    this.showGallery = show;
  }
  
  private toggleEngine() {
    if (this.drawingEngine === 'ideogram') this.drawingEngine = 'google';
    else if (this.drawingEngine === 'google') this.drawingEngine = 'replicate';
    else this.drawingEngine = 'ideogram';
  }

  render() {
    return html`
      <div id="status">${this.status}</div>
      <div class="engine-switch" @click="${this.toggleEngine}">
        画师: ${this.drawingEngine === 'ideogram' ? '灵犀 (I)' : this.drawingEngine === 'google' ? '妙笔 (G)' : '幻影 (R)'}
      </div>
      <gdm-live-audio-visuals-3d .inputNode="${this.inputNode}" .outputNode="${this.outputNode}"></gdm-live-audio-visuals-3d>

      ${this.protagonistDescription ? html`
        <div class="protagonist-badge">
           ${this.anchorImageBase64 ? html`<img src="${this.anchorImageBase64}" class="protagonist-thumb" />` : '🏮'}
           <span>画中主角: ${this.protagonistDescription}</span>
        </div>
      ` : nothing}

      <div class="scroll-handle handle-top"></div>
      <div class="paper-scroll-container">
        <div class="paper-strip">
          ${this.storyPanels.length === 0 ? html`<div style="margin: 120px 40px; color: #8B4513; text-align: center; font-size: 1.6rem; line-height: 2;">素轴一张待落墨。<br/>请语音或文字输入画题。</div>` : ''}
          ${this.storyPanels.map(panel => html`
            <div class="story-panel">
              <img src="${panel.url}" />
              <div class="panel-actions">
                <button class="action-btn-circle" title="魔法闪光" @click="${() => this.handleSparkleRemix(panel)}">✨</button>
                <button class="action-btn-circle" title="打印单张" @click="${() => this.printSinglePanel(panel)}">🖨️</button>
              </div>
              <div class="panel-prompt">${panel.title.replace(/[a-zA-Z]/g, '')}</div>
            </div>
          `)}
        </div>
      </div>
      <div class="scroll-handle handle-bottom"></div>

      <div class="footer-controls">
        <form class="text-input-bar" @submit="${this.handleTextSubmit}">
          <input type="text" placeholder="输入你想画的，比如：大恐龙..." .value="${this.textInputValue}" @input="${(e: any) => this.textInputValue = e.target.value}" />
          <button type="submit" class="send-text-btn">✒️</button>
        </form>
        <div class="controls">
          ${!this.isRecording ? html`<button id="startButton" class="control-btn" @click="${this.connectLive}">🎤</button>` : html`<button id="muteButton" class="control-btn" @click="${() => this.isMuted = !this.isMuted}">${this.isMuted ? '🔇' : '🎤'}</button><button id="stopButton" class="control-btn" @click="${this.stopRecording}">⏹️</button>`}
        </div>
      </div>

      <div class="side-controls">
        ${this.storyPanels.length > 0 ? html`
          <button id="downloadButton" class="side-btn" @click="${this.downloadStoryStrip}" title="保存长轴">📥</button>
          <button id="printButton" class="side-btn" @click="${this.handlePrint}" title="打印画轴">🖨️</button>
        ` : ''}
        <button id="galleryButton" class="side-btn" @click="${() => this.toggleGallery(true)}" title="珍藏画库">🖼️</button>
        <button id="clearButton" class="side-btn" @click="${this.handleClearScroll}" title="新轴">🗑️</button>
      </div>

      ${this.showGallery ? html`
        <div class="gallery-overlay" @click="${() => this.toggleGallery(false)}">
          <div class="gallery-modal" @click="${(e: Event) => e.stopPropagation()}">
            <div class="gallery-header">
              <h2>📜 珍藏画库</h2>
              <button class="gallery-close-btn" @click="${() => this.toggleGallery(false)}">返回画院</button>
            </div>
            <div class="gallery-container">
              ${this.savedScrolls.length === 0 ? html`<div class="gallery-empty">画库空空如也，快去创作吧！</div>` : nothing}
              ${this.savedScrolls.map(s => html`
                <div class="gallery-item" @click="${() => { this.storyPanels = s.panels; this.protagonistDescription = s.protagonist||''; this.anchorImageBase64 = s.anchorImage||''; this.toggleGallery(false); }}">
                  <img src="${s.panels[0].url}" />
                  <div class="gallery-item-info">${s.name}</div>
                </div>
              `)}
            </div>
          </div>
        </div>
      ` : nothing}
      <gdm-log-viewer></gdm-log-viewer>
    `;
  }
}
