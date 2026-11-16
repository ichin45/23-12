import React, { useState } from 'react';
import { DateVibeItem } from '../types';
import { formatShortDateBadge } from '../utils/calendar';
import { getVibeColor, getEmotionEmoji } from '../utils/visualPreset';
import { ExternalLink } from 'lucide-react';

interface PhotoCardProps {
  item: DateVibeItem;
  onUpdate?: (updated: DateVibeItem) => void;
  onSelect?: (item: DateVibeItem) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const { day, month } = formatShortDateBadge(item.date);

  const hasDimensions = Boolean(item.emotion && item.city);
  // Pure solid color dynamically modulated by Emotion Hue & Tasty Mouthfeel / Flavor
  const solidColor = hasDimensions ? getVibeColor(item) : '#e11d48';

  // Emoji for this emotion
  const itemEmoji =
    item.emotion?.emoji ||
    getEmotionEmoji(item.emotion?.text, item.emotion?.hue).emoji;

  // Instagram Post Photo (from item.igPhoto or image fallback)
  const igPhoto =
    item.igPhoto ||
    item.afterImage ||
    item.beforeImage ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  // Instagram Post URL Link
  const igUrl = item.igUrl || 'https://www.instagram.com';

  const isCardTurned = isHovered || isFlipped;

  const handleCardClick = () => {
    // Toggle flip on click / tap so mobile and desktop can toggle anytime
    setIsFlipped((prev) => !prev);
  };

  const handleIgClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(igUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id={`photo-card-${item.id}`}
      className="relative aspect-[4/5] w-full perspective-1000 cursor-pointer select-none font-yugothic"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      title={item.city?.name ? `${item.date} · ${item.city.name}` : item.date}
    >
      {/* 3D Flip Card Container: Both Hover & Click toggle the rotation with guaranteed inline styles */}
      <div
        className="relative w-full h-full rounded-2xl sm:rounded-3xl preserve-3d shadow-xl ring-1 ring-white/10"
        style={{
          transform: isCardTurned ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* FRONT FACE: 第一面只需呈現 IG Post 的圖片 */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden backface-hidden bg-neutral-900 border border-neutral-800"
          style={{
            zIndex: isCardTurned ? 0 : 1,
            pointerEvents: isCardTurned ? 'none' : 'auto',
          }}
        >
          <img
            src={igPhoto}
            alt="Instagram Post"
            className="w-full h-full object-cover transition-transform duration-700 pointer-events-none"
          />
        </div>

        {/* BACK FACE: 附圖二規格 (上方純色區塊 Note 在上面，下方白色底標 Date 大字、City/Location 比 Note 大、Emoji 在右下) */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden backface-hidden flex flex-col bg-white border border-neutral-300 shadow-2xl font-yugothic"
          style={{
            transform: 'rotateY(180deg)',
            zIndex: isCardTurned ? 2 : 0,
            pointerEvents: isCardTurned ? 'auto' : 'none',
          }}
        >
          {/* Top Swatch Area (純色色票區塊，Note 在上面，置上、置左) */}
          <div
            className="flex-1 w-full p-4 sm:p-5 flex flex-col justify-start items-start text-left overflow-hidden transition-colors duration-200 relative"
            style={{ backgroundColor: solidColor }}
          >
            {/* Note 在上面 (置上、置左，字級保持小清新) */}
            <div className="w-full flex-1 overflow-y-auto scrollbar-none">
              {item.note?.trim() ? (
                <p className="text-xs sm:text-[13px] font-normal text-white/95 leading-relaxed whitespace-pre-wrap break-words text-left font-yugothic">
                  {item.note}
                </p>
              ) : null}
            </div>
          </div>

          {/* Bottom White Info Strip: 附圖二規格 (文字適度縮小精緻化) */}
          <div className="w-full bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-end justify-between border-t border-neutral-200 shrink-0 text-black font-yugothic">
            {/* Left: Date + City/Location */}
            <div className="flex flex-col text-left truncate mr-2">
              {/* Date */}
              <span className="text-base sm:text-lg font-black tracking-tight text-black leading-tight font-yugothic">
                {day} &nbsp;{month}
              </span>
              {/* City, Location: 適度縮小但清晰 */}
              <span className="text-xs sm:text-[13px] font-bold text-neutral-800 leading-tight mt-0.5 truncate font-yugothic">
                {item.city?.name || 'City'}
                {item.city?.location ? ` · ${item.city.location}` : ''}
              </span>
            </div>

            {/* Right: Emoji 放在右下 (🥰) */}
            <div className="flex items-center gap-1.5 shrink-0 select-none pb-0.5">
              {itemEmoji && (
                <span className="text-xl sm:text-2xl leading-none select-none">
                  {itemEmoji}
                </span>
              )}
              {item.igUrl && (
                <button
                  type="button"
                  onClick={handleIgClick}
                  className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
                  title="Open Instagram Post"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
