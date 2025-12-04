export enum Tab {
  START = 'START',
  MEDIA = 'MEDIA',
  EFFECTS = 'EFFECTS',
  NARRATION = 'NARRATION',
  MUSIC = 'MUSIC',
  IDENTITY = 'IDENTITY',
  EXPORT = 'EXPORT'
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  duration: number; // in seconds
  effect: 'none' | 'zoom-in' | 'zoom-out' | 'zoom-alternating';
  filter: 'none' | 'grayscale' | 'sepia' | 'invert' | 'warm' | 'cool';
  transition: 'none' | 'fade';
  intensity: number; // 1 to 10
}

export interface AudioTrack {
  id: string;
  url: string;
  name: string;
  volume: number; // 0 to 1
  type: 'narration' | 'music';
  duration: number; // in seconds
}

export interface VisualIdentitySettings {
  logoUrl: string | null;
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: number; // percentage (e.g. 10 for 10%)
  opacity: number; // percentage (0-100)
  margin: number; // percentage (0-20)
}

export interface ProjectState {
  timeline: MediaItem[];
  narration: AudioTrack[];
  backgroundMusic: AudioTrack[];
  narrationSettings: {
    autoSync: boolean;
    imageDuration: number;
  };
  visualIdentity: VisualIdentitySettings;
}