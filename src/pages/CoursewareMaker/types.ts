export interface Hotspot {
  id: string;
  name: string;
  top: string;
  left: string;
  width: string;
  height: string;
  desc: string;
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  purpose: string;
}

export interface Voiceover {
  id: string;
  slideId: string;
  label: string;
  url: string;
  duration: string;
}

export interface GameConfig {
  hasGame: boolean;
  gameTitle: string;
  gameType: 'match' | 'eliminate' | 'sequence' | 'synth';
  gameDifficulty: 'easy' | 'normal' | 'hard';
  gameThought: string;
  gameTimerSec: number;
  bgImage: string;
}

export interface Slide {
  id: string;
  pageNum: number;
  title: string;
  intent: string;
}

export interface SlideData {
  hotspots: Hotspot[];
  assets: Asset[];
  voiceovers: Voiceover[];
  gameConfig: GameConfig;
}

export interface SlidesMap {
  [key: string]: SlideData;
}

export interface SynthesisOptions {
  selectedModel: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'doubao-pro' | 'deepseek-coder';
  extraPrompts: string;
  enableConfetti: boolean;
  enableVoiceSynthesis: boolean;
  layoutPreference: 'balanced-split' | 'immersive-canvas' | 'bento-grid';
  offlineMode: boolean;
}
