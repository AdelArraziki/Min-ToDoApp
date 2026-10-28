import React from 'react';

export const LoadingDayState: React.FC = () => {
  return (
    <div className="space-y-3 py-2 px-1 animate-pulse">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="w-full bg-[#192538] rounded-2xl p-4 flex items-center gap-3.5"
        >
          {/* Skeleton circle */}
          <div className="w-4 h-4 rounded-full bg-slate-600/40 shrink-0" />

          {/* Skeleton lines */}
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-600/40 rounded-full w-2/5" />
            <div className="h-2.5 bg-slate-700/30 rounded-full w-1/4" />
          </div>
        </div>
      ))}

      <p className="text-center text-xs text-slate-400 pt-3">
        Hämtar dagens uppgifter...
      </p>
    </div>
  );
};
