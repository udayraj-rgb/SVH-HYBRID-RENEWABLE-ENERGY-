$baseDir = "D:\tejas-grid\frontend\tejas-ui\src"
New-Item -ItemType Directory -Force -Path "$baseDir\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "$baseDir\components" | Out-Null
New-Item -ItemType Directory -Force -Path "$baseDir\api" | Out-Null

$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"@
Set-Content -Path "D:\tejas-grid\frontend\tejas-ui\tailwind.config.js" -Value $tailwindConfig

$indexCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #f8fafc;
  color: #0f172a;
}
"@
Set-Content -Path "$baseDir\index.css" -Value $indexCss

$appJsx = @"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FacilityHub from './pages/FacilityHub';
import PublicKiosk from './pages/PublicKiosk';
import StudentPortal from './pages/StudentPortal';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import DemoToolbar from './components/DemoToolbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
          <div className="text-xl font-bold flex items-center gap-2">
            <span className="text-emerald-400">⚡ TEJAS</span> GRID
          </div>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-emerald-400 transition-colors">Facility Hub</Link>
            <Link to="/kiosk" className="hover:text-emerald-400 transition-colors">Public Kiosk</Link>
            <Link to="/student" className="hover:text-emerald-400 transition-colors">Student Portal</Link>
            <Link to="/executive" className="hover:text-emerald-400 transition-colors">Executive</Link>
          </div>
        </nav>
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<FacilityHub />} />
            <Route path="/kiosk" element={<PublicKiosk />} />
            <Route path="/student" element={<StudentPortal />} />
            <Route path="/executive" element={<ExecutiveDashboard />} />
          </Routes>
        </main>
        <DemoToolbar />
      </div>
    </Router>
  );
}
export default App;
"@
Set-Content -Path "$baseDir\App.jsx" -Value $appJsx

$apiJs = @"
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getKpis = () => api.get('/dashboard/kpis');
export const getDispatchRecommendation = () => api.get('/orchestration/dispatch/recommendation');
export const executeDispatch = (id) => api.patch(`/orchestration/dispatch/events/`+id+`/execute`);
export const triggerDemoScenario = (scenario) => api.post(`/demo/scenario/`+scenario);
export const getLeaderboard = () => api.get('/gamification/leaderboard');
export const getRewards = () => api.get('/gamification/rewards');
export const getExecutiveMetrics = () => api.get('/gamification/metrics/executive');

export default api;
"@
Set-Content -Path "$baseDir\api\api.js" -Value $apiJs

$kpiCardJsx = @"
import React from 'react';

export default function KpiCard({ title, value, unit, icon: Icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          <span className="text-sm font-semibold text-slate-400">{unit}</span>
        </div>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
        <Icon size={24} />
      </div>
    </div>
  );
}
"@
Set-Content -Path "$baseDir\components\KpiCard.jsx" -Value $kpiCardJsx

$dispatchAlertJsx = @"
import React from 'react';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { executeDispatch } from '../api/api';

export default function DispatchAlert({ recommendation, onExecuted }) {
  if (!recommendation || recommendation.anomalyType === 'NORMAL') {
    return (
      <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-100 flex items-center gap-4">
        <CheckCircle className="text-emerald-500" size={32} />
        <div>
          <h3 className="font-bold text-lg">System Normal</h3>
          <p className="text-emerald-600">All assets operating within optimal parameters.</p>
        </div>
      </div>
    );
  }

  const isCritical = recommendation.severity === 'CRITICAL';
  
  const handleExecute = async () => {
    try {
      if (recommendation.eventId) {
         await executeDispatch(recommendation.eventId);
         if(onExecuted) onExecuted();
      }
    } catch(e) { console.error(e); }
  }

  return (
    <div className={`p-6 rounded-xl border flex flex-col gap-4 ${isCritical ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
      <div className="flex items-start gap-4">
        <AlertTriangle className={isCritical ? 'text-red-500' : 'text-amber-500'} size={32} />
        <div className="flex-grow">
          <h3 className="font-bold text-lg uppercase tracking-wider">{recommendation.anomalyType.replace('_', ' ')}</h3>
          <p className="opacity-80 text-sm mb-2">{recommendation.notificationMessage}</p>
          <div className="bg-white/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Recommended Actions:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {recommendation.actions?.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold opacity-70 uppercase tracking-wider">Projected Savings</div>
          <div className="text-xl font-bold">₹{recommendation.estimatedCostSavedInr}</div>
          <div className="text-sm opacity-70 mt-2">Peak Reduction</div>
          <div className="text-lg font-bold">{recommendation.projectedPeakReductionKw} kW</div>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-black/10 pt-4">
        <button className="px-4 py-2 font-medium hover:bg-black/5 rounded-lg transition">Acknowledge</button>
        <button onClick={handleExecute} className={`px-6 py-2 font-bold rounded-lg text-white shadow-md flex items-center gap-2 ${isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
          <Zap size={18} /> Execute Dispatch
        </button>
      </div>
    </div>
  );
}
"@
Set-Content -Path "$baseDir\components\DispatchAlert.jsx" -Value $dispatchAlertJsx

$demoToolbarJsx = @"
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
"@
Set-Content -Path "$baseDir\components\DemoToolbar.jsx" -Value $demoToolbarJsx

$facilityHubJsx = @"
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
"@
Set-Content -Path "$baseDir\pages\FacilityHub.jsx" -Value $facilityHubJsx

$publicKioskJsx = @"
import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/api';

export default function PublicKiosk() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await getLeaderboard();
        setLeaderboard(res.data);
      } catch (e) { console.error(e); }
    };
    fetchBoard();
    const int = setInterval(fetchBoard, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="h-screen bg-slate-900 text-white p-10 flex flex-col items-center justify-center -m-4 md:-m-6 lg:-m-8">
      <h1 className="text-5xl font-bold mb-4 tracking-wider"><span className="text-emerald-400">GREEN</span> CAMPUS LEADERBOARD</h1>
      <p className="text-xl text-slate-400 mb-12">Conserve energy during Green Hours to earn Karma Points for your hostel!</p>
      
      <div className="flex items-end justify-center gap-6 mt-10 h-[300px]">
        {/* 2nd Place */}
        {leaderboard[1] && (
          <div className="flex flex-col items-center animate-fade-in-up delay-100">
            <div className="bg-slate-800 p-4 rounded-t-xl text-center border-t-4 border-slate-300 w-48">
               <h3 className="font-bold text-xl">{leaderboard[1].name}</h3>
               <p className="text-emerald-400 font-mono text-2xl mt-2">{leaderboard[1].currentPoints} KP</p>
            </div>
            <div className="bg-slate-700 w-48 h-32 flex items-center justify-center text-4xl font-black text-slate-500 shadow-inner">2</div>
          </div>
        )}
        
        {/* 1st Place */}
        {leaderboard[0] && (
          <div className="flex flex-col items-center animate-fade-in-up z-10">
            <div className="bg-slate-800 p-4 rounded-t-xl text-center border-t-4 border-yellow-400 w-56 shadow-2xl">
               <div className="text-yellow-400 mb-2">👑 CHAMPIONS</div>
               <h3 className="font-bold text-2xl">{leaderboard[0].name}</h3>
               <p className="text-emerald-400 font-mono text-3xl mt-2">{leaderboard[0].currentPoints} KP</p>
            </div>
            <div className="bg-slate-700 w-56 h-48 flex items-center justify-center text-6xl font-black text-yellow-500 shadow-inner">1</div>
          </div>
        )}

        {/* 3rd Place */}
        {leaderboard[2] && (
          <div className="flex flex-col items-center animate-fade-in-up delay-200">
            <div className="bg-slate-800 p-4 rounded-t-xl text-center border-t-4 border-amber-600 w-48">
               <h3 className="font-bold text-xl">{leaderboard[2].name}</h3>
               <p className="text-emerald-400 font-mono text-2xl mt-2">{leaderboard[2].currentPoints} KP</p>
            </div>
            <div className="bg-slate-700 w-48 h-24 flex items-center justify-center text-4xl font-black text-slate-500 shadow-inner">3</div>
          </div>
        )}
      </div>

      <div className="mt-20 bg-slate-800 p-6 rounded-2xl flex items-center gap-8 border border-slate-700">
        <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center text-slate-900 font-bold text-center p-2">
          [ QR CODE PLACEHOLDER ]
        </div>
        <div>
          <h3 className="text-2xl font-bold text-emerald-400 mb-2">Opt-in to WhatsApp Alerts!</h3>
          <p className="text-slate-300">Scan to join the Tejas Grid bot.<br/>Get instantly notified during Grid Events and earn individual rewards.</p>
        </div>
      </div>
    </div>
  );
}
"@
Set-Content -Path "$baseDir\pages\PublicKiosk.jsx" -Value $publicKioskJsx

$studentPortalJsx = @"
import React, { useEffect, useState } from 'react';
import { getRewards } from '../api/api';
import { Award, Gift, Clock } from 'lucide-react';

export default function StudentPortal() {
  const [rewards, setRewards] = useState([]);
  const student = { name: "Rahul Kumar", karmaPoints: 450, badge: "GREEN GUARDIAN" };

  useEffect(() => {
    getRewards().then(res => setRewards(res.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-3xl p-8 text-white shadow-lg flex justify-between items-center">
         <div>
            <p className="opacity-80 text-lg">Welcome back,</p>
            <h1 className="text-4xl font-bold mb-4">{student.name}</h1>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-semibold flex items-center gap-2">
              <Award className="text-yellow-300" />
              Badge: {student.badge}
            </div>
         </div>
         <div className="text-right">
            <p className="opacity-80 text-lg uppercase tracking-wider mb-1">Karma Points Balance</p>
            <div className="text-6xl font-black text-emerald-300 font-mono">{student.karmaPoints}</div>
         </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Gift className="text-emerald-500" /> Reward Store
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col">
              <h3 className="font-bold text-lg mb-2 text-slate-800">{reward.name}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-grow">{reward.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="font-bold text-emerald-600 text-lg">{reward.pointsCost} KP</span>
                <button className={`px-4 py-2 rounded-lg font-semibold ${student.karmaPoints >= reward.pointsCost ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
"@
Set-Content -Path "$baseDir\pages\StudentPortal.jsx" -Value $studentPortalJsx

$executiveDashboardJsx = @"
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
"@
Set-Content -Path "$baseDir\pages\ExecutiveDashboard.jsx" -Value $executiveDashboardJsx

# Setup Vite Config for proxy
$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
"@
Set-Content -Path "D:\tejas-grid\frontend\tejas-ui\vite.config.js" -Value $viteConfig
