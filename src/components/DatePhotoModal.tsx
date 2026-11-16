import React, { useState, useEffect } from 'react';
import { X, Trash2, Instagram, Link, Upload, Image as ImageIcon, FileText, MapPin } from 'lucide-react';
import { DateVibeItem } from '../types';
import { formatShortDateBadge } from '../utils/calendar';
import {
  EMOJI_EMOTIONS,
  getEmotionEmoji,
  getVibeColor,
  getSpectrumHint,
  mouthfeelToLightness,
  flavorValToChroma,
} from '../utils/visualPreset';

interface DatePhotoModalProps {
  isOpen: boolean;
  selectedDate: string; // 'YYYY-MM-DD'
  existingItem?: DateVibeItem | null;
  onClose: () => void;
  onSave: (item: DateVibeItem) => void;
  onDelete?: (id: string) => void;
}

interface DiscreteSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  trackGradient?: string;
}

const DiscreteSlider: React.FC<DiscreteSliderProps> = ({
  label,
  value,
  onChange,
  trackGradient,
}) => {
  return (
    <div className="flex flex-col gap-1.5 py-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/70 font-medium">{label}</span>
      </div>

      <input
        type="range"
        min={-3}
        max={3}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-white"
        style={{
          background: trackGradient || '#404040',
        }}
      />
    </div>
  );
};

export const DatePhotoModal: React.FC<DatePhotoModalProps> = ({
  isOpen,
  selectedDate,
  existingItem,
  onClose,
  onSave,
  onDelete,
}) => {
  const [date, setDate] = useState(selectedDate || '2026-09-01');

  // Category 1: Emotion
  const [hue, setHue] = useState<number>(existingItem?.emotion?.hue ?? 48);
  const [emotionText, setEmotionText] = useState<string>(
    existingItem?.emotion?.text ?? 'Joy'
  );
  const [emotionEmoji, setEmotionEmoji] = useState<string>(
    existingItem?.emotion?.emoji ?? '😀'
  );

  // Category 2: City & Location (City > 大、Location > 小)
  const [cityName, setCityName] = useState<string>(
    existingItem?.city?.name ?? 'Taipei'
  );
  const [locationName, setLocationName] = useState<string>(
    existingItem?.city?.location ?? ''
  );

  // Category 3: Note (資訊加上 Note，翻面改 Note)
  const [noteText, setNoteText] = useState<string>(
    existingItem?.note ?? ''
  );

  // Category 4: Tasty (-3 to 3)
  const [mouthfeel, setMouthfeel] = useState<number>(
    existingItem?.flavor?.mouthfeel ?? 0
  );
  const [flavorVal, setFlavorVal] = useState<number>(
    existingItem?.flavor?.flavorVal ?? 0
  );

  // Category 5: Instagram Post Integration
  const [igPhoto, setIgPhoto] = useState<string>(
    existingItem?.igPhoto || existingItem?.afterImage || existingItem?.beforeImage || ''
  );
  const [igUrl, setIgUrl] = useState<string>(
    existingItem?.igUrl || ''
  );

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setDate(existingItem?.date || selectedDate || '2026-09-01');
      const initialHue = existingItem?.emotion?.hue ?? 48;
      const initialText = existingItem?.emotion?.text ?? 'Joy';
      const detected = getEmotionEmoji(initialText, initialHue);
      setHue(initialHue);
      setEmotionText(initialText);
      setEmotionEmoji(existingItem?.emotion?.emoji || detected.emoji);
      setCityName(existingItem?.city?.name ?? 'Taipei');
      setLocationName(existingItem?.city?.location ?? '');
      setNoteText(existingItem?.note ?? '');
      setMouthfeel(existingItem?.flavor?.mouthfeel ?? 0);
      setFlavorVal(existingItem?.flavor?.flavorVal ?? 0);
      setIgPhoto(existingItem?.igPhoto || existingItem?.afterImage || existingItem?.beforeImage || '');
      setIgUrl(existingItem?.igUrl || '');
    }
  }, [isOpen, selectedDate, existingItem]);

  if (!isOpen) return null;

  const { day, month } = formatShortDateBadge(date);

  // Derive visual rendering attributes
  const lightness = mouthfeelToLightness(mouthfeel);
  const chroma = flavorValToChroma(flavorVal);

  // Current preview item object
  const currentPreviewItem: Partial<DateVibeItem> = {
    emotion: { hue, text: emotionText, emoji: emotionEmoji },
    city: { name: cityName, location: locationName, particleSize: 4, density: 45 },
    flavor: { lightness, chroma, mouthfeel, flavorVal },
    note: noteText,
  };

  // Pure solid color (單純純色 - dynamically changes with Tasty Mouthfeel & Flavor)
  const solidColor = getVibeColor(currentPreviewItem);
  const spectrumHint = getSpectrumHint(hue);

  // Photo file upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIgPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = () => {
    const matched = getEmotionEmoji(emotionText, hue);
    const finalEmoji = emotionEmoji || matched.emoji;
    const savedItem: DateVibeItem = {
      id: existingItem?.id || Date.now().toString() + Math.random().toString(36).slice(2),
      date,
      emotion: {
        hue,
        text: emotionText.trim() || matched.name,
        emoji: finalEmoji,
      },
      city: {
        name: cityName.trim() || 'City',
        location: locationName.trim() || undefined,
        particleSize: existingItem?.city?.particleSize ?? 4,
        density: existingItem?.city?.density ?? 45,
        functionality: existingItem?.city?.functionality ?? 0,
        pace: existingItem?.city?.pace ?? 0,
      },
      flavor: {
        lightness,
        chroma,
        mouthfeel,
        flavorVal,
      },
      note: noteText.trim() || undefined,
      igPhoto: igPhoto.trim() || null,
      igUrl: igUrl.trim() || null,
      beforeImage: existingItem?.beforeImage,
      afterImage: existingItem?.afterImage,
    };
    onSave(savedItem);
    onClose();
  };

  const handleDelete = () => {
    if (existingItem?.id && onDelete) {
      onDelete(existingItem.id);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1 border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono tracking-tight bg-white text-black shadow-sm">
              {day} {month}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-xs px-2.5 py-1 rounded-lg text-white focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4:5 Live Preview Card: Pantone Card Style */}
        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15 select-none shrink-0 flex flex-col bg-white font-yugothic">
          {/* Top Swatch Area with Note (Note 在上面，置上、置左) */}
          <div
            className="flex-1 w-full p-4 flex flex-col justify-start items-start text-left overflow-hidden transition-colors duration-200 relative"
            style={{ backgroundColor: solidColor }}
          >
            {/* Note */}
            <div className="w-full flex-1 overflow-hidden">
              {noteText ? (
                <p className="text-xs sm:text-[13px] font-normal text-white/95 line-clamp-6 text-left leading-relaxed whitespace-pre-wrap font-yugothic">
                  {noteText}
                </p>
              ) : null}
            </div>
          </div>

          {/* Bottom White Info Strip: 附圖二規格 (文字適度縮小精緻化) */}
          <div className="w-full bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-end justify-between border-t border-neutral-200 shrink-0 text-black font-yugothic">
            <div className="flex flex-col text-left truncate mr-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-black leading-tight font-yugothic">
                {day} &nbsp;{month}
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-neutral-800 leading-tight mt-0.5 truncate font-yugothic">
                {cityName || 'City'}{locationName ? ` · ${locationName}` : ''}
              </span>
            </div>

            {/* Emoji 放在右下 */}
            {emotionEmoji && (
              <span className="text-xl sm:text-2xl leading-none select-none shrink-0 ml-2 pb-0.5">
                {emotionEmoji}
              </span>
            )}
          </div>
        </div>

        {/* Settings Sections */}
        <div className="flex flex-col gap-3.5 text-xs">
          {/* 1. Emotion Label (Emoji states + continuous spectrum slider) */}
          <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="flex items-center justify-between text-white font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-sm tracking-wide">Emotion</span>
                <span className="text-base">{emotionEmoji}</span>
                {/* Active pure color swatch dot */}
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                  style={{ backgroundColor: solidColor }}
                  title="Spectrum Color"
                />
              </div>
              <span className="text-white/60 font-mono text-[11px]">
                {hue}° · {spectrumHint}
              </span>
            </div>

            {/* 5 Common Emoji Statuses */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {EMOJI_EMOTIONS.map((preset) => {
                const isSelected =
                  emotionText.trim().toLowerCase() === preset.name.toLowerCase() ||
                  emotionEmoji === preset.emoji;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setEmotionText(preset.name);
                      setEmotionEmoji(preset.emoji);
                      setHue(preset.defaultHue);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-all border ${
                      isSelected
                        ? 'bg-neutral-800 border-white text-white font-semibold shadow-md ring-1 ring-white/30'
                        : 'bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    <span className="text-base leading-none">{preset.emoji}</span>
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Emotion Text Input */}
            <input
              type="text"
              value={emotionText}
              onChange={(e) => {
                setEmotionText(e.target.value);
                const matched = getEmotionEmoji(e.target.value, hue);
                setEmotionEmoji(matched.emoji);
              }}
              placeholder="Emotion Label (e.g. Joy, Tired, Busy)..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700/80 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors font-sans mt-0.5"
            />

            {/* Continuous Rainbow Spectrum Slider (Color position 0° - 360°, can sit between colors) */}
            <div className="flex flex-col gap-1 mt-0.5">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>Color Spectrum Position</span>
                <span className="font-mono">{hue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="w-full h-2.5 rounded-lg appearance-none cursor-pointer"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ff8800 12%, #ffff00 24%, #00ff00 40%, #00ffff 56%, #0077ff 70%, #aa00ff 84%, #ff0077 94%, #ff0000 100%)',
                }}
              />
            </div>
          </div>

          {/* 2. City & Location */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-sm tracking-wide">City & Location</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-neutral-400 font-medium">City</span>
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g. Taipei, Tokyo..."
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700/80 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-neutral-400 font-medium">Location</span>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Da'an, Shibuya..."
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700/80 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3. Note */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-sm tracking-wide">Note</span>
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              placeholder="Record your thoughts, memories, or vibes of this meal/day..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700/80 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors resize-none font-sans"
            />
          </div>

          {/* 4. Tasty (Mouthfeel + Flavor) */}
          <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="flex items-center justify-between text-white font-semibold">
              <span className="text-sm tracking-wide">Tasty</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                L: {lightness}% · C: {chroma}%
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <DiscreteSlider
                label="Mouthfeel (Lightness)"
                value={mouthfeel}
                onChange={setMouthfeel}
                trackGradient={`linear-gradient(to right, hsl(${hue}, ${chroma}%, 30%), hsl(${hue}, ${chroma}%, 78%))`}
              />
              <DiscreteSlider
                label="Flavor (Chroma)"
                value={flavorVal}
                onChange={setFlavorVal}
                trackGradient={`linear-gradient(to right, hsl(${hue}, 20%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`}
              />
            </div>
          </div>

          {/* 5. Instagram Post Settings */}
          <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="flex items-center justify-between text-white font-semibold">
              <div className="flex items-center gap-1.5">
                <Instagram className="w-4 h-4 text-pink-400" />
                <span className="text-sm tracking-wide">Instagram Post</span>
              </div>
            </div>

            {/* IG Photo Upload or URL */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-neutral-400 font-medium">Post Photo</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700 hover:border-neutral-500 cursor-pointer text-xs font-medium text-white transition-colors">
                  <Upload className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <div className="relative flex-1">
                  <ImageIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={igPhoto}
                    onChange={(e) => setIgPhoto(e.target.value)}
                    placeholder="or paste image URL..."
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700/80 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
              {igPhoto && (
                <div className="mt-1 w-16 h-16 rounded-xl overflow-hidden border border-neutral-700 relative">
                  <img src={igPhoto} alt="IG Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setIgPhoto('')}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                    title="Remove photo"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* IG Post Link URL */}
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[11px] text-neutral-400 font-medium">Post Link</span>
              <div className="relative">
                <Link className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-700/80 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-900 mt-1">
          {existingItem?.id ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors font-mono"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors text-xs font-bold shadow-lg active:scale-95"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
