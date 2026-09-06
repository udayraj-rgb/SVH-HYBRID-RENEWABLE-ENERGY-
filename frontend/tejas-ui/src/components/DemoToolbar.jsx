import React, { useState } from 'react';
import { Play, CloudRain, Zap, Activity, ShieldAlert, RefreshCw, Check } from 'lucide-react';
import { triggerDemoScenario } from '../api/api';

export default function DemoToolbar() {
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState('normal');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const trigger = async (scenario, label) => {
    setLoading(true);
    setActiveScenario(scenario);
    try {
      await triggerDemoScenario(scenario);
      showToast(`${label} Activated! Live state updated.`);
      // Immediately notify open pages to refresh data
      window.dispatchEvent(new CustomEvent('tejas-data-update', { detail: { scenario } }));
    } catch (e) {
      console.error(e);
      showToast(`Failed to trigger: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    window.dispatchEvent(new CustomEvent('tejas-data-update'));
    showToast('Live telemetry refreshed.');
  };

  return (
    <>
      {toastMsg && (
        <div className="fixed top-20 right-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white p-2 rounded-xl shadow-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 z-50">
        <div className="px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800">
          Demo Control
        </div>

        {/* Normal / Nominal Grid */}
        <button
          disabled={loading}
          onClick={() => trigger('normal', 'Nominal Balanced Grid')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
            activeScenario === 'normal'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Activity size={14} className={activeScenario === 'normal' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
          Normal
        </button>

        {/* Cloud Cover Drop Anomaly */}
        <button
          disabled={loading}
          onClick={() => trigger('cloud-cover', 'Cloud Cover Anomaly (-65% Solar)')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
            activeScenario === 'cloud-cover'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <CloudRain size={14} className={activeScenario === 'cloud-cover' ? 'text-white' : 'text-amber-600 dark:text-amber-400'} />
          Cloud Cover Drop
        </button>

        {/* 30% Critical Lab Reserve Lock */}
        <button
          disabled={loading}
          onClick={() => trigger('critical-soc', '30% Lab Reserve Lock Test (SoC 24%)')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
            activeScenario === 'critical-soc'
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <ShieldAlert size={14} className={activeScenario === 'critical-soc' ? 'text-white' : 'text-red-600 dark:text-red-400'} />
          30% Safety Lock
        </button>

        {/* Instant Refresh Button */}
        <button
          onClick={handleManualRefresh}
          title="Refresh live data immediately"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </>
  );
}
