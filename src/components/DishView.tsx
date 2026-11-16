import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { DateVibeItem, MoodType } from '../types';

import EMPTY_PLATE_IMAGE from '../assets/images/dish_empty_plate.png';
import {
  playInPageAudio,
  toggleInPageAudio,
  fadeAndStopAudio,
  subscribeAudioState,
} from '../utils/audioPlayer';

interface DishViewProps {
  dishes: DateVibeItem[];
  onSelectDish: (dish: DateVibeItem) => void;
  onAddNewDish: () => void;
  onNavigateToYear: (dateStr?: string) => void;
  onNavigateToPlace: (cityName?: string) => void;
}

export const DishView: React.FC<DishViewProps> = ({
  dishes,
  onSelectDish,
  onAddNewDish,
}) => {
  const [filterType, setFilterType] = useState<string>('all'); // 'all', 'cook', 'nocook'
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [playingDishId, setPlayingDishId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAudioState((id) => setPlayingDishId(id));
    return unsub;
  }, []);

  const filteredDishes = React.useMemo(() => {
    const list = dishes.filter((d) => {
      if (filterType === 'cook') return d.cooked !== false;
      if (filterType === 'nocook') return d.cooked === false;
      return true;
    });
    // 日期順序由下往上：最新在最上方，越往下日期越早 (b.date.localeCompare(a.date))
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [dishes, filterType]);

  const getMoodColor = (mood?: MoodType) => {
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

  const toggleFlip = (id: string) => {
    const isCurrentlyFlipped = flippedIds.has(id);
    if (isCurrentlyFlipped) {
      if (playingDishId === id) {
        fadeAndStopAudio(400);
      }
      setFlippedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      const dish = dishes.find((d) => d.id === id);
      if (dish?.youtubeUrl && dish.youtubeUrl.trim()) {
        playInPageAudio(dish.id, dish.youtubeUrl, (activeId) => setPlayingDishId(activeId));
      } else if (playingDishId && playingDishId !== id) {
        fadeAndStopAudio(400);
      }
      setFlippedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  const handleFilterChange = (nextFilter: string) => {
    if (playingDishId) fadeAndStopAudio(400);
    setFlippedIds(new Set());
    setFilterType(nextFilter);
  };

  const handleJumpToFilter = (targetFilter: 'cook' | 'nocook', dishId: string) => {
    if (playingDishId) fadeAndStopAudio(400);
    setFlippedIds(new Set());
    setFilterType(targetFilter);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-dish-id="${dishId}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  };

  // Dynamic Audio Bars Equalizer Icon
  const AudioBarsIcon: React.FC<{ isPlaying?: boolean; isDarkText?: boolean }> = ({
    isPlaying,
    isDarkText,
  }) => {
    return (
      <span className="inline-flex items-end gap-0.5 h-3.5 w-3.5 px-0.5 shrink-0">
        <span
          className={`w-0.5 rounded-full ${
            isDarkText ? 'bg-black' : 'bg-white'
          } ${isPlaying ? 'animate-bounce h-3' : 'h-1.5'}`}
          style={{ animationDuration: '0.6s' }}
        />
        <span
          className={`w-0.5 rounded-full ${
            isDarkText ? 'bg-black' : 'bg-white'
          } ${isPlaying ? 'animate-bounce h-3.5' : 'h-3'}`}
          style={{ animationDuration: '0.4s', animationDelay: '0.1s' }}
        />
        <span
          className={`w-0.5 rounded-full ${
            isDarkText ? 'bg-black' : 'bg-white'
          } ${isPlaying ? 'animate-bounce h-2.5' : 'h-2'}`}
          style={{ animationDuration: '0.5s', animationDelay: '0.2s' }}
        />
      </span>
    );
  };

  const handleAudioToggleClick = (
    e: React.MouseEvent,
    dishId: string,
    youtubeUrl?: string | null
  ) => {
    e.stopPropagation();
    toggleInPageAudio(dishId, youtubeUrl, (activeId: string | null) => setPlayingDishId(activeId));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col space-y-8 animate-fadeIn text-[#f5f5f5] font-sans">
      {/* 1. Header: Dish 大標與簡短文字說明，滑動時不消失 */}
      <header className="sticky top-14 z-40 bg-[#080808]/95 backdrop-blur-md py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 transition-all border-b border-white/5">
        <div className="space-y-1.5">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-[#ffffff] leading-none">
            Dish
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] font-normal max-w-xl leading-relaxed">
            Without a recipe, but “TASTE” always with a feeling...
          </p>
        </div>

        {/* Filter Controls (All / Cook / No cook) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center p-1 rounded-xl bg-[#141414] border border-[#242424] text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'cook', label: 'Cook' },
              { id: 'nocook', label: 'No Cook' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFilterChange(f.id)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  filterType === f.id
                    ? 'bg-[#ffffff] text-[#000000] font-semibold shadow-sm'
                    : 'text-[#888888] hover:text-[#ffffff]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. Grid of Flip Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredDishes.map((item) => {
          const isCooked = item.cooked !== false;
          const isAllView = filterType === 'all';
          const isFlipped = !isAllView && flippedIds.has(item.id);
          const showEmptyPlateFront = isAllView || !isCooked;
          const moodColor = getMoodColor(item.mood);
          const isSosoCooked = isCooked && item.mood === 'soso';

          return (
            <div
              key={item.id}
              data-dish-id={item.id}
              onMouseEnter={() => {
                if (!isAllView) {
                  toggleFlip(item.id);
                }
              }}
              onClick={() => {
                if (isAllView) {
                  handleJumpToFilter(isCooked ? 'cook' : 'nocook', item.id);
                } else {
                  toggleFlip(item.id);
                }
              }}
              className="relative aspect-[3/4] w-full rounded-2xl group select-none cursor-pointer scroll-mt-36"
              style={{ perspective: '1000px' }}
            >
              {/* Flip Container */}
              <div
                className="w-full h-full relative transition-transform duration-500 rounded-2xl"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* FRONT FACE: Only plate photo (no border, shadow, or bg) for All & No cook; photo card for Cook */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center transition-colors ${
                    showEmptyPlateFront
                      ? 'bg-transparent border-0 shadow-none'
                      : 'overflow-hidden bg-[#141414] border border-[#282828] group-hover:border-white/50 shadow-2xl'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {showEmptyPlateFront ? (
                    <img
                      src={EMPTY_PLATE_IMAGE}
                      alt="Empty dish plate"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || 'Dish'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#161618] flex items-center justify-center" />
                  )}
                </div>

                {/* BACK FACE: Clean layout, Music link only if present (disabled in All tab) */}
                {!isAllView && (
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between text-left shadow-2xl transition-colors select-none"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      backgroundColor: isCooked ? moodColor : '#121212',
                      border: isCooked ? 'none' : `3px solid ${moodColor}`,
                      color: isSosoCooked ? '#111111' : '#ffffff',
                    }}
                  >
                    {/* Top: No. with Date & Music underneath, all left-aligned */}
                    <div className="flex flex-col items-start text-left w-full space-y-1.5">
                      {/* No. */}
                      {Boolean(item.dishNumber) && (
                        <span className="font-sans text-4xl sm:text-5xl font-black tracking-tighter leading-none select-none">
                          No. {item.dishNumber}
                        </span>
                      )}

                      {/* Date and Music underneath No., left-aligned */}
                      <div className="flex flex-col items-start text-left space-y-1 pt-0.5">
                        {/* Date */}
                        <span className="font-sans text-xs sm:text-sm opacity-85 font-medium leading-none">
                          {item.date}
                        </span>

                        {/* Music in-page play/pause if present (no external hyperlink) */}
                        {Boolean(item.youtubeUrl && item.youtubeUrl.trim()) && (
                          <button
                            type="button"
                            onClick={(e) => handleAudioToggleClick(e, item.id, item.youtubeUrl)}
                            className={`inline-flex items-center justify-start gap-2 text-xs pt-0.5 font-semibold transition-all cursor-pointer max-w-full ${
                              isSosoCooked
                                ? 'text-black/90 hover:text-black'
                                : 'text-white/90 hover:text-white'
                            }`}
                            title={playingDishId === item.id ? 'Pause Music' : 'Play Music'}
                          >
                            <AudioBarsIcon
                              isPlaying={playingDishId === item.id}
                              isDarkText={isSosoCooked}
                            />
                            <span className="truncate max-w-[180px] sm:max-w-[210px]">
                              {item.songTitle || 'Midnight Melody'}
                            </span>
                            {playingDishId === item.id ? (
                              <Pause fill="currentColor" className="w-3 h-3 opacity-85 shrink-0" />
                            ) : (
                              <Play fill="currentColor" className="w-3 h-3 opacity-75 shrink-0" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Note without Edit button */}
                    <div className="w-full pt-3 text-left">
                      <p
                        className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line break-words max-h-36 overflow-y-auto scrollbar-thin w-full"
                        style={{
                          color: isSosoCooked ? '#111111' : '#ffffff',
                        }}
                      >
                        {item.note || ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

      </section>
    </div>
  );
};
