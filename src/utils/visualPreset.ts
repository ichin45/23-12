import { DateVibeItem } from '../types';

export interface EmojiEmotionPreset {
  emoji: string;
  name: string;
  defaultHue: number;
}

/**
 * The 5 standard emoji emotion states specified by the user:
 * 😀 Joy
 * 🫠 Tired
 * 🤯 Busy
 * 🫪 Nervous, Anxiety
 * 🥰 Happiness
 */
export const EMOJI_EMOTIONS: EmojiEmotionPreset[] = [
  { emoji: '😀', name: 'Joy', defaultHue: 48 },
  { emoji: '🫠', name: 'Tired', defaultHue: 215 },
  { emoji: '🤯', name: 'Busy', defaultHue: 15 },
  { emoji: '🫪', name: 'Nervous, Anxiety', defaultHue: 275 },
  { emoji: '🥰', name: 'Happiness', defaultHue: 338 },
];

/**
 * Returns emoji and standard label matched against emotion text or hue
 */
export function getEmotionEmoji(text = '', hue = 0): { emoji: string; name: string } {
  const lower = (text || '').toLowerCase().trim();

  if (lower.includes('joy') || lower.includes('😀')) {
    return { emoji: '😀', name: 'Joy' };
  }
  if (lower.includes('tired') || lower.includes('exhaust') || lower.includes('fatigue') || lower.includes('🫠')) {
    return { emoji: '🫠', name: 'Tired' };
  }
  if (lower.includes('busy') || lower.includes('rush') || lower.includes('hectic') || lower.includes('🤯')) {
    return { emoji: '🤯', name: 'Busy' };
  }
  if (
    lower.includes('nervous') ||
    lower.includes('anxiety') ||
    lower.includes('anxious') ||
    lower.includes('fear') ||
    lower.includes('stress') ||
    lower.includes('🫪')
  ) {
    return { emoji: '🫪', name: 'Nervous, Anxiety' };
  }
  if (
    lower.includes('happiness') ||
    lower.includes('happy') ||
    lower.includes('love') ||
    lower.includes('peace') ||
    lower.includes('calm') ||
    lower.includes('serenity') ||
    lower.includes('🥰')
  ) {
    return { emoji: '🥰', name: 'Happiness' };
  }

  // Fallback by hue spectrum if custom English word was typed
  const h = ((hue % 360) + 360) % 360;
  if (h >= 320 || h < 25) {
    return { emoji: '🤯', name: text || 'Busy' };
  }
  if (h >= 25 && h < 85) {
    return { emoji: '😀', name: text || 'Joy' };
  }
  if (h >= 85 && h < 240) {
    return { emoji: '🫠', name: text || 'Tired' };
  }
  if (h >= 240 && h < 305) {
    return { emoji: '🫪', name: text || 'Nervous, Anxiety' };
  }
  return { emoji: '🥰', name: text || 'Happiness' };
}

/**
 * Mouthfeel -> Lightness: -3 (dark) to +3 (bright)
 */
export function mouthfeelToLightness(m = 0): number {
  return Math.max(24, Math.min(84, Math.round(54 + m * 8)));
}

/**
 * Flavor -> Chroma / Saturation: -3 (low chroma / muted) to +3 (high chroma / saturated)
 */
export function flavorValToChroma(f = 0): number {
  return Math.max(12, Math.min(100, Math.round(64 + f * 13)));
}

/**
 * Returns pure solid emotion color with Tasty modulation (Hue + Mouthfeel Lightness + Flavor Chroma)
 */
export function getVibeColor(item: Partial<DateVibeItem>): string {
  const hue = item.emotion?.hue ?? 205;
  const mouthfeel = item.flavor?.mouthfeel ?? 0;
  const flavorVal = item.flavor?.flavorVal ?? 0;

  const lightness = mouthfeelToLightness(mouthfeel);
  const chroma = flavorValToChroma(flavorVal);

  return `hsl(${((hue % 360) + 360) % 360}, ${chroma}%, ${lightness}%)`;
}

/**
 * Returns pure solid color based only on hue (fallback)
 */
export function getEmotionPureColor(hue: number): string {
  const normalized = ((hue % 360) + 360) % 360;
  return `hsl(${normalized}, 88%, 54%)`;
}

/**
 * Returns pure solid background color
 */
export function getVibeGradient(item: Partial<DateVibeItem>): string {
  return getVibeColor(item);
}

/**
 * Spectrum color hint in English describing the hue zone
 */
export function getSpectrumHint(hue: number): string {
  const h = ((hue % 360) + 360) % 360;
  if (h >= 345 || h < 15) return 'Crimson / Red';
  if (h >= 15 && h < 45) return 'Coral / Orange';
  if (h >= 45 && h < 70) return 'Amber / Yellow';
  if (h >= 70 && h < 140) return 'Lime / Green';
  if (h >= 140 && h < 175) return 'Mint / Emerald';
  if (h >= 175 && h < 200) return 'Teal / Cyan';
  if (h >= 200 && h < 225) return 'Sky / Azure';
  if (h >= 225 && h < 260) return 'Indigo / Deep Blue';
  if (h >= 260 && h < 290) return 'Violet / Purple';
  if (h >= 290 && h < 320) return 'Magenta / Plum';
  return 'Rose / Pink';
}

export function functionalityToParticleSize(func = 0): number {
  return Math.max(1, Math.min(10, 4 - func));
}

export function paceToDensity(p = 0): number {
  return Math.max(5, Math.min(95, Math.round(45 + p * 10)));
}
