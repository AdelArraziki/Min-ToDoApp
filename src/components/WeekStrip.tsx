import React from 'react';
import { WeekDayItem } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekStripProps {
  days: WeekDayItem[];
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export const WeekStrip: React.FC<WeekStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}) => {
  return (
    <div className="relative pt-2 pb-3 px-3">
      <div className="flex items-center justify-between gap-1 max-w-md mx-auto">
        {onPrevWeek && (
          <button
            onClick={onPrevWeek}
            aria-label="Föregående vecka"
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div className="flex-1 grid grid-cols-7 gap-1 text-center items-center">
          {days.map((day) => {
            const isSelected = day.iso === selectedDate;
            const isToday = day.isToday;

            // In the screenshots, the highlight is a smooth rounded pill container
            // If it is today or selected:
            if (isSelected) {
              return (
                <button
                  key={day.iso}
                  onClick={() => onSelectDate(day.iso)}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-[#f06450] text-white shadow-md shadow-[#f06450]/20 transition-all transform active:scale-95"
                >
                  <span className="text-[11px] font-medium leading-none mb-1">
                    {isToday ? 'Idag' : day.weekdayShort}
                  </span>
                  <span className="text-[17px] font-bold leading-none">
                    {day.dayNumber}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={day.iso}
                onClick={() => onSelectDate(day.iso)}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
              >
                <span className="text-[11px] font-medium leading-none mb-1 text-slate-400 group-hover:text-slate-300">
                  {day.weekdayShort}
                </span>
                <span className="text-[17px] font-semibold text-white leading-none">
                  {day.dayNumber}
                </span>
              </button>
            );
          })}
        </div>

        {onNextWeek && (
          <button
            onClick={onNextWeek}
            aria-label="Nästa vecka"
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
