import React from 'react';
import { DateVibeItem } from '../types';
import { PhotoCard } from './PhotoCard';

interface GridViewProps {
  items: DateVibeItem[];
  onAddNew: () => void;
  onSelectItem?: (item: DateVibeItem) => void;
}

export const GridView: React.FC<GridViewProps> = ({
  items,
  onAddNew,
  onSelectItem,
}) => {
  return (
    <div className="w-full">
      {/* Grid: 3 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {/* Render each date card */}
        {items.map((item) => (
          <PhotoCard
            key={item.id}
            item={item}
            onSelect={onSelectItem}
          />
        ))}

        {/* Exactly ONE clean "+" slot on the grid without text */}
        <div
          id="single-add-photo-slot"
          onClick={onAddNew}
          className="relative aspect-[4/5] w-full rounded-2xl sm:rounded-3xl border-2 border-dashed border-neutral-700/80 hover:border-neutral-300 hover:scale-[1.02] bg-neutral-900/30 transition-all duration-200 flex items-center justify-center cursor-pointer select-none overflow-hidden group"
          title="Add New Vibe"
        >
          {/* Only "+" sign without any text */}
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-neutral-400 group-hover:text-white stroke-[1.2] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>
    </div>
  );
};
