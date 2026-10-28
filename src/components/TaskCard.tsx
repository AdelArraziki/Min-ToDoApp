import React, { useState, useRef, useEffect } from 'react';
import { Task, CATEGORIES } from '../types/todo';
import { getRecurrenceLabel, getAlarmOffsetLabel } from '../utils/dateUtils';
import { MoreVertical, Check, Clock, Trash2, Edit3, Copy, Repeat, Bell } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isCompleted?: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDuplicate: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isCompleted,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Determine completion state
  const completedState = isCompleted !== undefined ? isCompleted : task.completed;

  // Determine category color
  const categoryConfig = CATEGORIES.find((c) => c.id === task.category);
  const hasCategoryColor = task.category !== 'none' && categoryConfig?.color;

  // Format time display
  let timeDisplay = '';
  if (task.timeType === 'interval' && task.startTime && task.endTime) {
    timeDisplay = `${task.startTime} – ${task.endTime}`;
  } else if (task.startTime) {
    timeDisplay = task.startTime;
  }

  const hasRecurrence = task.recurrence && task.recurrence !== 'none';
  const hasAlarm = Boolean(task.hasAlarm);

  return (
    <div className="relative group">
      <div
        className={`w-full bg-[#192538] hover:bg-[#1d2a3f] transition-all rounded-2xl p-4 flex items-start justify-between gap-3.5 border border-transparent hover:border-slate-700/40 shadow-sm ${
          completedState ? 'opacity-70' : 'opacity-100'
        }`}
      >
        {/* Left Indicator / Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          aria-label={completedState ? 'Markera som ej klar' : 'Markera som klar'}
          className="mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform active:scale-90"
        >
          {completedState ? (
            <div className="w-5 h-5 rounded-full bg-[#f06450] flex items-center justify-center text-white">
              <Check size={13} strokeWidth={3} />
            </div>
          ) : hasCategoryColor ? (
            // Colored category dot as shown in mockups
            <div
              className="w-4 h-4 rounded-full transition-transform group-hover:scale-110"
              style={{ backgroundColor: categoryConfig.color }}
            />
          ) : (
            // Default circular indicator (light grey/white circle or ring)
            <div className="w-4 h-4 rounded-full bg-slate-200/90 transition-transform group-hover:scale-110" />
          )}
        </button>

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onToggleComplete(task.id)}
        >
          <p
            className={`text-[15px] font-normal leading-snug break-words ${
              completedState ? 'text-slate-400 line-through' : 'text-slate-100'
            }`}
          >
            {task.title}
          </p>

          {/* Meta line: Time, Recurrence & Alarm */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[13px] text-slate-400">
            {timeDisplay && (
              <div className="flex items-center gap-1.5">
                {task.timeType === 'single' && <Clock size={12} className="text-slate-400" />}
                <span>{timeDisplay}</span>
              </div>
            )}

            {hasRecurrence && (
              <div
                className="flex items-center gap-1 text-[11px] text-slate-300"
                title={`Upprepas ${getRecurrenceLabel(task.recurrence).toLowerCase()}`}
              >
                <Repeat size={11} className="text-[#f06450]" />
                <span>{getRecurrenceLabel(task.recurrence)}</span>
              </div>
            )}

            {hasAlarm && (
              <div
                className="flex items-center gap-1 text-[11px] text-[#f06450]"
                title={`Larm inställt: ${getAlarmOffsetLabel(task.alarmOffset)}`}
              >
                <Bell size={11} className="fill-[#f06450]" />
                <span>Larm</span>
              </div>
            )}
          </div>
        </div>

        {/* Three dots menu button */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Fler alternativ"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-44 bg-[#142032] border border-slate-700/60 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 backdrop-blur-md">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Edit3 size={14} className="text-slate-400" />
                <span>Redigera uppgift</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate(task);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Copy size={14} className="text-slate-400" />
                <span>Duplicera</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onToggleComplete(task.id);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Check size={14} className="text-slate-400" />
                <span>{task.completed ? 'Markera som ej klar' : 'Markera som klar'}</span>
              </button>

              <div className="my-1 border-t border-slate-700/50" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task.id);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-[#f06450] hover:bg-[#f06450]/15 transition-colors"
              >
                <Trash2 size={14} />
                <span>Ta bort</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
