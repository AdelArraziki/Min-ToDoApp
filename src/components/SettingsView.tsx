import React from 'react';
import { ScreenState } from '../types/todo';
import { requestNotificationPermission } from '../utils/soundUtils';
import {
  RotateCcw,
  CheckCircle2,
  Trash2,
  Download,
  Smartphone,
  Monitor,
  Sparkles,
  AlertTriangle,
  Layers,
  Inbox,
  RefreshCw,
  Bell,
  Volume2,
} from 'lucide-react';

interface SettingsViewProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  screenState: ScreenState;
  setScreenState: (val: ScreenState) => void;
  forceSaveError: boolean;
  setForceSaveError: (val: boolean) => void;
  onResetDefaultTasks: () => void;
  onLoadTwelveTasks: () => void;
  onClearDayTasks: () => void;
  onMarkAllDone: () => void;
  onOpenNewTaskWithInvalidInterval: () => void;
  onExportTasks: () => void;
  onTestAlarmTrigger: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isMobileFrame,
  setIsMobileFrame,
  screenState,
  setScreenState,
  forceSaveError,
  setForceSaveError,
  onResetDefaultTasks,
  onLoadTwelveTasks,
  onClearDayTasks,
  onMarkAllDone,
  onOpenNewTaskWithInvalidInterval,
  onExportTasks,
  onTestAlarmTrigger,
}) => {
  return (
    <div className="py-2 px-1 text-slate-100 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Inställningar</h2>
        <p className="text-xs text-slate-400 mt-1">
          Anpassa vy, hantera data och testa appens alla lägen från skisserna.
        </p>
      </div>

      {/* Frame Mode */}
      <div className="bg-[#192538] rounded-2xl p-4 border border-slate-700/40 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Visningsläge
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsMobileFrame(true)}
            className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
              isMobileFrame
                ? 'bg-[#f06450] text-white border-[#f06450]'
                : 'bg-[#111d2e] border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone size={15} />
            <span>Mobilram (9:41)</span>
          </button>
          <button
            onClick={() => setIsMobileFrame(false)}
            className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
              !isMobileFrame
                ? 'bg-[#f06450] text-white border-[#f06450]'
                : 'bg-[#111d2e] border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Monitor size={15} />
            <span>Fullskärm</span>
          </button>
        </div>
      </div>

      {/* Scenario Switcher matching user's images */}
      <div className="bg-[#192538] rounded-2xl p-4 border border-slate-700/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Sparkles size={14} className="text-[#f06450]" />
          <span>Testa skissernas alla lägen</span>
        </div>
        <p className="text-xs text-slate-400">
          Växla direkt mellan de olika tillstånden som visades i dina uppladdade bilder:
        </p>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {/* Normal state */}
          <button
            onClick={() => {
              setScreenState('normal');
              onResetDefaultTasks();
            }}
            className="w-full text-left p-3 rounded-xl bg-[#111d2e] hover:bg-[#152336] border border-slate-700/60 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#48bb78]" />
              <div>
                <p className="text-xs font-medium text-white group-hover:text-white">
                  Bild 1: Dagslista (Normal)
                </p>
                <p className="text-[11px] text-slate-400">
                  Återställer till 4 uppgifter (Träna, Frukost, Plugga, Städa)
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#f06450] font-medium">Välj</span>
          </button>

          {/* Empty state */}
          <button
            onClick={() => {
              setScreenState('normal');
              onClearDayTasks();
            }}
            className="w-full text-left p-3 rounded-xl bg-[#111d2e] hover:bg-[#152336] border border-slate-700/60 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2.5">
              <Inbox size={16} className="text-slate-400" />
              <div>
                <p className="text-xs font-medium text-white group-hover:text-white">
                  Bild 3: Tom dag ("En dag att fylla")
                </p>
                <p className="text-[11px] text-slate-400">
                  Visar tomvyn med "Lägg till uppgift"-knapp
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#f06450] font-medium">Välj</span>
          </button>

          {/* Loading state */}
          <button
            onClick={() => setScreenState(screenState === 'loading' ? 'normal' : 'loading')}
            className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition ${
              screenState === 'loading'
                ? 'bg-[#1b2b42] border-[#f06450]'
                : 'bg-[#111d2e] hover:bg-[#152336] border-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw size={16} className={`text-slate-400 ${screenState === 'loading' ? 'animate-spin' : ''}`} />
              <div>
                <p className="text-xs font-medium text-white">
                  Bild 4: Laddningsläge (Skeleton)
                </p>
                <p className="text-[11px] text-slate-400">
                  "Hämtar dagens uppgifter..." med pulserande kort
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#f06450] font-medium">
              {screenState === 'loading' ? 'Aktiv' : 'Välj'}
            </span>
          </button>

          {/* Loading Error state */}
          <button
            onClick={() => setScreenState(screenState === 'error' ? 'normal' : 'error')}
            className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition ${
              screenState === 'error'
                ? 'bg-[#1b2b42] border-[#f06450]'
                : 'bg-[#111d2e] hover:bg-[#152336] border-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={16} className="text-[#f06450]" />
              <div>
                <p className="text-xs font-medium text-white">
                  Bild 5: Laddningsfel
                </p>
                <p className="text-[11px] text-slate-400">
                  "Kunde inte hämta uppgifter" och "Försök igen"
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#f06450] font-medium">
              {screenState === 'error' ? 'Aktiv' : 'Välj'}
            </span>
          </button>

          {/* 12 Tasks state */}
          <button
            onClick={() => {
              setScreenState('normal');
              onLoadTwelveTasks();
            }}
            className="w-full text-left p-3 rounded-xl bg-[#111d2e] hover:bg-[#152336] border border-slate-700/60 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2.5">
              <Layers size={16} className="text-[#4299e1]" />
              <div>
                <p className="text-xs font-medium text-white">
                  Bild 6: 12 långa uppgifter
                </p>
                <p className="text-[11px] text-slate-400">
                  "12 uppgifter" och "Rulla för att se fler uppgifter"
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#f06450] font-medium">Ladda</span>
          </button>

          {/* Invalid time interval modal */}
          <button
            onClick={onOpenNewTaskWithInvalidInterval}
            className="w-full text-left p-3 rounded-xl bg-[#111d2e] hover:bg-[#152336] border border-slate-700/60 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={16} className="text-[#f5a623]" />
              <div>
                <p className="text-xs font-medium text-white">
                  Bild 8: Ogiltigt tidsintervall
                </p>
                <p className="text-[11px] text-slate-400">
                  Öppnar formuläret med röd kant & 18:00–17:00 feltext
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#f06450] font-medium">Öppna</span>
          </button>

          {/* Save error in modal */}
          <div className="p-3 rounded-xl bg-[#111d2e] border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white">
                Bild 10: Simulera sparfel
              </p>
              <p className="text-[11px] text-slate-400">
                När aktiverad visas röd sparruta & "Försök igen"-knapp
              </p>
            </div>
            <button
              onClick={() => setForceSaveError(!forceSaveError)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                forceSaveError
                  ? 'bg-[#f06450] text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {forceSaveError ? 'PÅ' : 'AV'}
            </button>
          </div>
        </div>
      </div>

      {/* Larm & Upprepning sektion */}
      <div className="bg-[#192538] rounded-2xl p-4 border border-slate-700/40 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Larm & Notiser
        </h3>

        <div className="space-y-2">
          <button
            onClick={() => onTestAlarmTrigger()}
            className="w-full py-2.5 px-3 rounded-xl bg-[#111d2e] hover:bg-[#152336] text-xs text-slate-200 hover:text-white flex items-center justify-between border border-slate-700/60 transition group"
          >
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-[#f06450] fill-[#f06450]" />
              <span>Testa larmrutan och larmljudet nu</span>
            </div>
            <span className="text-[11px] text-[#f06450] font-medium group-hover:underline">Kör</span>
          </button>

          <button
            onClick={async () => {
              const granted = await requestNotificationPermission();
              alert(granted ? 'Webbläsarnotiser är nu aktiverade!' : 'Webbläsarnotiser nekades eller stöds inte i denna vy.');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#111d2e] hover:bg-[#152336] text-xs text-slate-200 hover:text-white flex items-center justify-between border border-slate-700/60 transition group"
          >
            <div className="flex items-center gap-2">
              <Volume2 size={15} className="text-slate-400" />
              <span>Begär webbläsartillåtelse för notiser</span>
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-white">Aktivera</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
          Uppgifter med larm spelar en mjuk klocksignal och visar ett interaktivt larmfält med snooze-knapp när tiden infaller.
        </p>
      </div>

      {/* Data Management */}
      <div className="bg-[#192538] rounded-2xl p-4 border border-slate-700/40 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Datahantering
        </h3>

        <div className="space-y-2">
          <button
            onClick={onMarkAllDone}
            className="w-full py-2.5 px-3 rounded-xl bg-[#111d2e] hover:bg-[#152336] text-xs text-slate-200 hover:text-white flex items-center gap-2 border border-slate-700/60 transition"
          >
            <CheckCircle2 size={15} className="text-[#48bb78]" />
            <span>Markera alla uppgifter för vald dag som klara</span>
          </button>

          <button
            onClick={onResetDefaultTasks}
            className="w-full py-2.5 px-3 rounded-xl bg-[#111d2e] hover:bg-[#152336] text-xs text-slate-200 hover:text-white flex items-center gap-2 border border-slate-700/60 transition"
          >
            <RotateCcw size={15} className="text-[#4299e1]" />
            <span>Återställ standarduppgifter (Bild 1)</span>
          </button>

          <button
            onClick={onExportTasks}
            className="w-full py-2.5 px-3 rounded-xl bg-[#111d2e] hover:bg-[#152336] text-xs text-slate-200 hover:text-white flex items-center gap-2 border border-slate-700/60 transition"
          >
            <Download size={15} className="text-slate-400" />
            <span>Exportera uppgifter (JSON)</span>
          </button>

          <button
            onClick={onClearDayTasks}
            className="w-full py-2.5 px-3 rounded-xl bg-[#281b2a] hover:bg-[#322035] text-xs text-[#f06450] flex items-center gap-2 border border-[#f06450]/20 transition"
          >
            <Trash2 size={15} />
            <span>Töm vald dags alla uppgifter</span>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center pt-2 text-slate-500 text-xs space-y-1">
        <p className="font-medium text-slate-400">To Do App</p>
        <p>Designad och implementerad enligt specifikation och bifogade bilder.</p>
      </div>
    </div>
  );
};
