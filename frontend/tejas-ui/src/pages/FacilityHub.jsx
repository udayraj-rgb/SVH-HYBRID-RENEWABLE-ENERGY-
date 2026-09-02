import React, { useState, useEffect } from 'react';
import { Sun, Wind, Battery, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import KpiCard from '../components/KpiCard';
import DispatchAlert from '../components/DispatchAlert';
import { getKpis, getDispatchRecommendation, get24hForecast } from '../api/api';

export default function FacilityHub() {
  const [kpis, setKpis] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [forecastSummary, setForecastSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, recRes, forecastRes] = await Promise.all([
        getKpis(),
        getDispatchRecommendation(),
        get24hForecast(),
      ]);

      if (kpiRes && kpiRes.data) {
        setKpis(kpiRes.data);
      }
      if (recRes && recRes.data) {
        setRecommendation(recRes.data);
      }
      if (forecastRes && forecastRes.hourly_forecast) {
        const formattedChart = forecastRes.hourly_forecast.map((item) => ({
          hour: `${String(item.hour).padStart(2, '0')}:00`,
          Solar: item.predicted_solar_kw,
          Wind: item.predicted_wind_kw,
          Load: item.predicted_campus_load_kw,
          Net: item.net_balance_kw,
        }));
        setChartData(formattedChart);
        setForecastSummary(forecastRes.summary);
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch facility data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 5-second automatic polling
    const interval = setInterval(fetchData, 5000);

    // Instant listener for DemoToolbar clicks
    const handleTejasUpdate = () => {
      fetchData();
    };
    window.addEventListener('tejas-data-update', handleTejasUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tejas-data-update', handleTejasUpdate);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Facility Control Room</h1>
          <p className="text-slate-500 text-sm">Real-Time Autonomous Campus Virtual Power Plant (VPP)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Telemetry Loop (5s)
          </div>
          <button
            onClick={fetchData}
            title="Refresh immediately"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Solar Generation"
            value={kpis.solar_generation_kw?.toFixed(1) || '0.0'}
            unit="kW"
            icon={Sun}
          />
          <KpiCard
            title="Wind Generation"
            value={kpis.wind_generation_kw?.toFixed(1) || '0.0'}
            unit="kW"
            icon={Wind}
          />
          <KpiCard
            title="Campus Load Demand"
            value={kpis.campus_load_kw?.toFixed(1) || '0.0'}
            unit="kW"
            icon={Zap}
          />
          <KpiCard
            title="BESS Battery SoC"
            value={kpis.battery_soc_percent?.toFixed(1) || '0.0'}
            unit="%"
            icon={Battery}
          />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 animate-pulse">
          Connecting to live telemetry streams...
        </div>
      )}

      {/* Main Grid: 24h Predictive Chart + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Predictive AI Curve */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">24-Hour AI Yield & Load Forecast</h3>
              <p className="text-xs text-slate-400">Scikit-Learn Random Forest PV Model + Diurnal Campus Load</p>
            </div>
            {forecastSummary && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
                Peak Solar: {Math.round(forecastSummary.total_projected_solar_kwh)} kWh
              </span>
            )}
          </div>

          <div className="w-full h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="Solar"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#solarGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Load"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#loadGrad)"
                  />
                  <Area type="monotone" dataKey="Wind" stroke="#10b981" strokeWidth={1.5} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Generating 24-hour predictive yield forecast...
              </div>
            )}
          </div>
        </div>

        {/* Dispatch Alert & Operational State */}
        <div className="lg:col-span-1 space-y-6">
          <DispatchAlert recommendation={recommendation} onExecuted={fetchData} />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Grid Telemetry State</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500 font-medium">Operating State</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-xs ${
                    kpis?.demo_state === 'DEFICIT_DETECTED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {kpis?.demo_state || 'NORMAL'}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500 font-medium">Net Power Flow</span>
                <span
                  className={`font-semibold ${
                    (kpis?.net_power_kw || 0) >= 0 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {kpis?.net_power_kw > 0 ? `+${kpis.net_power_kw}` : kpis?.net_power_kw} kW
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500 font-medium">Battery Discharge</span>
                <span className="font-semibold text-slate-800">{kpis?.battery_discharge_kw || 0.0} kW</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500 font-medium">Lab Reserve Lock</span>
                <span
                  className={`font-bold text-xs px-2 py-0.5 rounded ${
                    kpis?.critical_reserve_locked
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {kpis?.critical_reserve_locked ? 'LOCKED (30%)' : 'NORMAL'}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500 font-medium">Avoided Peak Tariff</span>
                <span className="font-bold text-emerald-600">₹{kpis?.cost_saved_today_inr || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
