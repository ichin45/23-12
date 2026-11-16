import React, { useState, useMemo } from 'react';
import { DateVibeItem } from '../types';
import { getVibeColor, getEmotionEmoji } from '../utils/visualPreset';
import { formatShortDateBadge } from '../utils/calendar';
import {
  ArrowUpDown,
  Plus,
} from 'lucide-react';

interface EmotionMapViewProps {
  items: DateVibeItem[];
  onSelectItem: (item: DateVibeItem) => void;
  onAddNew: () => void;
}

export const EmotionMapView: React.FC<EmotionMapViewProps> = ({
  items,
  onSelectItem,
  onAddNew,
}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Sort items by date
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const cmp = (a.date || '').localeCompare(b.date || '');
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [items, sortOrder]);

  // Click on Emoji: 點擊 Emoji 一樣連結至 IG Post 頁面
  const handleEmojiClick = (e: React.MouseEvent, item: DateVibeItem) => {
    e.stopPropagation();
    const url = item.igUrl || 'https://www.instagram.com';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20 select-none animate-fadeIn">
      {/* 1. Header: Meal Emotion Map */}
      <header className="flex items-center justify-between pb-2 border-b border-neutral-900">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Meal Emotion Map
          </h2>
          <span className="text-xs font-mono text-neutral-400 mt-0.5 block">
            {items.length} records · Continuous Color Spectrum
          </span>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all text-xs font-mono"
            title="Toggle Date Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {sortOrder === 'asc' ? 'Date ↑' : 'Date ↓'}
            </span>
          </button>

          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 transition-all text-xs font-semibold shadow-md active:scale-95"
            title="Add New Entry"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </header>

      {/* 2. Emotion Map: City 與 Date 間距近，讓光譜變長；上面只需顯示 City, Date；光譜小字不顯示 */}
      <section className="flex flex-col rounded-3xl bg-neutral-950 border border-neutral-800/90 overflow-hidden shadow-2xl">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <div className="min-w-[700px] p-4 sm:p-6 flex flex-col">
            {/* Top Header: 上面只需顯示 City, Date */}
            <div className="grid grid-cols-[100px_48px_1fr] sm:grid-cols-[120px_54px_1fr] items-center pb-3 border-b border-neutral-800/80">
              {/* City (置左) */}
              <div className="text-[11px] font-mono text-neutral-400 tracking-wider pl-1 text-left uppercase">
                City
              </div>

              {/* Date (緊鄰 City 右側，間距近) */}
              <div className="text-[11px] font-mono text-neutral-400 tracking-wider text-left uppercase">
                Date
              </div>

              {/* Rainbow Spectrum Ribbon Header (光譜下面的小字不用顯示) */}
              <div className="relative flex items-center pl-3 pr-3">
                <div
                  className="w-full h-2 rounded-full relative shadow-inner overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(to right, #ff0000 0%, #ff8800 12.5%, #ffff00 25%, #00ff00 37.5%, #00ffff 50%, #0077ff 62.5%, #aa00ff 75%, #ff0077 87.5%, #ff0000 100%)',
                  }}
                />
              </div>
            </div>

            {/* Matrix Rows: City, Date 間距近、光譜更長、行距再小一點點 */}
            <div className="relative flex flex-col divide-y divide-neutral-900/50">
              {sortedItems.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
                  <p className="text-sm text-neutral-400">
                    No entries yet. Click &quot;Add&quot; to log your first meal vibe.
                  </p>
                </div>
              ) : (
                sortedItems.map((item) => {
                  const { day, month } = formatShortDateBadge(item.date);
                  const itemColor = getVibeColor(item);
                  const hue = ((item.emotion?.hue ?? 205) % 360 + 360) % 360;
                  const spectrumPercent = (hue / 360) * 100;
                  const isHovered = hoveredItemId === item.id;

                  // Emotion Emoji
                  const fallbackInfo = getEmotionEmoji(item.emotion?.text, hue);
                  const itemEmoji = item.emotion?.emoji || fallbackInfo.emoji;

                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-[100px_48px_1fr] sm:grid-cols-[120px_54px_1fr] items-center py-1 sm:py-1.5 transition-colors relative group cursor-pointer ${
                        isHovered ? 'bg-neutral-900/40' : 'hover:bg-neutral-900/20'
                      }`}
                      onMouseEnter={() => setHoveredItemId(item.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                      onClick={() => onSelectItem(item)}
                    >
                      {/* 1. City + Location (緊湊置左) */}
                      <div className="flex flex-col text-left truncate pl-1 pr-1.5 min-w-0">
                        <span className="text-xs font-bold text-white truncate leading-tight">
                          {item.city?.name || 'City'}
                        </span>
                        {item.city?.location && (
                          <span className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">
                            {item.city.location}
                          </span>
                        )}
                      </div>

                      {/* 2. Date Badge (大字一點、緊湊) */}
                      <div className="flex items-center text-left">
                        <div className="px-1.5 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex flex-col items-center justify-center min-w-[32px] leading-none shadow-sm">
                          <span className="text-xs font-black font-mono text-white leading-none">
                            {day}
                          </span>
                          <span className="text-[7px] font-semibold text-neutral-400 uppercase tracking-wider mt-0.5">
                            {month}
                          </span>
                        </div>
                      </div>

                      {/* 3. Spectrum Track (更長的光譜軌道) */}
                      <div className="relative h-8 sm:h-9 flex items-center pl-3 pr-3">
                        {/* Track Guideline */}
                        <div className="absolute left-3 right-3 h-px bg-neutral-800/80 pointer-events-none" />

                        {/* Color Emotion Plotted at spectrum percent */}
                        <div
                          className="absolute -translate-x-1/2 z-20 flex items-center justify-center"
                          style={{
                            left: `calc(0.75rem + (100% - 1.5rem) * ${spectrumPercent / 100})`,
                          }}
                        >
                          {/* Emoji Node: 點擊 Emoji 一樣連結至 IG Post 頁面 */}
                          <button
                            type="button"
                            onClick={(e) => handleEmojiClick(e, item)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer ${
                              isHovered
                                ? 'scale-125 ring-2 ring-white z-30 shadow-2xl'
                                : 'hover:scale-110'
                            }`}
                            style={{
                              backgroundColor: itemColor,
                              border: '2px solid rgba(255, 255, 255, 0.95)',
                            }}
                            title={`${item.city?.name || 'City'}${item.city?.location ? ` · ${item.city.location}` : ''} · ${item.date} · Click to open IG Post`}
                          >
                            <span className="text-xs sm:text-sm select-none leading-none">
                              {itemEmoji}
                            </span>
                          </button>

                          {/* Floating Tooltip on Hover */}
                          {isHovered && (
                            <div className="absolute bottom-full mb-1.5 z-40 px-3 py-1.5 rounded-2xl bg-neutral-950/95 border border-white/20 text-white text-xs font-sans shadow-2xl backdrop-blur-md whitespace-nowrap pointer-events-none flex flex-col gap-0.5 -translate-x-1/2 left-1/2">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: itemColor }}
                                />
                                <span>{item.city?.name || 'City'}</span>
                                {item.city?.location && (
                                  <span className="text-neutral-400 font-normal">
                                    · {item.city.location}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                                <span>{item.date}</span>
                                <span>·</span>
                                <span>{hue}°</span>
                              </div>
                              {item.note && (
                                <p className="text-[11px] text-neutral-200 mt-0.5 max-w-[220px] truncate">
                                  {item.note}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
