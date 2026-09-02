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
      showToast(`⚡ ${label} Activated! Live state updated.`);
      // Immediately notify open pages to refresh data
      window.dispatchEvent(new CustomEvent('tejas-data-update', { detail: { scenario } }));
    } catch (e) {
      console.error(e);
      showToast(`⚠️ Failed to trigger: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    window.dispatchEvent(new CustomEvent('tejas-data-update'));
    showToast('🔄 Live telemetry refreshed.');
  };

  return (
    <>
      {toastMsg && (
        <div className="fixed top-20 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md text-white p-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700/80 z-50">
        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-700/80">
          Demo Control
        </div>

        {/* Normal / Nominal Grid */}
        <button
          disabled={loading}
          onClick={() => trigger('normal', 'Nominal Balanced Grid')}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
            activeScenario === 'normal'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Activity size={14} className={activeScenario === 'normal' ? 'text-white' : 'text-emerald-400'} />
          Normal
        </button>

        {/* Cloud Cover Drop Anomaly */}
        <button
          disabled={loading}
          onClick={() => trigger('cloud-cover', 'Cloud Cover Anomaly (-65% Solar)')}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
            activeScenario === 'cloud-cover'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <CloudRain size={14} className={activeScenario === 'cloud-cover' ? 'text-white' : 'text-amber-400'} />
          Cloud Cover Drop
        </button>

        {/* 30% Critical Lab Reserve Lock */}
        <button
          disabled={loading}
          onClick={() => trigger('critical-soc', '30% Lab Reserve Lock Test (SoC 24%)')}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
            activeScenario === 'critical-soc'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <ShieldAlert size={14} className={activeScenario === 'critical-soc' ? 'text-white' : 'text-red-400'} />
          30% Safety Lock
        </button>

        {/* Instant Refresh Button */}
        <button
          onClick={handleManualRefresh}
          title="Refresh live data immediately"
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </>
  );
}
