import React from 'react';
import { Task } from '../types/todo';
import { Bell, X, Clock } from 'lucide-react';

interface AlarmAlertBannerProps {
  task: Task;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const AlarmAlertBanner: React.FC<AlarmAlertBannerProps> = ({
  task,
  onDismiss,
  onSnooze,
}) => {
  return (
    <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-[#172338] border-2 border-[#f06450] rounded-2xl p-4 shadow-[0_10px_35px_rgba(240,100,80,0.45)] text-slate-100 flex flex-col gap-3 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f06450] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#f06450]/40 animate-bounce">
              <Bell size={20} className="fill-white" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wide uppercase text-[#f06450]">
                Larm aktiverat
              </span>
              <h4 className="text-sm font-bold text-white leading-snug">
                {task.title}
              </h4>
            </div>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Stäng larm"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {task.startTime && (
          <div className="flex items-center gap-1.5 text-xs text-slate-300 pl-1">
            <Clock size={13} className="text-[#f06450]" />
            <span>Tidpunkt: {task.startTime}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onSnooze(5)}
            className="flex-1 py-2 px-3 rounded-xl bg-[#0c1524] border border-slate-700 text-xs text-slate-200 hover:text-white hover:border-slate-500 font-medium transition"
          >
            Snooze (5 min)
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 py-2 px-3 rounded-xl bg-[#f06450] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition shadow-sm"
          >
            Avfärda
          </button>
        </div>
      </div>
    </div>
  );
};
