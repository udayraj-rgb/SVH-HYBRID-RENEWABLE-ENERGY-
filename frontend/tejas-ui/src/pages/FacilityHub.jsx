import React, { useState, useEffect } from 'react';
import { Sun, Wind, Activity, Battery, Zap } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import DispatchAlert from '../components/DispatchAlert';
import { getKpis, getDispatchRecommendation } from '../api/api';

export default function FacilityHub() {
  const [kpis, setKpis] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const fetchData = async () => {
    try {
      const [kpiRes, recRes] = await Promise.all([getKpis(), getDispatchRecommendation()]);
      setKpis(kpiRes.data);
      setRecommendation(recRes.data);
    } catch (e) { console.error('Failed to fetch data', e); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Facility Control Room</h1>
          <p className="text-slate-500">Live Telemetry & Orchestration Engine</p>
        </div>
        <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Live Sync Active
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Solar Generation" value={kpis.solar_generation_kw?.toFixed(1) || 0} unit="kW" icon={Sun} />
          <KpiCard title="Wind Generation" value={kpis.wind_generation_kw?.toFixed(1) || 0} unit="kW" icon={Wind} />
          <KpiCard title="Campus Load" value={kpis.campus_load_kw?.toFixed(1) || 0} unit="kW" icon={Zap} />
          <KpiCard title="Battery SoC" value={kpis.battery_soc_percent?.toFixed(1) || 0} unit="%" icon={Battery} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-center min-h-[300px]">
          <p className="text-slate-400">Load Forecast Chart goes here (Recharts)</p>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <DispatchAlert recommendation={recommendation} onExecuted={fetchData} />
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
             <h3 className="font-bold text-lg mb-4">Grid Status</h3>
             <div className="space-y-3">
               <div className="flex justify-between border-b pb-2">
                 <span className="text-slate-500">State</span>
                 <span className="font-semibold uppercase text-slate-700">{kpis?.demo_state || 'UNKNOWN'}</span>
               </div>
               <div className="flex justify-between border-b pb-2">
                 <span className="text-slate-500">Grid Import</span>
                 <span className="font-semibold">{kpis?.grid_import_kw?.toFixed(1)} kW</span>
               </div>
               <div className="flex justify-between border-b pb-2">
                 <span className="text-slate-500">Cost Saved Today</span>
                 <span className="font-semibold text-emerald-600">₹{kpis?.cost_saved_today_inr}</span>
               </div>
               <div className="flex justify-between border-b pb-2">
                 <span className="text-slate-500">Carbon Avoided</span>
                 <span className="font-semibold text-emerald-600">{kpis?.carbon_avoided_today_kg} kg</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
