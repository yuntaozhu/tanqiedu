/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, css, html, PropertyValues, nothing } from 'lit';
import { state, query } from 'lit/decorators.js';
import { processLineArtImage } from '../../utils';
import { IdeogramApiService } from '../../lib/api';
import { emitBumiToolCue } from '../lib/bumi';
import {
  doubaoChat,
  doubaoVoice,
  doubaoResetConversation,
  DoubaoSilentError,
  DoubaoTurn,
  concatInt16,
  drawingPromptFromTurn,
  floatToPcm16,
  pcm16ToWav,
  playTtsBase64,
  rms,
  wantsDrawing,
} from '../../lib/tanqiDoubao';
import '../../visual-3d';
import '../../log-viewer';

interface StoryPanel {
  id: string;
  url: string;
  prompt: string;
  title: string;
  timestamp: number;
  userOverlay?: string; // Base64 transparent PNG of user doodle
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

// @customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() isRecording = false;
  @state() status = '正在启动探奇系统...';
  @state() error = '';
  @state() storyPanels: StoryPanel[] = [];
  @state() savedScrolls: SavedScroll[] = [];
  @state() isConnecting = false;
  @state() isMuted = false;
  @state() seed: number | undefined = undefined;
  @state() textInputValue = '';
  @state() showGallery = false;
  @state() protagonistDescription = ''; 
  @state() anchorImageBase64 = ''; 
  @state() activeDrawingPanelId: string | null = null;
  private isPainting = false;
  private lastX = 0;
  private lastY = 0;

  private handleStartDrawing(panelId: string) {
    if (this.activeDrawingPanelId === panelId) {
      this.activeDrawingPanelId = null;
      this.status = "已收起笔墨。";
    } else {
      this.activeDrawingPanelId = panelId;
      this.status = "请挥毫落纸。";
      emitBumiToolCue('draw');
    }
  }

  private initCanvas(canvas: HTMLCanvasElement, panel: StoryPanel) {
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // If there's an existing overlay, load it
    if (panel.userOverlay) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = panel.userOverlay;
    }
  }

  private onCanvasPointerDown(e: PointerEvent) {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    this.isPainting = true;
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    emitBumiToolCue('draw');
  }

  private onCanvasPointerMove(e: PointerEvent) {
    if (!this.isPainting) return;
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d')!;
    ctx.lineTo(x, y);
    ctx.stroke();
    
    this.lastX = x;
    this.lastY = y;
  }

  private onCanvasPointerUp(e: PointerEvent) {
    if (!this.isPainting) return;
    this.isPainting = false;
    this.saveCanvasDrawing(e.target as HTMLCanvasElement);
  }

  private saveCanvasDrawing(canvas: HTMLCanvasElement) {
    const dataUrl = canvas.toDataURL();
    this.storyPanels = this.storyPanels.map(p => 
      p.id === this.activeDrawingPanelId ? { ...p, userOverlay: dataUrl } : p
    );
    this.savePersistence();
  }

  private _currentSessionId = 0;
  private isProcessingTool = false;
  private pcmChunks: Int16Array[] = [];
  private pcmSampleCount = 0;
  private speechStarted = false;
  private silenceMs = 0;
  private isPlayingTts = false;
  private voiceInFlight = false;
  private hadConversation = false;
  private mediaSourceNode: MediaStreamAudioSourceNode | null = null;

  @query('.paper-scroll-container')
  private scrollContainer!: HTMLDivElement;

  private ideogramApi = new IdeogramApiService();
  
  private inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
  private outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  
  @state() inputNode = this.inputAudioContext.createGain();
  @state() outputNode = this.outputAudioContext.createGain();
  
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

    .loading-placeholder {
      width: 100%;
      aspect-ratio: 1/1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f1efeb;
      color: #8B4513;
      font-size: 1.4rem;
      gap: 15px;
    }

    .loading-placeholder::before {
      content: '✒️';
      font-size: 3rem;
      animation: write-pulse 1.5s infinite;
    }

    @keyframes write-pulse {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
      50% { transform: translateY(-10px) rotate(-15deg); opacity: 1; }
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

    .drawing-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: crosshair;
      z-index: 30;
      touch-action: none;
    }

    .drawing-overlay-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 22;
    }

    .action-btn-circle.active {
      background: #8B0000;
      color: white;
    }

    .panel-actions {
      position: absolute;
      top: 15px;
      right: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 35;
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
    this.status = '探奇画院已开张。先和小探宝聊，想好了再说画出来。';
    this.loadPersistence();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopRecording();
    if (this.inputAudioContext.state !== 'closed') this.inputAudioContext.close().catch(() => {});
    if (this.outputAudioContext.state !== 'closed') this.outputAudioContext.close().catch(() => {});
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (changedProperties.has('activeDrawingPanelId') && this.activeDrawingPanelId) {
      const canvas = this.renderRoot.querySelector(`#canvas-${this.activeDrawingPanelId}`) as HTMLCanvasElement;
      if (canvas) {
        const panel = this.storyPanels.find(p => p.id === this.activeDrawingPanelId);
        if (panel) this.initCanvas(canvas, panel);
      }
    }
    if (changedProperties.has('storyPanels')) {
      this.scrollToBottom();
      this.savePersistence();
    }
    if (changedProperties.has('savedScrolls')) {
      localStorage.setItem('gdm_archived_scrolls', JSON.stringify(this.savedScrolls));
    }
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

  private scrollToBottom() {
    if (this.scrollContainer) {
      setTimeout(() => {
        this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight;
      }, 100);
    }
  }

  private handlePrint() {
    emitBumiToolCue('print');
    window.print();
  }

  private async printSinglePanel(panel: StoryPanel) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    emitBumiToolCue('print');
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
          <div style="position: relative; width: 100%; max-width: 57mm;">
            <img src="${panel.url}" style="width: 100%;" />
            ${panel.userOverlay ? `<img src="${panel.userOverlay}" style="position: absolute; top:0; left:0; width:100%; height:100%;" />` : ''}
          </div>
          <h1>${panel.title.replace(/[a-zA-Z]/g, '')}</h1>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  private localTitle(prompt: string): string {
    const t = prompt.replace(/\s+/g, '').slice(0, 5);
    return t ? `🎨 ${t}` : '🎨 奇妙画作';
  }

  private async callGenerateImage(prompt: string, seed?: number): Promise<string | null> {
    const referenceImage = this.storyPanels.some((p) => p.url) ? this.anchorImageBase64 : undefined;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Ideogram Timeout')), 60000)
    );
    return Promise.race([
      this.ideogramApi.generateImage(prompt, seed, this.protagonistDescription, referenceImage),
      timeoutPromise,
    ]) as Promise<string | null>;
  }

  private async onDoubaoTurn(data: DoubaoTurn) {
    this.hadConversation = true;
    const reply = (data.text_response || '').trim();
    if (reply) this.status = reply;

    this.isPlayingTts = true;
    try {
      await playTtsBase64(data.audio_base64);
    } finally {
      this.isPlayingTts = false;
    }

    if (wantsDrawing(data)) {
      const prompt = drawingPromptFromTurn(data);
      if (prompt) {
        void this.addIdeogramPanel(prompt);
      }
    }
  }

  private async addIdeogramPanel(prompt: string) {
    const panelId = Date.now().toString();
    this.storyPanels = [...this.storyPanels, {
      id: panelId,
      url: '',
      prompt,
      title: '正在构思...',
      timestamp: Date.now(),
    }];
    this.status = '正在作画...';
    emitBumiToolCue('generate');

    try {
      if (this.seed === undefined) this.seed = Math.floor(Math.random() * 2147483647);
      const kidFriendlyTitle = this.localTitle(prompt);
      const imageUrl = await this.callGenerateImage(prompt, this.seed);
      if (!imageUrl) throw new Error('Image generation returned null from Ideogram');

      const processedImage = await processLineArtImage(imageUrl, 800);
      if (!this.anchorImageBase64 && this.storyPanels.length <= 1) {
        this.anchorImageBase64 = processedImage;
      }
      this.storyPanels = this.storyPanels.map(p =>
        p.id === panelId ? { ...p, url: processedImage, title: kidFriendlyTitle } : p
      );
      this.status = '画成。';
      this.savePersistence();
    } catch (err) {
      console.error(err);
      this.storyPanels = this.storyPanels.filter(p => p.id !== panelId);
      this.status = '笔墨受阻，请稍后再试。';
    }
  }

  private async handleTextSubmit(e?: Event) {
    if (e) e.preventDefault();
    const prompt = this.textInputValue.trim();
    if (!prompt || this.voiceInFlight) return;

    this.textInputValue = '';
    this.status = '小探宝在听...';
    this.voiceInFlight = true;
    try {
      const data = await doubaoChat(prompt);
      await this.onDoubaoTurn(data);
    } catch (err) {
      console.error(err);
      this.status = '小探宝走神了，请再说一次。';
    } finally {
      this.voiceInFlight = false;
    }
  }

  private async handleSparkleRemix(panel: StoryPanel) {
    if (this.isProcessingTool) return;
    this.status = `正在施展闪耀魔法...`;
    this.isProcessingTool = true;
    emitBumiToolCue('generate');
    try {
      const magicPrompt = `${panel.prompt}, 画面充满魔法闪光，梦幻气息`;
      const kidFriendlyTitle = this.localTitle(magicPrompt);
      const imageUrl = await this.callGenerateImage(magicPrompt, Math.floor(Math.random() * 2147483647));

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

  private resetVadBuffer() {
    this.pcmChunks = [];
    this.pcmSampleCount = 0;
    this.speechStarted = false;
    this.silenceMs = 0;
  }

  private async flushUtterance() {
    if (this.voiceInFlight || this.isPlayingTts) return;
    this.voiceInFlight = true;
    const pcm = concatInt16(this.pcmChunks);
    this.resetVadBuffer();
    // ~0.4s of 16kHz audio
    if (pcm.length < 6400 && !this.hadConversation) {
      this.voiceInFlight = false;
      return;
    }
    this.status = '小探宝在听...';
    try {
      const wav = pcm16ToWav(pcm);
      const data = await doubaoVoice(wav);
      await this.onDoubaoTurn(data);
    } catch (err) {
      if (err instanceof DoubaoSilentError) {
        this.status = '请靠近麦克风再说一次。';
      } else {
        console.error(err);
        this.status = '小探宝走神了，请再说一次。';
      }
    } finally {
      this.voiceInFlight = false;
    }
  }

  private onPcmChunk(float32: Float32Array) {
    if (!this.isRecording || this.isMuted || this.isPlayingTts || this.voiceInFlight) return;
    const energy = rms(float32);
    const chunkMs = (float32.length / 16000) * 1000;
    const speaking = energy > 0.018;

    if (speaking) {
      this.speechStarted = true;
      this.silenceMs = 0;
      this.pcmChunks.push(floatToPcm16(float32));
      this.pcmSampleCount += float32.length;
    } else if (this.speechStarted) {
      this.pcmChunks.push(floatToPcm16(float32));
      this.pcmSampleCount += float32.length;
      this.silenceMs += chunkMs;
    }

    const utteredMs = (this.pcmSampleCount / 16000) * 1000;
    if (this.speechStarted && (this.silenceMs >= 900 || utteredMs >= 8000)) {
      void this.flushUtterance();
    }
  }

  private async stopRecording() {
    this.isRecording = false;
    this.isConnecting = false;
    this._currentSessionId++;
    this.resetVadBuffer();
    if (this.audioWorkletNode) {
      this.audioWorkletNode.port.onmessage = null;
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode = null;
    }
    if (this.mediaSourceNode) {
      this.mediaSourceNode.disconnect();
      this.mediaSourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.status = '画师已歇息。';
  }

  private async connectLive() {
    if (this.isConnecting || this.isRecording) return;

    this._currentSessionId++;
    const mySessionId = this._currentSessionId;
    this.isConnecting = true;
    this.status = '正在铺卷...';
    try {
      await this.inputAudioContext.resume();
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (this._currentSessionId !== mySessionId) return;
      if (!this.isWorkletInitialized) {
        const blob = new Blob([AUDIO_WORKLET_SRC], { type: 'application/javascript' });
        await this.inputAudioContext.audioWorklet.addModule(URL.createObjectURL(blob));
        this.isWorkletInitialized = true;
      }
      this.mediaSourceNode = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      this.audioWorkletNode = new AudioWorkletNode(this.inputAudioContext, 'pcm-processor');
      this.audioWorkletNode.port.onmessage = (event) => {
        if (this._currentSessionId !== mySessionId) return;
        const data = event.data as Float32Array;
        this.onPcmChunk(data);
      };
      this.mediaSourceNode.connect(this.inputNode);
      this.inputNode.connect(this.audioWorkletNode);
      this.resetVadBuffer();
      this.isRecording = true;
      this.isConnecting = false;
      this.status = '请说，想好了可以说画出来。';
    } catch (e: any) {
      this.isConnecting = false;
      console.error(e);
      this.status = '麦克风打不开，请检查权限。';
    }
  }

  private handleClearScroll() {
    if (this.storyPanels.length === 0) {
      void doubaoResetConversation();
      this.hadConversation = false;
      this.status = '新轴已铺好。';
      return;
    }
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
      this.hadConversation = false;
      void doubaoResetConversation();
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
      const images: {img: HTMLImageElement, overlay?: HTMLImageElement}[] = await Promise.all(this.storyPanels.map(p => new Promise<{img: HTMLImageElement, overlay?: HTMLImageElement}>(async (res) => { 
        const img = new Image(); img.crossOrigin="Anonymous"; 
        img.onload = async () => {
          if (p.userOverlay) {
            const overlay = new Image(); overlay.crossOrigin="Anonymous";
            overlay.onload = () => res({img, overlay});
            overlay.src = p.userOverlay;
          } else {
            res({img});
          }
        }; 
        img.src=p.url; 
      })));
      const canvas = document.createElement('canvas'); 
      canvas.width = CANVAS_WIDTH + PADDING*2; 
      canvas.height = images.reduce((a, b) => a + (CANVAS_WIDTH/b.img.width*b.img.height) + TITLE_HEIGHT, 0) + PADDING*2;
      const ctx = canvas.getContext('2d')!; 
      ctx.fillStyle = '#fdf5e6'; ctx.fillRect(0,0,canvas.width,canvas.height); 
      ctx.strokeStyle = '#8B0000'; ctx.lineWidth = 15; ctx.strokeRect(7,7,canvas.width-14,canvas.height-14);
      
      let y = PADDING; 
      images.forEach((pair, i) => { 
        const h = CANVAS_WIDTH/pair.img.width*pair.img.height; 
        ctx.drawImage(pair.img, PADDING, y, CANVAS_WIDTH, h); 
        if (pair.overlay) ctx.drawImage(pair.overlay, PADDING, y, CANVAS_WIDTH, h);
        
        y+=h; 
        ctx.fillStyle = '#3e2723'; ctx.font = 'bold 42px STKaiti, Kaiti SC, 楷体'; ctx.textAlign='center'; 
        ctx.fillText(this.storyPanels[i].title, canvas.width/2, y + 60); 
        y+=TITLE_HEIGHT; 
      });
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

  render() {
    return html`
      <div id="status">${this.status}</div>
      <div class="engine-switch">
        画师: 灵犀 (Ideogram)
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
          ${this.storyPanels.length === 0 ? html`<div style="margin: 120px 40px; color: #8B4513; text-align: center; font-size: 1.6rem; line-height: 2;">素轴一张待落墨。<br/>先和小探宝聊，想好了再说画出来。</div>` : ''}
          ${this.storyPanels.map(panel => html`
            <div class="story-panel" id="panel-${panel.id}">
              ${panel.url ? html`
                <img src="${panel.url}" />
                ${panel.userOverlay ? html`<img src="${panel.userOverlay}" class="drawing-overlay-img" />` : nothing}
                ${this.activeDrawingPanelId === panel.id ? html`
                  <canvas 
                    id="canvas-${panel.id}" 
                    class="drawing-canvas"
                    @pointerdown="${this.onCanvasPointerDown}"
                    @pointermove="${this.onCanvasPointerMove}"
                    @pointerup="${this.onCanvasPointerUp}"
                    @pointerleave="${this.onCanvasPointerUp}"
                  ></canvas>
                ` : nothing}
              ` : html`
                <div class="loading-placeholder">探奇正在挥毫落纸...</div>
              `}
              <div class="panel-actions">
                <button class="action-btn-circle ${this.activeDrawingPanelId === panel.id ? 'active' : ''}" title="挥毫落纸" @click="${() => this.handleStartDrawing(panel.id)}">🖌️</button>
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
          <input type="text" placeholder="先聊一聊，想好了再说画出来..." .value="${this.textInputValue}" @input="${(e: any) => this.textInputValue = e.target.value}" />
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

if (!customElements.get('gdm-live-audio')) {
  customElements.define('gdm-live-audio', GdmLiveAudio);
}
