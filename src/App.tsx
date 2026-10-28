/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Task, ScreenState, ViewTab } from './types/todo';
import { DEFAULT_TASKS, TWELVE_TASKS_PRESET } from './data/initialTasks';
import {
  getWeekDaysForDate,
  formatFullSwedishDate,
  REFERENCE_TODAY_ISO,
  isTaskScheduledForDate,
} from './utils/dateUtils';
import { playAlarmChime, sendBrowserNotification } from './utils/soundUtils';
import { WeekStrip } from './components/WeekStrip';
import { TaskCard } from './components/TaskCard';
import { EmptyDayState } from './components/EmptyDayState';
import { LoadingDayState } from './components/LoadingDayState';
import { ErrorDayState } from './components/ErrorDayState';
import { NewTaskModal } from './components/NewTaskModal';
import { SettingsView } from './components/SettingsView';
import { AlarmAlertBanner } from './components/AlarmAlertBanner';
import {
  Plus,
  FileText,
  SunMedium,
  ChevronDown,
  Wifi,
  Smartphone,
  Monitor,
} from 'lucide-react';

const STORAGE_KEY = 'todo_app_tasks_v2';

export default function App() {
  // State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
    }
    return DEFAULT_TASKS;
  });

  const [selectedDate, setSelectedDate] = useState<string>(REFERENCE_TODAY_ISO);
  const [activeTab, setActiveTab] = useState<ViewTab>('tasks');
  const [screenState, setScreenState] = useState<ScreenState>('normal');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [forceSaveError, setForceSaveError] = useState(false);

  // Active Alarm Banner
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);
  const firedAlarmsRef = useRef<Set<string>>(new Set());

  // Sync tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }, [tasks]);

  // Check scheduled alarms periodically
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayIso = now.toISOString().split('T')[0];

      tasks.forEach((t) => {
        if (!t.hasAlarm || !t.startTime) return;
        const isScheduledToday = isTaskScheduledForDate(t.date, todayIso, t.recurrence);
        if (!isScheduledToday) return;

        // Calculate target alarm time based on offset
        let targetMinutesOffset = 0;
        if (t.alarmOffset === '5_min') targetMinutesOffset = 5;
        else if (t.alarmOffset === '15_min') targetMinutesOffset = 15;
        else if (t.alarmOffset === '30_min') targetMinutesOffset = 30;
        else if (t.alarmOffset === '1_hour') targetMinutesOffset = 60;

        const [sh, sm] = t.startTime.split(':').map(Number);
        const taskTotalMinutes = sh * 60 + sm;
        const alarmTotalMinutes = Math.max(0, taskTotalMinutes - targetMinutesOffset);
        const alarmH = String(Math.floor(alarmTotalMinutes / 60)).padStart(2, '0');
        const alarmM = String(alarmTotalMinutes % 60).padStart(2, '0');
        const alarmTimeStr = `${alarmH}:${alarmM}`;

        const alarmKey = `${t.id}-${todayIso}-${alarmTimeStr}`;

        if (alarmTimeStr === currentTimeStr && !firedAlarmsRef.current.has(alarmKey)) {
          firedAlarmsRef.current.add(alarmKey);
          setActiveAlarmTask(t);
          if (t.alarmSound !== false) {
            playAlarmChime();
          }
          sendBrowserNotification(
            `⏰ Larm: ${t.title}`,
            `Dags för din uppgift (${t.startTime})`
          );
        }
      });
    };

    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Days in currently selected week
  const weekDays = useMemo(() => {
    return getWeekDaysForDate(selectedDate, REFERENCE_TODAY_ISO);
  }, [selectedDate]);

  // Tasks for current selected date (including recurring tasks: weekly or monthly)
  const dayTasks = useMemo(() => {
    return tasks.filter((t) =>
      isTaskScheduledForDate(t.date, selectedDate, t.recurrence)
    );
  }, [tasks, selectedDate]);

  // Task actions
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        // If it's a recurring task, toggle completion specifically for selectedDate
        if (t.recurrence && t.recurrence !== 'none') {
          const currentDoneDates = t.completedDates || [];
          const isDoneForSelected = currentDoneDates.includes(selectedDate);
          const nextDoneDates = isDoneForSelected
            ? currentDoneDates.filter((d) => d !== selectedDate)
            : [...currentDoneDates, selectedDate];

          return {
            ...t,
            completedDates: nextDoneDates,
          };
        }

        // Non-recurring task
        return { ...t, completed: !t.completed };
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDuplicateTask = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (kopia)`,
      createdAt: Date.now(),
      completedDates: [],
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (
    taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>
  ): Promise<boolean> => {
    if (editingTask) {
      // Update existing
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...taskData }
            : t
        )
      );
    } else {
      // Create new
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        completed: false,
        completedDates: [],
        createdAt: Date.now(),
      };
      setTasks((prev) => [...prev, newTask]);
    }
    return true;
  };

  // Preset operations for testing mockup states
  const handleResetDefaultTasks = () => {
    setTasks(DEFAULT_TASKS);
    setSelectedDate(REFERENCE_TODAY_ISO);
    setScreenState('normal');
  };

  const handleLoadTwelveTasks = () => {
    setTasks(TWELVE_TASKS_PRESET);
    setSelectedDate(REFERENCE_TODAY_ISO);
    setScreenState('normal');
    setActiveTab('tasks');
  };

  const handleClearDayTasks = () => {
    setTasks((prev) =>
      prev.filter((t) => !isTaskScheduledForDate(t.date, selectedDate, t.recurrence))
    );
    setScreenState('normal');
  };

  const handleMarkAllDone = () => {
    setTasks((prev) =>
      prev.map((t) => {
        if (!isTaskScheduledForDate(t.date, selectedDate, t.recurrence)) return t;
        if (t.recurrence && t.recurrence !== 'none') {
          const list = t.completedDates || [];
          return {
            ...t,
            completedDates: list.includes(selectedDate) ? list : [...list, selectedDate],
          };
        }
        return { ...t, completed: true };
      })
    );
  };

  const handleOpenInvalidIntervalModal = () => {
    // Create prefilled task with 18:00–17:00 as seen in Image 8
    setEditingTask({
      id: 'demo-invalid',
      title: 'Gå en promenad',
      date: '2026-10-22',
      timeType: 'interval',
      startTime: '18:00',
      endTime: '17:00',
      category: 'coral',
      completed: false,
      createdAt: Date.now(),
      recurrence: 'none',
      hasAlarm: false,
    });
    setIsModalOpen(true);
  };

  const handleTestAlarmTrigger = () => {
    const sampleTask: Task = {
      id: 'test-alarm-id',
      title: 'Dags att ta en paus & dricka vatten',
      date: selectedDate,
      timeType: 'single',
      startTime: '10:00',
      category: 'coral',
      completed: false,
      createdAt: Date.now(),
      hasAlarm: true,
      alarmOffset: 'at_time',
      alarmSound: true,
    };
    setActiveAlarmTask(sampleTask);
    playAlarmChime();
    sendBrowserNotification(
      '⏰ Larm aktiverat',
      'Dags att ta en paus & dricka vatten!'
    );
  };

  const handleSnoozeAlarm = (minutes: number) => {
    if (!activeAlarmTask) return;
    setActiveAlarmTask(null);
    setTimeout(() => {
      setActiveAlarmTask(activeAlarmTask);
      playAlarmChime();
    }, minutes * 60 * 1000);
  };

  const handleExportTasks = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `todo-uppgifter-${selectedDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Navigate week
  const handlePrevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Header texts
  const isSelectedDateToday = selectedDate === REFERENCE_TODAY_ISO;
  const headerMainTitle = isSelectedDateToday ? 'Idag' : 'Uppgifter';
  const headerDateSubtitle = formatFullSwedishDate(selectedDate);

  return (
    <div className="min-h-screen bg-[#080e18] flex flex-col items-center justify-start text-slate-100 p-0 sm:py-6 sm:px-4 selection:bg-[#f06450] selection:text-white">
      {/* Top Desktop Utility Bar */}
      <header className="w-full max-w-md hidden sm:flex items-center justify-between mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">To Do App</span>
          <span className="text-slate-600">·</span>
          <span>Svensk Dagsplanerare</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#142032] border border-slate-700/50 rounded-lg p-1">
          <button
            onClick={() => setIsMobileFrame(true)}
            className={`p-1.5 rounded-md flex items-center gap-1 transition ${
              isMobileFrame
                ? 'bg-[#f06450] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobilvy med statusfält (som i skisserna)"
          >
            <Smartphone size={13} />
            <span className="text-[11px]">Mobil</span>
          </button>
          <button
            onClick={() => setIsMobileFrame(false)}
            className={`p-1.5 rounded-md flex items-center gap-1 transition ${
              !isMobileFrame
                ? 'bg-[#f06450] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Fullskärmsvy"
          >
            <Monitor size={13} />
            <span className="text-[11px]">Full</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main
        className={`w-full transition-all relative flex flex-col ${
          isMobileFrame
            ? 'max-w-[390px] min-h-[820px] max-h-[92vh] sm:rounded-[44px] sm:border-[8px] sm:border-[#1e2a3c] sm:shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden'
            : 'max-w-xl min-h-screen sm:min-h-[850px] sm:rounded-3xl sm:border border-slate-800'
        } bg-[#0c1524]`}
      >
        {/* Active Alarm Banner */}
        {activeAlarmTask && (
          <AlarmAlertBanner
            task={activeAlarmTask}
            onDismiss={() => setActiveAlarmTask(null)}
            onSnooze={handleSnoozeAlarm}
          />
        )}

        {/* Status bar (iPhone 9:41 header matching screenshots) */}
        <div className="w-full pt-3 pb-1 px-7 flex items-center justify-between text-xs font-semibold text-white select-none shrink-0 z-10">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <Wifi size={13} strokeWidth={2.5} />
            <div className="w-5 h-2.5 border border-white rounded-[3px] p-[1px] flex items-center">
              <div className="h-full w-3 bg-white rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-1">
          {activeTab === 'tasks' ? (
            <>
              {/* Week Calendar Strip */}
              <WeekStrip
                days={weekDays}
                selectedDate={selectedDate}
                onSelectDate={(iso) => {
                  setSelectedDate(iso);
                  // Reset temporary error states if any
                  if (screenState !== 'normal') setScreenState('normal');
                }}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
              />

              {/* Day Header */}
              <div className="text-center mt-3 mb-6">
                <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight">
                  {headerMainTitle}
                </h1>
                <p className="text-[15px] text-slate-300 font-normal mt-0.5">
                  {headerDateSubtitle}
                </p>
              </div>

              {/* States: Loading, Error, Empty, or Normal List */}
              {screenState === 'loading' ? (
                <LoadingDayState />
              ) : screenState === 'error' ? (
                <ErrorDayState onRetry={() => setScreenState('normal')} />
              ) : dayTasks.length === 0 ? (
                <EmptyDayState onAddTask={handleOpenNewTask} />
              ) : (
                <div className="space-y-3">
                  {/* Task counter (shown in image 6: "12 uppgifter") */}
                  {dayTasks.length > 3 && (
                    <div className="px-1 text-[13px] text-slate-400 font-normal">
                      {dayTasks.length} uppgifter
                    </div>
                  )}

                  {/* Tasks List */}
                  <div className="space-y-2.5">
                    {dayTasks.map((task) => {
                      const isTaskDone =
                        task.recurrence && task.recurrence !== 'none'
                          ? Boolean(task.completedDates?.includes(selectedDate))
                          : task.completed;

                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          isCompleted={isTaskDone}
                          onToggleComplete={handleToggleComplete}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          onDuplicate={handleDuplicateTask}
                        />
                      );
                    })}
                  </div>

                  {/* Scroll down hint (shown in Image 6) */}
                  {dayTasks.length >= 6 && (
                    <div className="pt-4 pb-2 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                      <span>Rulla för att se fler uppgifter</span>
                      <ChevronDown size={14} />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Settings View */
            <SettingsView
              isMobileFrame={isMobileFrame}
              setIsMobileFrame={setIsMobileFrame}
              screenState={screenState}
              setScreenState={setScreenState}
              forceSaveError={forceSaveError}
              setForceSaveError={setForceSaveError}
              onResetDefaultTasks={handleResetDefaultTasks}
              onLoadTwelveTasks={handleLoadTwelveTasks}
              onClearDayTasks={handleClearDayTasks}
              onMarkAllDone={handleMarkAllDone}
              onOpenNewTaskWithInvalidInterval={handleOpenInvalidIntervalModal}
              onExportTasks={handleExportTasks}
              onTestAlarmTrigger={handleTestAlarmTrigger}
            />
          )}
        </div>

        {/* Centered Floating Action Button (FAB) matching the mockup */}
        {activeTab === 'tasks' && (
          <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={handleOpenNewTask}
              aria-label="Lägg till ny uppgift"
              className="w-14 h-14 rounded-full bg-[#f06450] text-white flex items-center justify-center shadow-[0_4px_24px_rgba(240,100,80,0.5)] hover:brightness-110 active:scale-90 transition-all cursor-pointer group"
            >
              <Plus
                size={26}
                strokeWidth={2.5}
                className="group-hover:rotate-90 transition-transform duration-200"
              />
            </button>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <nav
          aria-label="Huvudnavigering"
          className="absolute bottom-0 inset-x-0 bg-[#0c1524]/95 backdrop-blur-md border-t border-slate-800/80 px-8 py-2.5 flex items-center justify-between z-10"
        >
          {/* Uppgifter Tab */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'tasks'
                ? 'text-[#f06450]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={20} strokeWidth={activeTab === 'tasks' ? 2.2 : 1.8} />
            <span className="text-[11px] font-medium leading-none">Uppgifter</span>
          </button>

          {/* Spacer for Floating Action Button */}
          <div className="w-12 h-6" />

          {/* Inställningar Tab */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'settings'
                ? 'text-[#f06450]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SunMedium size={20} strokeWidth={activeTab === 'settings' ? 2.2 : 1.8} />
            <span className="text-[11px] font-medium leading-none">Inställningar</span>
          </button>
        </nav>
      </main>

      {/* New / Edit Task Modal */}
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultDate={selectedDate}
        forceSaveError={forceSaveError}
      />
    </div>
  );
}
