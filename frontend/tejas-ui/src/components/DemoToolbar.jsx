import React, { useState } from 'react';
import { Play, CloudRain, Zap, Activity } from 'lucide-react';
import { triggerDemoScenario } from '../api/api';

export default function DemoToolbar() {
  const [loading, setLoading] = useState(false);

  const trigger = async (scenario) => {
    setLoading(true);
    try { await triggerDemoScenario(scenario); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 z-50">
      <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-700">Demo Controls</div>
      <button disabled={loading} onClick={() => trigger('normal')} className="px-4 py-2 rounded-full hover:bg-slate-800 flex items-center gap-2 text-sm transition">
        <Activity size={16} className="text-blue-400" /> Normal
      </button>
      <button disabled={loading} onClick={() => trigger('cloud-cover')} className="px-4 py-2 rounded-full hover:bg-slate-800 flex items-center gap-2 text-sm transition">
        <CloudRain size={16} className="text-amber-400" /> Cloud Cover
      </button>
      <button disabled={loading} onClick={() => trigger('demand-spike')} className="px-4 py-2 rounded-full hover:bg-slate-800 flex items-center gap-2 text-sm transition">
        <Zap size={16} className="text-red-400" /> Demand Spike
      </button>
    </div>
  );
}
