import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Globe,
  Instagram,
  ExternalLink,
  Edit3,
  Play,
  Pause,
} from 'lucide-react';
import { DateVibeItem, MoodType, LifeStateType } from '../types';
import {
  playInPageAudio,
  toggleInPageAudio,
  fadeAndStopAudio,
  subscribeAudioState,
} from '../utils/audioPlayer';

interface YearViewProps {
  dishes: DateVibeItem[];
  onSelectDish: (dish: DateVibeItem) => void;
  onAddNewAtDate: (dateStr: string) => void;
  onNavigateToDish: () => void;
}

const MONTH_NAMES = [
  { short: 'JAN', full: 'January', index: 0, days: 31 },
  { short: 'FEB', full: 'February', index: 1, days: 28 },
  { short: 'MAR', full: 'March', index: 2, days: 31 },
  { short: 'APR', full: 'April', index: 3, days: 30 },
  { short: 'MAY', full: 'May', index: 4, days: 31 },
  { short: 'JUN', full: 'June', index: 5, days: 30 },
  { short: 'JUL', full: 'July', index: 6, days: 31 },
  { short: 'AUG', full: 'August', index: 7, days: 31 },
  { short: 'SEP', full: 'September', index: 8, days: 30 },
  { short: 'OCT', full: 'October', index: 9, days: 31 },
  { short: 'NOV', full: 'November', index: 10, days: 30 },
  { short: 'DEC', full: 'December', index: 11, days: 31 },
];

const MOOD_DESCRIPTIONS: Record<MoodType, { title: string}> = {
  happy: {
    title: 'Happy',
  },
  soso: {
    title: 'So-so',
  },
  sad: {
    title: 'Sad',
  },
};

const LIFE_DESCRIPTIONS: Record<LifeStateType, { title: string}> = {
  busy: {
    title: 'Busy',
  },
  moderate: {
    title: 'Moderate',
  },
  free: {
    title: 'Free',
  },
};

// 12-point explosive starburst for Busy life state with outer shockwave waveform outline
export const ExplosiveBurstIcon: React.FC<{
  color: string;
  isCooked: boolean;
  size?: number;
  className?: string;
  showWaveform?: boolean;
}> = ({ color, isCooked, size = 28, className = '', showWaveform = true }) => {
  const points = React.useMemo(() => {
    const pts: string[] = [];
    const numPoints = 12;
    const outerR = 12.5;
    const innerR = 5.5;
    const cx = 14;
    const cy = 14;
    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      className={`shrink-0 overflow-visible transition-transform duration-200 group-hover:scale-115 ${className}`}
    >
      {/* Outer outline exploding waveform shockwave */}
      {showWaveform && (
        <polygon
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="animate-burst-wave pointer-events-none"
        />
      )}
      {/* Main Starburst */}
      <polygon
        points={points}
        fill={isCooked ? color : 'transparent'}
        stroke={color}
        strokeWidth={isCooked ? 0 : 2}
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Reusable glyph renderer for Mood x Life x Cook status
const VibeGlyph: React.FC<{
  mood: MoodType;
  life: LifeStateType;
  isCooked: boolean;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  uniformSize?: number;
}> = ({ life, isCooked, color, size = 'md', uniformSize }) => {
  const glow =
    !uniformSize && isCooked && color.startsWith('#')
      ? `0 0 ${size === 'lg' ? 8 : 6}px ${color}55`
      : 'none';

  if (uniformSize) {
    if (life === 'busy') {
      return (
        <ExplosiveBurstIcon
          color={color}
          isCooked={isCooked}
          size={uniformSize}
          showWaveform={false}
        />
      );
    }
    return (
      <span
        className="rounded-full inline-block shrink-0"
        style={{
          width: uniformSize,
          height: uniformSize,
          backgroundColor: isCooked ? color : 'transparent',
          border: isCooked ? 'none' : `2px solid ${color}`,
        }}
      />
    );
  }

  if (life === 'busy') {
    const px = size === 'sm' ? 18 : size === 'lg' ? 32 : 24;
    return <ExplosiveBurstIcon color={color} isCooked={isCooked} size={px} showWaveform={size === 'lg'} />;
  }
  if (life === 'free') {
    const dim = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-2.5 h-2.5';
    return (
      <span
        className={`${dim} rounded-full inline-block shrink-0`}
        style={{
          backgroundColor: isCooked ? color : 'transparent',
          border: isCooked ? 'none' : `1.5px solid ${color}`,
          boxShadow: glow,
        }}
      />
    );
  }
  const dim = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <span
      className={`${dim} rounded-full inline-block shrink-0`}
      style={{
        backgroundColor: isCooked ? color : 'transparent',
        border: isCooked ? 'none' : `2px solid ${color}`,
        boxShadow: glow,
      }}
    />
  );
};

export const YearView: React.FC<YearViewProps> = ({
  dishes,
  onSelectDish,
  onAddNewAtDate,
}) => {
  const [selectedYear] = useState(2026);
  const [selectedComboId, setSelectedComboId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [playingDishId, setPlayingDishId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAudioState((id) => setPlayingDishId(id));
    return unsub;
  }, []);

  // Map dishes by date 'YYYY-MM-DD'
  const dishesByDate = React.useMemo(() => {
    const map = new Map<string, DateVibeItem>();
    dishes.forEach((d) => {
      if (d.date) {
        map.set(d.date, d);
      }
    });
    return map;
  }, [dishes]);

  const yearDishes = React.useMemo(() => {
    return dishes.filter((d) => d.date?.startsWith(String(selectedYear)));
  }, [dishes, selectedYear]);

  // Complete 3x3 combinations: (Happy, So-so, Sad) x (Busy, Moderate, Free)
  const combinations = React.useMemo(() => [
    {
      id: 'happy-busy',
      mood: 'happy' as MoodType,
      life: 'busy' as LifeStateType,
      label: 'Happy・Busy',
      color: '#f97316',
      shape: 'busy' as const,
      count: yearDishes.filter((d) => (d.mood || 'happy') === 'happy' && d.lifeState === 'busy').length,
    },
    {
      id: 'happy-moderate',
      mood: 'happy' as MoodType,
      life: 'moderate' as LifeStateType,
      label: 'Happy・Moderate',
      color: '#f97316',
      shape: 'moderate' as const,
      count: yearDishes.filter((d) => (d.mood || 'happy') === 'happy' && (d.lifeState === 'moderate' || !d.lifeState)).length,
    },
    {
      id: 'happy-free',
      mood: 'happy' as MoodType,
      life: 'free' as LifeStateType,
      label: 'Happy・Free',
      color: '#f97316',
      shape: 'free' as const,
      count: yearDishes.filter((d) => (d.mood || 'happy') === 'happy' && d.lifeState === 'free').length,
    },
    {
      id: 'soso-busy',
      mood: 'soso' as MoodType,
      life: 'busy' as LifeStateType,
      label: 'So-so・Busy',
      color: '#ffffff',
      shape: 'busy' as const,
      count: yearDishes.filter((d) => d.mood === 'soso' && d.lifeState === 'busy').length,
    },
    {
      id: 'soso-moderate',
      mood: 'soso' as MoodType,
      life: 'moderate' as LifeStateType,
      label: 'So-so・Moderate',
      color: '#ffffff',
      shape: 'moderate' as const,
      count: yearDishes.filter((d) => d.mood === 'soso' && (d.lifeState === 'moderate' || !d.lifeState)).length,
    },
    {
      id: 'soso-free',
      mood: 'soso' as MoodType,
      life: 'free' as LifeStateType,
      label: 'So-so・Free',
      color: '#ffffff',
      shape: 'free' as const,
      count: yearDishes.filter((d) => d.mood === 'soso' && d.lifeState === 'free').length,
    },
    {
      id: 'sad-busy',
      mood: 'sad' as MoodType,
      life: 'busy' as LifeStateType,
      label: 'Sad・Busy',
      color: '#818cf8',
      shape: 'busy' as const,
      count: yearDishes.filter((d) => d.mood === 'sad' && d.lifeState === 'busy').length,
    },
    {
      id: 'sad-moderate',
      mood: 'sad' as MoodType,
      life: 'moderate' as LifeStateType,
      label: 'Sad・Moderate',
      color: '#818cf8',
      shape: 'moderate' as const,
      count: yearDishes.filter((d) => d.mood === 'sad' && (d.lifeState === 'moderate' || !d.lifeState)).length,
    },
    {
      id: 'sad-free',
      mood: 'sad' as MoodType,
      life: 'free' as LifeStateType,
      label: 'Sad・Free',
      color: '#818cf8',
      shape: 'free' as const,
      count: yearDishes.filter((d) => d.mood === 'sad' && d.lifeState === 'free').length,
    },
  ], [yearDishes]);

  // Color mapping: 橘 (happy)、白 (soso)、藍紫色 (sad)
  const getMoodColor = (mood: MoodType | undefined) => {
    switch (mood) {
      case 'happy':
        return '#f97316'; // 橘色
      case 'soso':
        return '#ffffff'; // 白色
      case 'sad':
        return '#818cf8'; // 藍紫色
      default:
        return '#f97316';
    }
  };

  const selectedCombo = React.useMemo(
    () => combinations.find((c) => c.id === selectedComboId) || null,
    [combinations, selectedComboId]
  );

  const selectedDish = React.useMemo(
    () => (selectedDate ? dishesByDate.get(selectedDate) || null : null),
    [selectedDate, dishesByDate]
  );

  const comboMatchingDishes = React.useMemo(() => {
    if (!selectedCombo) return [];
    return yearDishes
      .filter((d) => {
        const dMood = d.mood || 'happy';
        const dLife = d.lifeState || 'moderate';
        return dMood === selectedCombo.mood && dLife === selectedCombo.life;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [yearDishes, selectedCombo]);

  const hasRightPanel = Boolean(selectedCombo || selectedDish);

  const handleToggleCombo = (comboId: string) => {
    if (playingDishId) fadeAndStopAudio(400);
    setSelectedDate(null);
    setSelectedComboId((prev) => (prev === comboId ? null : comboId));
  };

  const handleSelectMatrixDate = (dateStr: string) => {
    const isDeselecting = selectedDate === dateStr;
    setSelectedComboId(null);
    setSelectedDate(isDeselecting ? null : dateStr);

    if (isDeselecting) {
      if (playingDishId) fadeAndStopAudio(350);
      return;
    }

    const dish = dishesByDate.get(dateStr);
    if (dish?.youtubeUrl && dish.youtubeUrl.trim()) {
      playInPageAudio(dish.id, dish.youtubeUrl, (id) => setPlayingDishId(id));
    } else if (playingDishId) {
      fadeAndStopAudio(350);
    }
  };

  const handleCloseRightPanel = () => {
    if (playingDishId) fadeAndStopAudio(400);
    setSelectedComboId(null);
    setSelectedDate(null);
  };

  const isDishMatchingCombo = (dish: DateVibeItem) => {
    if (!selectedCombo) return false;
    const dMood = dish.mood || 'happy';
    const dLife = dish.lifeState || 'moderate';
    return dMood === selectedCombo.mood && dLife === selectedCombo.life;
  };

  const AudioBarsIcon: React.FC<{ isPlaying?: boolean }> = ({ isPlaying }) => (
    <span className="inline-flex items-end gap-0.5 h-3.5 w-3.5 px-0.5 shrink-0">
      <span
        className={`w-0.5 rounded-full bg-white ${isPlaying ? 'animate-bounce h-3' : 'h-1.5'}`}
        style={{ animationDuration: '0.6s' }}
      />
      <span
        className={`w-0.5 rounded-full bg-white ${isPlaying ? 'animate-bounce h-3.5' : 'h-3'}`}
        style={{ animationDuration: '0.4s', animationDelay: '0.1s' }}
      />
      <span
        className={`w-0.5 rounded-full bg-white ${isPlaying ? 'animate-bounce h-2.5' : 'h-2'}`}
        style={{ animationDuration: '0.5s', animationDelay: '0.2s' }}
      />
    </span>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col space-y-8 animate-fadeIn text-[#f5f5f5] font-sans">
      {/* 1. Header: 2026 大標與簡短文字說明，右側上方為可點選的 3x3 篩選 Icon */}
      <header className="sticky top-14 z-40 bg-[#080808]/95 backdrop-blur-md py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 transition-all border-b border-white/5">
        <div className="space-y-1.5">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-[#ffffff] leading-none">
            {selectedYear}
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] font-normal leading-relaxed">
            An emotional map of the "TIME"!
          </p>
        </div>

        {/* Year Summary: 3x3 = 9 Combination Icons + Recorded Days below when nothing selected */}
        <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1.5 shrink-0">
          <div className="w-full grid grid-cols-9 justify-items-center items-center py-2 sm:flex sm:w-auto sm:gap-2 sm:justify-end">
            {combinations.map((c) => {
              const isActiveCombo = selectedComboId === c.id;
              const isDimmedCombo = Boolean(selectedComboId) && !isActiveCombo;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleToggleCombo(c.id)}
                  aria-pressed={isActiveCombo}
                  className={`group relative flex items-center justify-center cursor-pointer transition-all duration-200 p-1 ${
                    isActiveCombo
                      ? 'opacity-100 scale-115'
                      : isDimmedCombo
                      ? 'opacity-25 hover:opacity-100 hover:scale-115'
                      : 'opacity-100 hover:scale-125'
                  }`}
                  title={`${c.label} (${c.count})`}
                >
                  {/* Tooltip on hover: e.g. Happy・Busy */}
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#18181c] border border-white/20 text-white text-[11px] font-sans font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-2xl z-50 drop-shadow-lg">
                    {c.label}
                  </div>

                  {c.shape === 'busy' ? (
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <ExplosiveBurstIcon
                        color={c.color}
                        isCooked={true}
                        size={30}
                        className="animate-busy-pulse"
                        showWaveform={true}
                      />
                      <span
                        className="absolute inset-0 flex items-center justify-center font-mono tabular-nums font-extrabold text-[11px] z-10 pointer-events-none"
                        style={{ color: c.color === '#ffffff' ? '#000000' : '#ffffff' }}
                      >
                        {c.count}
                      </span>
                    </div>
                  ) : c.shape === 'moderate' ? (
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center font-mono tabular-nums font-extrabold text-[11px] shadow-sm select-none animate-moderate-breathe"
                      style={{
                        backgroundColor: c.color,
                        color: c.color === '#ffffff' ? '#000000' : '#ffffff',
                      }}
                    >
                      {c.count}
                    </span>
                  ) : (
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center font-mono tabular-nums font-extrabold text-[11px] shadow-sm select-none animate-free-drift"
                      style={{
                        backgroundColor: c.color,
                        color: c.color === '#ffffff' ? '#000000' : '#ffffff',
                      }}
                    >
                      {c.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {!hasRightPanel && (
            <p className="text-xs text-[#888888] font-mono tabular-nums sm:text-right">
              {yearDishes.length} Recorded Days in {selectedYear}
            </p>
          )}
        </div>
      </header>

      {/* 2. Main Split Area: Left Matrix + Optional Appearing Right Panel */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          hasRightPanel
            ? selectedDish
              ? 'lg:grid-cols-12 lg:items-stretch'
              : 'lg:grid-cols-12 items-start'
            : 'items-start'
        }`}
      >
        {/* LEFT: Emotional Map Grid (行 = 月份、欄 = 日期) */}
        <section
          className={`order-2 lg:order-1 w-full bg-[#111111] border border-[#222222] rounded-2xl shadow-2xl relative min-h-[480px] transition-all ${
            hasRightPanel ? 'lg:col-span-8 p-4 sm:p-6' : 'p-4 sm:p-8'
          }`}
        >
          {/* Landscape Wide Matrix (Desktop) */}
          <div
            className={`hidden lg:flex flex-col space-y-3 pt-2 w-full ${
              hasRightPanel ? '' : 'min-w-[820px]'
            }`}
          >
            {/* Days Column Header */}
            <div
              className={`grid items-center text-center text-xs text-[#888888] font-mono tabular-nums pb-2 border-b border-[#1f1f1f] ${
                hasRightPanel
                  ? 'grid-cols-[44px_repeat(31,minmax(0,1fr))]'
                  : 'grid-cols-[56px_repeat(31,minmax(0,1fr))]'
              }`}
            >
              <div className="text-left font-sans text-xs text-[#888888]">
                Month
              </div>
              {Array.from({ length: 31 }).map((_, i) => (
                <div key={i + 1} className="text-[#888888] text-[11px]">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Month Rows (行 = 月份、欄 = 日期) */}
            <div className="space-y-2">
              {MONTH_NAMES.map((m) => {
                const monthPadded = String(m.index + 1).padStart(2, '0');

                return (
                  <div
                    key={m.short}
                    className={`grid items-center text-center py-1 rounded-lg hover:bg-[#181818]/70 transition-colors ${
                      hasRightPanel
                        ? 'grid-cols-[44px_repeat(31,minmax(0,1fr))]'
                        : 'grid-cols-[56px_repeat(31,minmax(0,1fr))]'
                    }`}
                  >
                    {/* Month Label */}
                    <div className="text-left text-xs text-[#888888] font-medium tracking-wide">
                      {m.short}
                    </div>

                    {/* 31 Days Columns */}
                    {Array.from({ length: 31 }).map((_, dayIdx) => {
                      const dayNum = dayIdx + 1;
                      const isValidDay = dayNum <= m.days;

                      if (!isValidDay) {
                        return (
                          <div
                            key={`empty-${m.short}-${dayNum}`}
                            className="w-full flex items-center justify-center opacity-10 h-7"
                          >
                            <div className="w-1 h-1 rounded-full bg-[#333333]" />
                          </div>
                        );
                      }

                      const dayPadded = String(dayNum).padStart(2, '0');
                      const dateStr = `${selectedYear}-${monthPadded}-${dayPadded}`;
                      const dish = dishesByDate.get(dateStr);
                      const hasDish = Boolean(dish);

                      if (hasDish && dish) {
                        const moodColor = getMoodColor(dish.mood);
                        const isCooked = dish.cooked !== false;
                        const lifeState = dish.lifeState || 'moderate';

                        const isComboMatched = selectedCombo ? isDishMatchingCombo(dish) : false;
                        const isDateSelected = selectedDate === dateStr;
                        const isDimmed =
                          (Boolean(selectedCombo) && !isComboMatched) ||
                          (Boolean(selectedDate) && !isDateSelected);

                        return (
                          <div
                            key={dateStr}
                            className={`w-full flex items-center justify-center h-7 relative transition-opacity duration-300 ${
                              isDimmed ? 'opacity-20 hover:opacity-75' : 'opacity-100'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectMatrixDate(dateStr)}
                              title={`${dateStr} · ${dish.mood || 'happy'} · ${lifeState}`}
                              className="flex items-center justify-center transition-transform duration-200 cursor-pointer hover:scale-125"
                            >
                              {lifeState === 'busy' ? (
                                <ExplosiveBurstIcon
                                  color={moodColor}
                                  isCooked={isCooked}
                                  size={hasRightPanel ? 20 : 26}
                                  className="animate-busy-pulse"
                                  showWaveform={!isDimmed}
                                />
                              ) : lifeState === 'moderate' ? (
                                <span
                                  className={`${
                                    hasRightPanel ? 'w-3 h-3' : 'w-3.5 h-3.5'
                                  } rounded-full block transition-transform animate-moderate-breathe`}
                                  style={{
                                    backgroundColor: isCooked ? moodColor : 'transparent',
                                    border: isCooked ? 'none' : `2px solid ${moodColor}`,
                                    boxShadow: isCooked ? `0 0 6px ${moodColor}66` : 'none',
                                  }}
                                />
                              ) : (
                                <span
                                  className="w-2 h-2 rounded-full block transition-transform animate-free-drift"
                                  style={{
                                    backgroundColor: isCooked ? moodColor : 'transparent',
                                    border: isCooked ? 'none' : `1.5px solid ${moodColor}`,
                                    boxShadow: isCooked ? `0 0 4px ${moodColor}55` : 'none',
                                  }}
                                />
                              )}
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={dateStr}
                          className={`w-full flex items-center justify-center h-7 transition-opacity duration-300 ${
                            selectedCombo || selectedDate ? 'opacity-20' : 'opacity-100'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onAddNewAtDate(dateStr)}
                            className="w-2.5 h-2.5 rounded-full border border-[#2c2c2c] hover:border-[#666666] hover:scale-125 transition-all flex items-center justify-center cursor-pointer"
                            title={`${dateStr} (Click to record)`}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Portrait Matrix (Mobile / Tablet Portrait) */}
          <div className="block lg:hidden w-full flex flex-col space-y-2 pt-1">
            {/* Header Row: Date on left, 12 Months across */}
            <div className="grid grid-cols-[32px_repeat(12,1fr)] items-center text-center text-[11px] sm:text-xs text-[#888888] font-mono tabular-nums pb-2.5 border-b border-[#1f1f1f]">
              <div className="text-left font-sans text-[11px] sm:text-xs text-[#888888] font-medium">
                Date
              </div>
              {MONTH_NAMES.map((m) => (
                <div
                  key={m.short}
                  className="text-[#a1a1aa] text-xs font-sans font-medium tracking-tight"
                  title={m.full}
                >
                  {m.short.charAt(0)}
                </div>
              ))}
            </div>

            {/* 31 Date Rows */}
            <div className="space-y-1">
              {Array.from({ length: 31 }).map((_, dayIdx) => {
                const dayNum = dayIdx + 1;
                const dayPadded = String(dayNum).padStart(2, '0');

                return (
                  <div
                    key={`portrait-row-${dayNum}`}
                    className="grid grid-cols-[32px_repeat(12,1fr)] items-center text-center py-0.5 rounded hover:bg-[#181818] transition-colors"
                  >
                    {/* Date Label */}
                    <div className="text-left text-[10px] font-mono tabular-nums text-[#888888]">
                      {dayNum}
                    </div>

                    {/* 12 Month Columns */}
                    {MONTH_NAMES.map((m) => {
                      const isValidDay = dayNum <= m.days;
                      const monthPadded = String(m.index + 1).padStart(2, '0');
                      const dateStr = `${selectedYear}-${monthPadded}-${dayPadded}`;

                      if (!isValidDay) {
                        return (
                          <div
                            key={`empty-${m.short}-${dayNum}`}
                            className="w-full flex items-center justify-center opacity-10 h-6"
                          >
                            <div className="w-1 h-1 rounded-full bg-[#333333]" />
                          </div>
                        );
                      }

                      const dish = dishesByDate.get(dateStr);
                      const hasDish = Boolean(dish);

                      if (hasDish && dish) {
                        const moodColor = getMoodColor(dish.mood);
                        const isCooked = dish.cooked !== false;
                        const lifeState = dish.lifeState || 'moderate';

                        const isComboMatched = selectedCombo ? isDishMatchingCombo(dish) : false;
                        const isDateSelected = selectedDate === dateStr;
                        const isDimmed =
                          (Boolean(selectedCombo) && !isComboMatched) ||
                          (Boolean(selectedDate) && !isDateSelected);

                        return (
                          <div
                            key={dateStr}
                            className={`w-full flex items-center justify-center h-6 relative transition-opacity duration-300 ${
                              isDimmed ? 'opacity-20' : 'opacity-100'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectMatrixDate(dateStr)}
                              className="flex items-center justify-center transition-transform cursor-pointer hover:scale-125"
                            >
                              {lifeState === 'busy' ? (
                                <ExplosiveBurstIcon
                                  color={moodColor}
                                  isCooked={isCooked}
                                  size={20}
                                  className="animate-busy-pulse"
                                  showWaveform={!isDimmed}
                                />
                              ) : lifeState === 'moderate' ? (
                                <span
                                  className="w-3 h-3 rounded-full block animate-moderate-breathe"
                                  style={{
                                    backgroundColor: isCooked ? moodColor : 'transparent',
                                    border: isCooked ? 'none' : `1.5px solid ${moodColor}`,
                                  }}
                                />
                              ) : (
                                <span
                                  className="w-2 h-2 rounded-full block animate-free-drift"
                                  style={{
                                    backgroundColor: isCooked ? moodColor : 'transparent',
                                    border: isCooked ? 'none' : `1.5px solid ${moodColor}`,
                                  }}
                                />
                              )}
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={dateStr}
                          className={`w-full flex items-center justify-center h-6 transition-opacity duration-300 ${
                            selectedCombo || selectedDate ? 'opacity-20' : 'opacity-100'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onAddNewAtDate(dateStr)}
                            className="w-2 h-2 rounded-full border border-[#2c2c2c] hover:border-[#666666] transition-all flex items-center justify-center cursor-pointer"
                            title={`${dateStr} (Click to record)`}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT SIDE PANEL: Mode 1 (Combination Explanation) OR Mode 2 (Single Date Record) */}
        {hasRightPanel && (
          <aside
            className={`order-1 lg:order-2 lg:col-span-4 w-full bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-2xl animate-fadeIn flex flex-col ${
              selectedDish ? 'lg:h-full' : 'lg:sticky lg:top-48 space-y-6'
            }`}
          >
            {selectedDish ? (
              /* MODE 2: SINGLE DATE RECORD DETAILS */
              (() => {
                const dMood: MoodType = selectedDish.mood || 'happy';
                const dLife: LifeStateType = selectedDish.lifeState || 'moderate';
                const dCooked = selectedDish.cooked !== false;
                const dColor = getMoodColor(dMood);
                const moodTitle = MOOD_DESCRIPTIONS[dMood].title;
                const lifeTitle = LIFE_DESCRIPTIONS[dLife].title;
                const isAudioPlaying = playingDishId === selectedDish.id;

                return (
                  <div className="flex-1 flex flex-col justify-between gap-6">
                    <div className="space-y-5">
                    {/* Header: No., Date, Edit & Close */}
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-[#888888] font-mono tabular-nums">
                          <span>{selectedDish.date}</span>
                          {selectedDish.dishNumber && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>No. {selectedDish.dishNumber}</span>
                            </>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight leading-snug break-words">
                          {selectedDish.title || (selectedDish.dishNumber ? `Dish No. ${selectedDish.dishNumber}` : 'Midnight Record')}
                        </h2>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelectDish(selectedDish)}
                          className="p-2 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Edit record"
                          aria-label="Edit record"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseRightPanel}
                          className="p-2 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Close and return to Year summary"
                          aria-label="Close panel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Dish Photo (if present) */}
                    {selectedDish.image ? (
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#0a0a0c]">
                        <img
                          src={selectedDish.image}
                          alt={selectedDish.title || 'Dish'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : null}

                    {/* Clean Unboxed Status Metadata */}
                    <div className="flex items-center gap-3 text-xs text-[#cccccc]">
                      <VibeGlyph
                        mood={dMood}
                        life={dLife}
                        isCooked={dCooked}
                        color={dColor}
                        size="md"
                      />
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-white">{moodTitle}</span>
                        <span className="text-[#666666]" aria-hidden="true">·</span>
                        <span>{lifeTitle}</span>
                        <span className="text-[#666666]" aria-hidden="true">·</span>
                        <span className="text-[#a1a1aa]">{dCooked ? 'Cooked' : 'No Cook'}</span>
                      </div>
                    </div>

                    {/* Quote */}
                    {selectedDish.quote && (
                      <p className="text-xs italic text-[#a1a1aa] leading-relaxed">
                        “{selectedDish.quote}”
                      </p>
                    )}

                    {/* Note */}
                    {selectedDish.note && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <span className="text-[11px] text-[#777777] font-medium block">
                          Something about...
                        </span>
                        <p className="text-xs sm:text-[13px] text-[#d4d4d8] leading-relaxed whitespace-pre-line">
                          {selectedDish.note}
                        </p>
                      </div>
                    )}

                    {/* Place & Links */}
                    <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-[#888888]">
                          <Globe className="w-3.5 h-3.5 text-white/70" />
                          <span>Lived In</span>
                        </span>
                        <span className="text-white font-medium text-right truncate">
                          {selectedDish.city?.name || 'Hsinchu'}
                          {selectedDish.city?.country ? `, ${selectedDish.city.country}` : ''}
                        </span>
                      </div>

                      {dCooked && selectedDish.city?.location && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-2 text-[#888888]">
                            <MapPin className="w-3.5 h-3.5 text-white/70" />
                            <span>Cooked At</span>
                          </span>
                          <span className="text-white font-medium text-right truncate">
                            {selectedDish.city.location}
                          </span>
                        </div>
                      )}

                      {Boolean(selectedDish.youtubeUrl && selectedDish.youtubeUrl.trim()) && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleInPageAudio(selectedDish.id, selectedDish.youtubeUrl, (id) =>
                              setPlayingDishId(id)
                            )
                          }
                          className="w-full flex items-center justify-between gap-3 pt-1 text-left group cursor-pointer"
                          title={isAudioPlaying ? 'Pause music' : 'Play music'}
                        >
                          <span className="inline-flex items-center gap-2 text-[#888888] group-hover:text-white transition-colors shrink-0">
                            <AudioBarsIcon isPlaying={isAudioPlaying} />
                            <span>Music</span>
                          </span>
                          <span className="inline-flex items-center gap-2 text-white font-medium min-w-0">
                            <span className="truncate max-w-[180px]">
                              {selectedDish.songTitle || 'Midnight Melody'}
                            </span>
                            {isAudioPlaying ? (
                              <Pause fill="currentColor" className="w-3.5 h-3.5 text-white shrink-0" />
                            ) : (
                              <Play fill="currentColor" className="w-3.5 h-3.5 text-[#a1a1aa] group-hover:text-white shrink-0" />
                            )}
                          </span>
                        </button>
                      )}

                      {selectedDish.igUrl && (
                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="inline-flex items-center gap-2 text-[#888888]">
                            <Instagram className="w-3.5 h-3.5 text-white/70" />
                            <span>Post</span>
                          </span>
                          <a
                            href={selectedDish.igUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-white/90 hover:text-white hover:underline transition-colors"
                          >
                            <span>View on Instagram</span>
                            <ExternalLink className="w-3 h-3 text-[#888888]" />
                          </a>
                        </div>
                      )}
                    </div>

                    </div>

                    {/* Footer action: Back to Year anchored at the bottom */}
                    <div className="pt-4 mt-auto border-t border-white/10 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleCloseRightPanel}
                        className="px-3 py-1.5 rounded-lg text-xs text-[#888888] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Back to Year
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : selectedCombo ? (
              /* MODE 1: COMBINATION FILTER EXPLANATION PANEL */
              (() => {
                const moodInfo = MOOD_DESCRIPTIONS[selectedCombo.mood];
                const lifeInfo = LIFE_DESCRIPTIONS[selectedCombo.life];
                const cookedCount = comboMatchingDishes.filter((d) => d.cooked !== false).length;
                const noCookCount = comboMatchingDishes.length - cookedCount;

                return (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3.5">
                        <VibeGlyph
                          mood={selectedCombo.mood}
                          life={selectedCombo.life}
                          isCooked={true}
                          color={selectedCombo.color}
                          size="lg"
                        />
                        <div className="space-y-0.5">
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            {selectedCombo.label}
                          </h2>
                          <p className="text-xs text-[#888888] font-mono tabular-nums">
                            {comboMatchingDishes.length}{' '}
                            {comboMatchingDishes.length === 1 ? 'record' : 'records'} in {selectedYear}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCloseRightPanel}
                        className="p-2 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                        title="Clear filter"
                        aria-label="Clear filter"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Explanation Breakdown: Mood, Life, Cook, No Cook in unified 2x2 grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 flex items-center justify-center shrink-0">
                          <VibeGlyph
                            mood={selectedCombo.mood}
                            life={selectedCombo.life}
                            isCooked={true}
                            color={selectedCombo.color}
                            size="sm"
                          />
                        </span>
                        <span className="font-semibold text-white truncate">
                          Mood: {moodInfo.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 flex items-center justify-center shrink-0">
                          <VibeGlyph
                            mood={selectedCombo.mood}
                            life={selectedCombo.life}
                            isCooked={true}
                            color={selectedCombo.color}
                            size="sm"
                          />
                        </span>
                        <span className="font-semibold text-white truncate">
                          Life: {lifeInfo.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 flex items-center justify-center shrink-0 opacity-50">
                          <VibeGlyph
                            mood={selectedCombo.mood}
                            life={selectedCombo.life}
                            isCooked={true}
                            color={selectedCombo.color}
                            size="sm"
                          />
                        </span>
                        <span className="font-semibold text-white font-mono tabular-nums truncate">
                          Cook: {cookedCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 flex items-center justify-center shrink-0 opacity-50">
                          <VibeGlyph
                            mood={selectedCombo.mood}
                            life={selectedCombo.life}
                            isCooked={false}
                            color={selectedCombo.color}
                            size="sm"
                          />
                        </span>
                        <span className="font-semibold text-white font-mono tabular-nums truncate">
                          No Cook: {noCookCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : null}
          </aside>
        )}
      </div>
    </div>
  );
};
