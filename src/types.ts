export type MoodType = 'happy' | 'soso' | 'sad';
export type LifeStateType = 'busy' | 'moderate' | 'free';

export interface DateVibeItem {
  id: string;
  dishNumber?: string; // e.g. "072", "068", "001"
  title?: string;
  date: string; // ISO date string 'YYYY-MM-DD'
  mood?: MoodType; // happy (橘), soso (白), sad (藍紫)
  lifeState?: LifeStateType; // busy, soso, free
  cooked?: boolean; // true: 有 cook (實心); false: 沒有 cook (外框線)
  // Category 1: Emotion & Color
  emotion?: {
    hue?: number;
    text?: string;
    emoji?: string;
  };
  // Category 2: City & Location (Lived In & Cooked At)
  city?: {
    name?: string; // Lived In
    country?: string;
    location?: string; // Cooked At
    coords?: { x: number; y: number };
    period?: string;
    particleSize?: number;
    density?: number;
    functionality?: number;
    pace?: number;
  };
  // Category 3: Tasty & Texture
  flavor?: {
    lightness?: number;
    chroma?: number;
    mouthfeel?: number;
    flavorVal?: number;
  };
  // Notes
  note?: string; // Something about...
  quote?: string; // Short note
  recipeNotes?: string;
  // Visuals & IG
  image?: string; // Primary image for visual impression
  igPhoto?: string | null;
  igUrl?: string | null;
  youtubeUrl?: string | null;
  songTitle?: string | null;
  beforeImage?: string | null;
  afterImage?: string | null;
}

export type ViewMode = 'home' | 'year' | 'dish' | 'place' | 'about';
