import React from 'react';
import { CalendarCheck } from 'lucide-react';

interface EmptyDayStateProps {
  onAddTask: () => void;
}

export const EmptyDayState: React.FC<EmptyDayStateProps> = ({ onAddTask }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {/* Dark rounded icon container matching Image 3 */}
      <div className="w-16 h-16 rounded-2xl bg-[#142032] border border-slate-800/80 flex items-center justify-center text-slate-400 mb-6 shadow-inner">
        <CalendarCheck size={28} strokeWidth={1.8} className="text-slate-400" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        En dag att fylla
      </h3>

      <p className="text-sm text-slate-400 max-w-[270px] leading-relaxed mb-6">
        Du har inga uppgifter idag. Lägg till något du vill få gjort, stort som smått.
      </p>

      <button
        onClick={onAddTask}
        className="px-6 py-3 rounded-full bg-[#f06450] text-white font-medium text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-[#f06450]/30"
      >
        Lägg till uppgift
      </button>
    </div>
  );
};
