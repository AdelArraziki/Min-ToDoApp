import React, { useState, useEffect } from 'react';
import { Task, CategoryType, CATEGORIES, RecurrenceType, AlarmOffset } from '../types/todo';
import {
  formatModalSwedishDate,
  validateTimeRange,
  getRecurrenceLabel,
  getAlarmOffsetLabel,
} from '../utils/dateUtils';
import { playAlarmChime, requestNotificationPermission } from '../utils/soundUtils';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  Loader2,
  ChevronDown,
  Repeat,
  Bell,
  Volume2,
} from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => Promise<boolean>;
  initialTask?: Task | null;
  defaultDate?: string;
  forceSaveError?: boolean;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDate = '2026-10-22',
  forceSaveError = false,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [category, setCategory] = useState<CategoryType>('none');

  // Time states
  const [timeType, setTimeType] = useState<'none' | 'single' | 'interval'>('single');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('');

  // Upprepning (Recurrence) state
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [isRecurrenceExpanded, setIsRecurrenceExpanded] = useState(false);

  // Larm (Alarm) state
  const [hasAlarm, setHasAlarm] = useState(false);
  const [alarmOffset, setAlarmOffset] = useState<AlarmOffset>('at_time');
  const [alarmSound, setAlarmSound] = useState(true);
  const [isAlarmExpanded, setIsAlarmExpanded] = useState(false);

  // Expanded toggles
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);
  const [isDateExpanded, setIsDateExpanded] = useState(false);

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaveError, setHasSaveError] = useState(false);

  // Populate when opened or changed
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDate(initialTask.date);
      setCategory(initialTask.category);
      setTimeType(initialTask.timeType);
      setStartTime(initialTask.startTime || '');
      setEndTime(initialTask.endTime || '');
      setRecurrence(initialTask.recurrence || 'none');
      setHasAlarm(initialTask.hasAlarm || false);
      setAlarmOffset(initialTask.alarmOffset || 'at_time');
      setAlarmSound(initialTask.alarmSound ?? true);
    } else {
      setTitle('');
      setDate(defaultDate);
      setCategory('none');
      setTimeType('none');
      setStartTime('');
      setEndTime('');
      setRecurrence('none');
      setHasAlarm(false);
      setAlarmOffset('at_time');
      setAlarmSound(true);
    }
    setIsSaving(false);
    setHasSaveError(false);
    setIsTimeExpanded(false);
    setIsDateExpanded(false);
    setIsRecurrenceExpanded(false);
    setIsAlarmExpanded(false);
  }, [initialTask, defaultDate, isOpen]);

  if (!isOpen) return null;

  // Validation
  const isTimeInterval = timeType === 'interval' && startTime && endTime;
  const isTimeIntervalInvalid = isTimeInterval && !validateTimeRange(startTime, endTime);
  const isTitleEmpty = title.trim().length === 0;
  const isFormValid = !isTitleEmpty && !isTimeIntervalInvalid;

  // Time display text
  let timeDisplayText = 'Ingen tid';
  if (timeType === 'single' && startTime) {
    timeDisplayText = startTime;
  } else if (timeType === 'interval' && startTime && endTime) {
    timeDisplayText = `${startTime}–${endTime}`;
  } else if (startTime) {
    timeDisplayText = startTime;
  }

  // Handle alarm toggle
  const handleToggleAlarm = async (enabled: boolean) => {
    setHasAlarm(enabled);
    if (enabled) {
      // If no start time yet, default to a convenient time
      if (!startTime) {
        setTimeType('single');
        setStartTime('18:00');
      }
      // Request browser permission in background
      await requestNotificationPermission();
    }
  };

  const handleSave = async () => {
    if (!isFormValid || isSaving) return;

    setIsSaving(true);
    setHasSaveError(false);

    // Simulated short network delay like in Image 9
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (forceSaveError) {
      setIsSaving(false);
      setHasSaveError(true);
      return;
    }

    try {
      const success = await onSave({
        title: title.trim(),
        date,
        timeType,
        startTime: timeType === 'none' ? undefined : startTime || undefined,
        endTime: timeType === 'interval' ? endTime || undefined : undefined,
        category,
        recurrence,
        hasAlarm,
        alarmOffset: hasAlarm ? alarmOffset : 'none',
        alarmSound,
      });

      if (success) {
        setIsSaving(false);
        onClose();
      } else {
        setIsSaving(false);
        setHasSaveError(true);
      }
    } catch {
      setIsSaving(false);
      setHasSaveError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-[#111d2e] border border-slate-700/40 rounded-3xl p-5 shadow-2xl relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {initialTask ? 'Redigera uppgift' : 'Ny uppgift'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Stäng"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-3.5">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vad vill du göra?"
              className="w-full bg-[#0c1524] border border-[#1e2f47] focus:border-[#f06450] rounded-xl py-3 px-4 text-white text-[15px] outline-none placeholder:text-slate-500 transition-colors"
              autoFocus
            />
            {isTitleEmpty && (
              <p className="text-xs text-slate-400 mt-1.5 pl-1">
                Titel krävs för att skapa en uppgift.
              </p>
            )}
          </div>

          {/* Datum Row */}
          <div>
            <button
              type="button"
              onClick={() => setIsDateExpanded(!isDateExpanded)}
              className="w-full bg-[#0c1524] border border-[#1e2f47] rounded-xl py-3 px-4 flex items-center justify-between text-left hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CalendarIcon size={18} className="text-slate-300" />
                <span className="text-sm font-medium text-slate-200">Datum</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                <span>{formatModalSwedishDate(date)}</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${
                    isDateExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Quick Date Chooser */}
            {isDateExpanded && (
              <div className="mt-2 p-3 bg-[#0c1524] border border-slate-700/60 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDate('2026-10-22');
                      setIsDateExpanded(false);
                    }}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                      date === '2026-10-22'
                        ? 'bg-[#f06450] text-white border-transparent'
                        : 'border-slate-700 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    Torsdag 22 okt (Idag)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDate('2026-10-23');
                      setIsDateExpanded(false);
                    }}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                      date === '2026-10-23'
                        ? 'bg-[#f06450] text-white border-transparent'
                        : 'border-slate-700 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    Fredag 23 okt
                  </button>
                </div>
                <div className="pt-1">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Välj valfritt datum:
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      if (e.target.value) setDate(e.target.value);
                    }}
                    className="w-full bg-[#142032] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tid (valfritt) Row */}
          <div>
            <button
              type="button"
              onClick={() => setIsTimeExpanded(!isTimeExpanded)}
              className={`w-full bg-[#0c1524] rounded-xl py-3 px-4 flex items-center justify-between text-left transition-colors border ${
                isTimeIntervalInvalid
                  ? 'border-[#f06450]'
                  : 'border-[#1e2f47] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock
                  size={18}
                  className={isTimeIntervalInvalid ? 'text-[#f06450]' : 'text-slate-300'}
                />
                <span className="text-sm font-medium text-slate-200">
                  Tid (valfritt)
                </span>
              </div>
              <span
                className={`text-sm ${
                  isTimeIntervalInvalid ? 'text-[#f06450] font-medium' : 'text-slate-300'
                }`}
              >
                {timeDisplayText}
              </span>
            </button>

            {/* Error Message matching Image 8 */}
            {isTimeIntervalInvalid && (
              <p className="text-xs text-[#f06450] mt-1.5 pl-1 leading-snug">
                Sluttiden måste vara efter starttiden. Ändra sluttiden eller ta bort tiden.
              </p>
            )}

            {/* Time Picker Controls */}
            {isTimeExpanded && (
              <div className="mt-2 p-3 bg-[#0c1524] border border-slate-700/60 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTimeType('none');
                      setStartTime('');
                      setEndTime('');
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md border ${
                      timeType === 'none'
                        ? 'bg-slate-700 text-white border-transparent'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Ingen tid
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeType('single');
                      if (!startTime) setStartTime('18:00');
                      setEndTime('');
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md border ${
                      timeType === 'single'
                        ? 'bg-slate-700 text-white border-transparent'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    En tidpunkt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeType('interval');
                      if (!startTime) setStartTime('18:00');
                      if (!endTime) setEndTime('19:00');
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md border ${
                      timeType === 'interval'
                        ? 'bg-slate-700 text-white border-transparent'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Tidsintervall
                  </button>
                </div>

                {timeType !== 'none' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Starttid:
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-[#142032] border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    {timeType === 'interval' && (
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Sluttid:
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full bg-[#142032] border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Simulation buttons to test user mockup states easily */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Snabbval:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTimeType('single');
                        setStartTime('18:00');
                        setEndTime('');
                      }}
                      className="underline hover:text-white"
                    >
                      18:00
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTimeType('interval');
                        setStartTime('18:00');
                        setEndTime('19:00');
                      }}
                      className="underline hover:text-white"
                    >
                      18:00–19:00
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTimeType('interval');
                        setStartTime('18:00');
                        setEndTime('17:00'); // triggers image 8 error
                      }}
                      className="text-[#f06450] underline hover:brightness-125"
                    >
                      Testa ogiltigt (18:00–17:00)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* NY FUNKTION 1: Upprepa (Recurrence: weekly or monthly) */}
          <div>
            <button
              type="button"
              onClick={() => setIsRecurrenceExpanded(!isRecurrenceExpanded)}
              className="w-full bg-[#0c1524] border border-[#1e2f47] rounded-xl py-3 px-4 flex items-center justify-between text-left hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Repeat
                  size={18}
                  className={recurrence !== 'none' ? 'text-[#f06450]' : 'text-slate-300'}
                />
                <span className="text-sm font-medium text-slate-200">Upprepa</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                <span className={recurrence !== 'none' ? 'text-[#f06450] font-medium' : ''}>
                  {getRecurrenceLabel(recurrence)}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${
                    isRecurrenceExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Recurrence Options */}
            {isRecurrenceExpanded && (
              <div className="mt-2 p-3 bg-[#0c1524] border border-slate-700/60 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRecurrence('none');
                      setIsRecurrenceExpanded(false);
                    }}
                    className={`py-2 px-2 text-xs rounded-lg font-medium transition ${
                      recurrence === 'none'
                        ? 'bg-[#f06450] text-white'
                        : 'bg-[#142032] text-slate-300 hover:text-white'
                    }`}
                  >
                    Aldrig
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecurrence('weekly');
                      setIsRecurrenceExpanded(false);
                    }}
                    className={`py-2 px-2 text-xs rounded-lg font-medium transition ${
                      recurrence === 'weekly'
                        ? 'bg-[#f06450] text-white'
                        : 'bg-[#142032] text-slate-300 hover:text-white'
                    }`}
                  >
                    Varje vecka
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecurrence('monthly');
                      setIsRecurrenceExpanded(false);
                    }}
                    className={`py-2 px-2 text-xs rounded-lg font-medium transition ${
                      recurrence === 'monthly'
                        ? 'bg-[#f06450] text-white'
                        : 'bg-[#142032] text-slate-300 hover:text-white'
                    }`}
                  >
                    Varje månad
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                  {recurrence === 'weekly'
                    ? 'Uppgiften visas automatiskt varje vecka på samma veckodag.'
                    : recurrence === 'monthly'
                    ? 'Uppgiften visas automatiskt samma datum varje månad.'
                    : 'Ingen regelbunden upprepning vald.'}
                </p>
              </div>
            )}
          </div>

          {/* NY FUNKTION 2: Larm & Påminnelse (Alarm in same flow) */}
          <div>
            <button
              type="button"
              onClick={() => setIsAlarmExpanded(!isAlarmExpanded)}
              className="w-full bg-[#0c1524] border border-[#1e2f47] rounded-xl py-3 px-4 flex items-center justify-between text-left hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bell
                  size={18}
                  className={hasAlarm ? 'text-[#f06450] fill-[#f06450]' : 'text-slate-300'}
                />
                <span className="text-sm font-medium text-slate-200">Larm</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                <span className={hasAlarm ? 'text-[#f06450] font-medium' : ''}>
                  {hasAlarm ? getAlarmOffsetLabel(alarmOffset) : 'Inget larm'}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${
                    isAlarmExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Alarm Settings Panel */}
            {isAlarmExpanded && (
              <div className="mt-2 p-3 bg-[#0c1524] border border-slate-700/60 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-medium text-slate-200">
                    Aktivera larm för uppgift
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleAlarm(!hasAlarm)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      hasAlarm ? 'bg-[#f06450]' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        hasAlarm ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {hasAlarm && (
                  <div className="space-y-2.5 pt-1 border-t border-slate-800">
                    <label className="text-[11px] text-slate-400 block">
                      När ska larmet ringa?
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'at_time', label: 'Vid starttid' },
                        { id: '5_min', label: '5 min innan' },
                        { id: '15_min', label: '15 min innan' },
                        { id: '30_min', label: '30 min innan' },
                        { id: '1_hour', label: '1 timme innan' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAlarmOffset(opt.id as AlarmOffset)}
                          className={`py-1.5 px-2 text-xs rounded-lg text-left transition ${
                            alarmOffset === opt.id
                              ? 'bg-[#f06450] text-white font-medium'
                              : 'bg-[#142032] text-slate-300 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Volume2 size={14} className="text-slate-400" />
                        <span>Larmljud (klockton)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={alarmSound}
                        onChange={(e) => setAlarmSound(e.target.checked)}
                        className="rounded border-slate-700 accent-[#f06450] cursor-pointer"
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => playAlarmChime()}
                        className="text-[#f06450] underline hover:brightness-125 flex items-center gap-1"
                      >
                        <span>Testa larmljud nu</span>
                      </button>
                      <span className="text-slate-500">Kräver tillåtelse i webbläsare</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Kategori (valfritt) */}
          <div className="pt-1">
            <div className="flex items-center gap-2 mb-2 text-slate-300 text-sm">
              <Tag size={16} />
              <span>Kategori (valfritt)</span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* "Ingen" button pill */}
              <button
                type="button"
                onClick={() => setCategory('none')}
                className={`py-1.5 px-3 rounded-full text-xs font-normal transition-all ${
                  category === 'none'
                    ? 'bg-[#101b2a] border border-slate-400 text-white'
                    : 'bg-[#101b2a] border border-[#26364c] text-slate-400 hover:text-white'
                }`}
              >
                Ingen
              </button>

              {/* Color Swatches */}
              {CATEGORIES.filter((c) => c.id !== 'none').map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    aria-label={`Välj färg ${cat.label}`}
                    className={`w-6 h-6 rounded-full transition-transform active:scale-90 ${
                      isSelected
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111d2e] scale-105'
                        : 'hover:scale-105 opacity-90'
                    }`}
                    style={{ backgroundColor: cat.color }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Save Error Box matching Image 10 */}
        {hasSaveError && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#281b2a] border border-[#f06450]/30 animate-in fade-in duration-200">
            <p className="text-sm font-semibold text-white">
              Kunde inte spara uppgiften
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Kontrollera anslutningen och försök igen. Dina uppgifter finns kvar.
            </p>
          </div>
        )}

        {/* Action Button & States */}
        <div className="mt-5">
          {isSaving ? (
            // Saving state matching Image 9
            <div>
              <button
                disabled
                className="w-full py-3.5 rounded-full bg-[#233348] text-slate-200 font-medium text-sm flex items-center justify-center gap-2 shadow-sm cursor-wait"
              >
                <Loader2 size={16} className="animate-spin text-slate-300" />
                <span>Sparar...</span>
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">
                Vänta medan uppgiften sparas.
              </p>
            </div>
          ) : hasSaveError ? (
            // Save error retry button matching Image 10
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 rounded-full bg-[#f06450] text-white font-medium text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-[#f06450]/25"
            >
              Försök igen
            </button>
          ) : (
            // Standard button (active coral or disabled muted)
            <button
              type="button"
              disabled={!isFormValid}
              onClick={handleSave}
              className={`w-full py-3.5 rounded-full font-medium text-sm transition-all ${
                isFormValid
                  ? 'bg-[#f06450] text-white hover:brightness-110 active:scale-95 shadow-lg shadow-[#f06450]/30 cursor-pointer'
                  : 'bg-[#233348] text-slate-400 cursor-not-allowed'
              }`}
            >
              {initialTask ? 'Spara ändringar' : 'Skapa uppgift'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
