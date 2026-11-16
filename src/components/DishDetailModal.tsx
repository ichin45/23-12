import React, { useState, useEffect } from 'react';
import { X, Instagram, Calendar, MapPin, Globe, Upload, Trash2, ExternalLink, Check, Music, Play, Pause } from 'lucide-react';
import { DateVibeItem, MoodType, LifeStateType } from '../types';
import { getDishNumberByDate } from '../utils/dishNumber';
import { playInPageAudio, toggleInPageAudio, subscribeAudioState } from '../utils/audioPlayer';

interface DishDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: DateVibeItem | null;
  initialDate?: string;
  onSave: (dish: DateVibeItem) => void;
  onDelete?: (id: string) => void;
  onNavigateToYear?: (dateStr?: string) => void;
  onNavigateToPlace?: (cookedAt?: string, livedIn?: string) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  isOpen,
  onClose,
  dish,
  initialDate,
  onSave,
  onDelete,
  onNavigateToYear,
  onNavigateToPlace,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [dishNumber, setDishNumber] = useState('');
  const [date, setDate] = useState('2026-09-19');
  const [mood, setMood] = useState<MoodType>('happy');
  const [lifeState, setLifeState] = useState<LifeStateType>('moderate');
  const [cooked, setCooked] = useState<boolean>(true);
  const [cityName, setCityName] = useState('Hsinchu');
  const [locationName, setLocationName] = useState('NYCU Corner');
  const [note, setNote] = useState('');
  const [quote, setQuote] = useState('');
  const [image, setImage] = useState('');
  const [igUrl, setIgUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAudioState((activeId) => setPlayingAudioId(activeId));
    return unsub;
  }, []);

  useEffect(() => {
    if (dish) {
      const activeDate = dish.date || '2026-09-19';
      setDishNumber(dish.dishNumber || '');
      setDate(activeDate);
      setMood(dish.mood || 'happy');
      setLifeState(dish.lifeState || 'moderate');
      setCooked(dish.cooked !== false);
      setCityName(dish.city?.name || 'Hsinchu');
      setLocationName(dish.city?.location || 'NYCU Corner');
      setNote(dish.note || '');
      setQuote(dish.quote || '');
      setImage(dish.image || '');
      setIgUrl(dish.igUrl || '');
      setYoutubeUrl(dish.youtubeUrl || '');
      setSongTitle(dish.songTitle || '');
      setIsEditing(false);

      if (isOpen && dish.youtubeUrl && dish.youtubeUrl.trim()) {
        playInPageAudio(dish.id, dish.youtubeUrl, (activeId) => setPlayingAudioId(activeId));
      }
    } else {
      // New dish: manual card number entry
      const initialDateVal = initialDate || '2026-09-19';
      setDate(initialDateVal);
      setDishNumber('');
      setMood('happy');
      setLifeState('moderate');
      setCooked(true);
      setCityName('Hsinchu');
      setLocationName('NYCU Corner');
      setNote('');
      setQuote('');
      setImage('');
      setIgUrl('https://www.instagram.com');
      setYoutubeUrl('https://www.youtube.com');
      setSongTitle('Midnight Melody');
      setIsEditing(true);
    }
  }, [dish, initialDate, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawData = event.target?.result as string;
        if (!rawData) return;
        // Optimize image resolution to ensure smooth performance and safe localStorage persistence
        const img = new Image();
        img.onload = () => {
          const maxDim = 960;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
            setImage(optimizedDataUrl);
          } else {
            setImage(rawData);
          }
        };
        img.onerror = () => {
          setImage(rawData);
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
  };

  const getMoodColor = (m: MoodType) => {
    switch (m) {
      case 'happy':
        return '#f97316'; // 橘
      case 'soso':
        return '#ffffff'; // 白
      case 'sad':
        return '#818cf8'; // 藍紫
      default:
        return '#f97316';
    }
  };

  const handleSave = () => {
    const finalNumber = dishNumber.trim();
    const updatedDish: DateVibeItem = {
      id: dish?.id || `dish-${Date.now()}`,
      dishNumber: finalNumber,
      title: dish?.title || locationName || cityName || (finalNumber ? `Dish ${finalNumber}` : 'Midnight Pot'),
      date,
      mood,
      lifeState,
      cooked,
      emotion: {
        hue: mood === 'happy' ? 38 : mood === 'soso' ? 145 : 220,
        text: mood === 'happy' ? 'Happy' : mood === 'soso' ? 'Soso' : 'Sad',
      },
      city: (() => {
        let cleanCity = cityName.trim() || 'Hsinchu';
        let cleanCountry = 'Taiwan';
        if (cleanCity.includes(',')) {
          const parts = cleanCity.split(',').map((s) => s.trim());
          cleanCity = parts[0];
          cleanCountry = parts[1] || 'Taiwan';
        } else if (cleanCity.toLowerCase() === 'tokyo' || cleanCity.toLowerCase() === 'kyoto') {
          cleanCountry = 'Japan';
        } else if (cleanCity.toLowerCase() === 'paris') {
          cleanCountry = 'France';
        } else if (cleanCity.toLowerCase() === 'barcelona' || cleanCity.toLowerCase() === 'madrid') {
          cleanCountry = 'Spain';
        } else if (dish?.city?.country) {
          cleanCountry = dish.city.country;
        }

        return {
          name: cleanCity,
          country: cleanCountry,
          location: cooked ? locationName.trim() : '',
          coords: dish?.city?.coords || { x: 50, y: 50 },
          period: dish?.city?.period || '2026.09 — 2026.11',
        };
      })(),
      note: note.trim() || undefined,
      quote: quote.trim() || undefined,
      image: image.trim() || '',
      igUrl: igUrl.trim() || null,
      youtubeUrl: youtubeUrl.trim() || null,
      songTitle: songTitle.trim() || null,
    };

    onSave(updatedDish);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl text-[#f5f5f5] my-auto max-h-[92vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#888888]">
              {dishNumber ? `No. ${dishNumber}` : ''}
            </span>
            <span className="text-xs text-[#888888] font-mono">
              {date}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && dish && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 rounded-lg text-xs font-medium text-[#888888] hover:text-white border border-[#2a2a2a] hover:border-white transition-colors"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#282828] text-[#888888] hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {!isEditing && dish ? (
            /* VIEW MODE */
            <div className="space-y-6">
              {/* Primary Dish Image (if available or empty upload prompt) */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#262626] shadow-xl bg-[#080808] flex items-center justify-center">
                {dish.image ? (
                  <img
                    src={dish.image}
                    alt={dish.title || 'Dish'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-[#666666] p-8 text-center">
                    <span className="text-xs font-mono">No Image Uploaded</span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-white underline underline-offset-4 hover:text-[#f97316]"
                    >
                      Click Edit to add your photo
                    </button>
                  </div>
                )}
              </div>

              {/* Status Tags: Mood, Life State, Cooked, and View IG Post on the same row */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          dish.cooked !== false
                            ? getMoodColor(dish.mood || 'happy')
                            : 'transparent',
                        border: `1.5px solid ${getMoodColor(dish.mood || 'happy')}`,
                      }}
                    />
                    <span className="capitalize text-[#aaaaaa]">
                      Mood: {dish.mood || 'happy'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1a1a] border border-[#262626] text-[#aaaaaa] capitalize">
                    <span>Life: {dish.lifeState || 'moderate'}</span>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-[#1a1a1a] border border-[#262626] text-[#aaaaaa]">
                    {dish.cooked !== false ? 'Cooked' : 'No Cook'}
                  </div>
                </div>

                {/* View IG Post on the exact same row */}
                {dish.igUrl && (
                  <a
                    href={dish.igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-white text-xs text-white transition-all shadow-sm"
                  >
                    <Instagram className="w-3.5 h-3.5 text-white" />
                    <span>View IG Post</span>
                    <ExternalLink className="w-3 h-3 text-[#666666]" />
                  </a>
                )}
              </div>

              {/* Something about... (Note) */}
              {dish.note && (
                <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-[#666666] font-mono block">
                    Something about...
                  </span>
                  <p className="text-xs sm:text-sm text-[#cccccc] leading-relaxed whitespace-pre-line">
                    {dish.note}
                  </p>
                </div>
              )}

              {/* Connectors: Date, Lived In, Cooked At, and Music (Icons all unified WHITE) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {/* 1. Date */}
                <div
                  onClick={() => {
                    if (onNavigateToYear) onNavigateToYear(dish.date);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-[#161616] border border-[#262626] hover:border-white transition-colors cursor-pointer group flex flex-col justify-between"
                  title="Click to view in Year Map"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] text-[#777777] uppercase font-mono tracking-wider">
                      Date
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-medium">
                      {dish.date}
                    </span>
                    <span className="text-[10px] text-[#aaaaaa] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Year →
                    </span>
                  </div>
                </div>

                {/* 2. Lived In */}
                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#262626] flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Globe className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] text-[#777777] uppercase font-mono tracking-wider">
                      Lived In
                    </span>
                  </div>
                  <span className="text-xs text-white font-medium truncate" title={`${dish.city?.name || 'Hsinchu'}${dish.city?.country ? ', ' + dish.city.country : ''}`}>
                    {dish.city?.name || 'Hsinchu'}
                    {dish.city?.country ? `, ${dish.city.country}` : ''}
                  </span>
                </div>

                {/* 3. Cooked At */}
                <div
                  onClick={() => {
                    if (onNavigateToPlace) {
                      onNavigateToPlace(dish.city?.location || dish.city?.name, dish.city?.name);
                    }
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-[#161616] border border-[#262626] hover:border-white transition-colors cursor-pointer group flex flex-col justify-between"
                  title="Click to explore Cooked At spot in Place Map"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] text-[#777777] uppercase font-mono tracking-wider">
                      Cooked At
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-medium truncate" title={dish.city?.location || dish.city?.name || 'Kitchen'}>
                      {dish.city?.location || dish.city?.name || 'Kitchen'}
                    </span>
                    <span className="text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-1">
                      Place →
                    </span>
                  </div>
                </div>

                {/* 4. Music Preview Item (In-page playback, no external link) */}
                <button
                  type="button"
                  onClick={() => {
                    if (dish.youtubeUrl && dish.youtubeUrl.trim()) {
                      toggleInPageAudio(dish.id, dish.youtubeUrl, (activeId) =>
                        setPlayingAudioId(activeId)
                      );
                    }
                  }}
                  className="p-3.5 rounded-xl bg-[#161616] border border-[#262626] hover:border-white transition-colors cursor-pointer group flex flex-col justify-between text-left"
                  title={playingAudioId === dish.id ? 'Pause music' : 'Play music'}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Music className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] text-[#777777] uppercase font-mono tracking-wider">
                      Music
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-xs text-white font-medium truncate" title={dish.songTitle || 'Midnight Melody'}>
                      {dish.songTitle || 'Midnight Melody'}
                    </span>
                    {Boolean(dish.youtubeUrl && dish.youtubeUrl.trim()) &&
                      (playingAudioId === dish.id ? (
                        <Pause fill="currentColor" className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : (
                        <Play fill="currentColor" className="w-3.5 h-3.5 text-[#aaaaaa] group-hover:text-white shrink-0" />
                      ))}
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* EDIT / CREATE MODE */
            <div className="space-y-4">
              {/* Row 1: Card Number & Date (Card Number 由使用者自行填入) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#888888] block">Card Number</label>
                  <input
                    type="text"
                    value={dishNumber}
                    onChange={(e) => setDishNumber(e.target.value)}
                    placeholder="001"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#888888] block">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Row 2: Mood */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#888888]">Mood</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['happy', 'soso', 'sad'] as MoodType[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all border ${
                        mood === m
                          ? 'bg-[#1e1e1e] border-white text-white font-semibold'
                          : 'bg-[#0a0a0a] border-[#262626] text-[#777777] hover:text-white'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getMoodColor(m) }}
                      />
                      <span className="capitalize">{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: 生活狀態 Busy -> Moderate -> Free (用圓形的大 -> 小表示) & Cook Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Life State: Busy -> Moderate -> Free 用圓形的大 -> 小表示 */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-[#888888]">Life State</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'busy' as LifeStateType, label: 'Busy', dotSize: 'w-3.5 h-3.5' },
                      { id: 'moderate' as LifeStateType, label: 'Moderate', dotSize: 'w-2.5 h-2.5' },
                      { id: 'free' as LifeStateType, label: 'Free', dotSize: 'w-1.5 h-1.5' },
                    ].map(({ id, label, dotSize }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setLifeState(id)}
                        className={`py-2 px-1.5 rounded-lg text-xs capitalize transition-all border flex items-center justify-center gap-1.5 ${
                          lifeState === id
                            ? 'bg-[#1e1e1e] border-white text-white font-semibold'
                            : 'bg-[#0a0a0a] border-[#262626] text-[#777777] hover:text-white'
                        }`}
                        title={`${label} (Circle Size)`}
                      >
                        <span className={`${dotSize} rounded-full bg-current shrink-0`} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cook Status (選項後綴刪除「實心、外框線」) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-[#888888]">Cook Status</label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextCooked = !cooked;
                      setCooked(nextCooked);
                      if (!nextCooked) {
                        setLocationName('');
                      }
                    }}
                    className={`w-full py-2 px-3.5 rounded-lg text-xs border flex items-center justify-between transition-all cursor-pointer ${
                      cooked
                        ? 'bg-[#1e1e1e] border-white text-white'
                        : 'bg-[#0a0a0a] border-[#262626] text-[#888888]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: cooked ? getMoodColor(mood) : 'transparent',
                          border: `1.5px solid ${getMoodColor(mood)}`,
                        }}
                      />
                      <span>{cooked ? 'Cooked' : 'No Cook'}</span>
                    </div>
                    {cooked && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>

              {/* Row 4: Lived In & Cooked At */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#888888]">Lived In</label>
                  <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Hsinchu, Tokyo, Taipei, Paris..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#888888]">
                    Cooked At {!cooked && <span className="text-[10px] text-[#666666]">(Not applicable for No Cook)</span>}
                  </label>
                  <input
                    type="text"
                    value={cooked ? locationName : ''}
                    disabled={!cooked}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder={cooked ? "IAA, NYCU Corner, Shinjuku Loft..." : "No Cook"}
                    className={`w-full px-3.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none focus:border-white transition-opacity ${
                      !cooked ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Row 5: Something about... */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#888888]">Something about...</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record your thoughts, memories, or feelings..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none focus:border-white resize-none"
                />
              </div>

              {/* Row 6: Dish Image */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#888888]">Dish Image</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#181818] border border-[#262626] hover:border-white text-xs text-white cursor-pointer transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Upload your image or paste URL..."
                    className="flex-1 px-3.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none focus:border-white"
                  />
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="px-2 py-2 rounded-lg bg-[#181818] text-[#888888] hover:text-red-400 text-xs"
                      title="Clear image"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Row 7: Instagram Link */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#888888]">Instagram Link</label>
                <input
                  type="text"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  placeholder="https://www.instagram.com/..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              {/* Row 8: Song Title & YouTube Music Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#888888]">Song Title</label>
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="e.g. Midnight Melody"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[#888888]">YouTube Music Link</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#222222]">
                {dish && onDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(dish.id);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
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
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg bg-[#181818] text-xs text-[#888888] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2 rounded-lg bg-white text-black hover:bg-[#eaeaea] text-xs font-semibold shadow-md active:scale-95"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
