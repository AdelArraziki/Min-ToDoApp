import React from 'react';
import { EyeOff } from 'lucide-react';

interface ErrorDayStateProps {
  onRetry: () => void;
}

export const ErrorDayState: React.FC<ErrorDayStateProps> = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {/* Dark rounded icon container matching Image 5 */}
      <div className="w-16 h-16 rounded-2xl bg-[#142032] border border-slate-800/80 flex items-center justify-center text-slate-400 mb-6 shadow-inner">
        <EyeOff size={28} strokeWidth={1.8} className="text-slate-400" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        Kunde inte hämta uppgifter
      </h3>

      <p className="text-sm text-slate-400 max-w-[280px] leading-relaxed mb-6">
        Dagens lista kunde inte laddas. Kontrollera anslutningen och försök igen.
      </p>

      <button
        onClick={onRetry}
        className="px-8 py-3 rounded-full bg-[#f06450] text-white font-medium text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-[#f06450]/30"
      >
        Försök igen
      </button>
    </div>
  );
};
