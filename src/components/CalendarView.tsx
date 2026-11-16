import React, { useState } from 'react';
import { DateVibeItem } from '../types';
import { generateMonthData, CalendarMonth } from '../utils/calendar';
import { getVibeColor } from '../utils/visualPreset';

interface CalendarViewProps {
  items: DateVibeItem[];
  onSelectDate: (dateStr: string, existingItem?: DateVibeItem) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  items,
  onSelectDate,
}) => {
  // Start from September 2026 (month 8, since 0-indexed: 0=Jan, 8=Sep)
  const [months, setMonths] = useState<CalendarMonth[]>(() => {
    const list: CalendarMonth[] = [];
    const startYear = 2026;
    const startMonth = 8; // September

    // Generate 6 months initially (Sep 2026 - Feb 2027)
    for (let i = 0; i < 6; i++) {
      const currentMonth = (startMonth + i) % 12;
      const currentYear = startYear + Math.floor((startMonth + i) / 12);
      list.push(generateMonthData(currentYear, currentMonth));
    }
    return list;
  });

  // Map items by dateStr for quick lookup
  const itemsByDate = React.useMemo(() => {
    const map = new Map<string, DateVibeItem>();
    items.forEach((it) => {
      if (it.date) {
        map.set(it.date, it);
      }
    });
    return map;
  }, [items]);

  // Load more months for continuous vertical scrolling
  const loadMoreMonths = () => {
    setMonths((prev) => {
      const last = prev[prev.length - 1];
      const nextMonth = (last.month + 1) % 12;
      const nextYear = last.month === 11 ? last.year + 1 : last.year;
      return [...prev, generateMonthData(nextYear, nextMonth)];
    });
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full flex flex-col gap-8 sm:gap-10 py-2 select-none">
      {/* 2-3 個月份一排：細緻編排，精巧緊湊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {months.map((m) => (
          <section
            key={`${m.year}-${m.month}`}
            className="flex flex-col p-4 sm:p-5 rounded-3xl bg-neutral-950/70 border border-neutral-900 shadow-lg"
          >
            {/* Month Header - Left-aligned & refined */}
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                {m.name}
              </h3>
            </div>

            {/* Weekday Row - Compact & delicate */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center mb-2">
              {weekdays.map((wd) => (
                <div
                  key={wd}
                  className="py-0.5 text-[11px] font-semibold text-neutral-400"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid: Refined circular thumbnails */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center items-center justify-items-center">
              {m.days.map((dayObj, idx) => {
                if (!dayObj.isCurrentMonth) {
                  // Empty placeholder cell for alignment
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="w-full aspect-square max-w-[42px]"
                    />
                  );
                }

                const item = itemsByDate.get(dayObj.dateStr);
                const hasItem = Boolean(item);

                if (hasItem && item) {
                  // Calender 出現顏色即可，不用 Emoji；純色圓點
                  const solidColor = item.emotion ? getVibeColor(item) : '#444444';

                  return (
                    <button
                      key={dayObj.dateStr}
                      type="button"
                      onClick={() => onSelectDate(dayObj.dateStr, item)}
                      className="group relative w-full aspect-square max-w-[42px] rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 active:scale-95 ring-1 ring-white/30 hover:ring-white/70 overflow-hidden"
                      style={{ backgroundColor: solidColor }}
                      title={`${dayObj.dateStr} (${item.city?.name || 'Vibe'}${item.city?.location ? ` · ${item.city.location}` : ''})`}
                    >
                      {/* Bold Day Number (No Emoji) */}
                      <span className="text-xs sm:text-sm font-bold font-yugothic text-white leading-none">
                        {dayObj.dayNumber}
                      </span>
                    </button>
                  );
                }

                // Normal Day Cell without entry
                return (
                  <button
                    key={dayObj.dateStr}
                    type="button"
                    onClick={() => onSelectDate(dayObj.dateStr)}
                    className="w-full aspect-square max-w-[42px] rounded-full flex items-center justify-center text-xs sm:text-sm font-medium font-yugothic text-white/50 hover:text-white bg-neutral-900/30 hover:bg-neutral-800 border border-neutral-800/40 hover:border-neutral-700 active:scale-95 transition-all select-none group"
                    title={`${dayObj.dateStr} (Click to set)`}
                  >
                    <span className="group-hover:font-semibold transition-all">
                      {dayObj.dayNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Load More Months Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={loadMoreMonths}
          className="px-6 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-yugothic text-neutral-300 hover:text-white transition-all shadow-md active:scale-95"
        >
          Load More Months ↓
        </button>
      </div>
    </div>
  );
};
