import React, { useEffect, useState } from 'react';
import { getExecutiveMetrics } from '../api/api';
import KpiCard from '../components/KpiCard';
import { Leaf, IndianRupee, Zap, Users } from 'lucide-react';

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getExecutiveMetrics().then(res => setMetrics(res.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Executive Analytics</h1>
        <p className="text-slate-500">Automated Scope 2 Carbon & ROI Reporting</p>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Cost Saved" value={metrics.total_cost_saved_inr} unit="INR" icon={IndianRupee} />
          <KpiCard title="Carbon Avoided" value={metrics.total_carbon_avoided_kg} unit="kg CO₂" icon={Leaf} />
          <KpiCard title="Energy Shifted" value={metrics.total_energy_saved_kwh} unit="kWh" icon={Zap} />
          <KpiCard title="Participating Hostels" value={metrics.participating_hostels} unit="Blocks" icon={Users} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center min-h-[300px] flex items-center justify-center">
        <div className="max-w-lg">
           <Leaf size={48} className="mx-auto text-emerald-500 mb-4" />
           <h2 className="text-2xl font-bold mb-2">Scope 2 Carbon Offset Report Generated</h2>
           <p className="text-slate-500 mb-6">The automated VPP has successfully shifted {metrics?.total_energy_saved_kwh || 0} kWh from peak grid reliance to renewable assets.</p>
           <button className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-slate-800 transition">
             Download Official PDF Report
           </button>
        </div>
      </div>
    </div>
  );
}
