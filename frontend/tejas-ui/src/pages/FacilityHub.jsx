import React, { useState, useEffect } from 'react';
import {
  Sun,
  Wind,
  Battery,
  Zap,
  RefreshCw,
  AlertCircle,
  Users,
  UserPlus,
  Phone,
  Trash2,
  Pencil,
  Send,
  Check,
  ShieldCheck,
  QrCode,
  X,
  Plus,
  Bell,
  CheckCircle2,
  MessageSquare,
  Radio,
  TrendingUp,
  Clock,
  ShieldAlert,
  Flame,
  CheckCheck,
  Layers,
  Building2,
  MapPin,
  Shield,
  Calculator,
  Sliders,
  Tv,
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
import MicrogridFormulaModal from '../components/MicrogridFormulaModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RAJASTHAN_CAMPUSES, getCampusById } from '../data/campuses';
import {
  getKpis,
  getDispatchRecommendation,
  get24hForecast,
  getOperatorLiveTelemetry,
  getOperatorDispatchSchedule,
  getOperatorActiveAdvisories,
  acknowledgeAdvisory,
  getOperatorFinancialSummary,
} from '../api/api';
import {
  subscribeCampusTelemetry,
  subscribeCampusAdvisories,
} from '../api/websocket';

export default function FacilityHub() {
  const { user, isGovt } = useAuth();
  const { isDark } = useTheme();
  const defaultCampusId = Number(user?.campusId) || 1;
  const [selectedCampusId, setSelectedCampusId] = useState(defaultCampusId);
  const campusId = isGovt() ? selectedCampusId : defaultCampusId;
  const currentCampus = getCampusById(campusId);

  const handleCampusChange = (newId) => {
    const id = Number(newId);
    setSelectedCampusId(id);
    setStompActive(false);
  };

  const [kpis, setKpis] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [forecastSummary, setForecastSummary] = useState(null);
  const [dispatchSchedule, setDispatchSchedule] = useState([]);
  const [activeAdvisories, setActiveAdvisories] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stompActive, setStompActive] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        kpiRes,
        recRes,
        forecastRes,
        liveTelRes,
        schedRes,
        advisoryRes,
        finRes,
      ] = await Promise.all([
        getKpis().catch(() => ({ data: null })),
        getDispatchRecommendation().catch(() => ({ data: null })),
        get24hForecast().catch(() => null),
        getOperatorLiveTelemetry(campusId).catch(() => null),
        getOperatorDispatchSchedule(campusId).catch(() => null),
        getOperatorActiveAdvisories(campusId).catch(() => []),
        getOperatorFinancialSummary(campusId, 'today').catch(() => null),
      ]);

      // Prioritize live telemetry from the multi-tenant operator endpoint
      if (liveTelRes && liveTelRes.id) {
        const solar = Number(liveTelRes.solarKw) || 0;
        const wind = Number(liveTelRes.windKw) || 0;
        const load = Number(liveTelRes.campusLoadKw) || 0;
        const soc = Number(liveTelRes.batterySocPct) || 50;
        const net = Math.round((solar + wind - load) * 10) / 10;
        const benefit = Math.round(
          finRes?.totalFinancialBenefitInr ??
          finRes?.totalSavingsInr ??
          ((solar + wind) * 6.8)
        );

        setKpis({
          solar_generation_kw: solar,
          wind_generation_kw: wind,
          campus_load_kw: load,
          battery_soc_percent: soc,
          net_power_kw: net,
          demo_state: (solar + wind) < load ? 'DEFICIT_DETECTED' : 'NORMAL',
          deficit_kw: Math.max(0, Math.round((load - (solar + wind)) * 10) / 10),
          battery_discharge_kw: liveTelRes.batteryDischargeKw || 0,
          critical_reserve_locked: soc <= 30,
          cost_saved_today_inr: benefit,
        });
      } else if (kpiRes && kpiRes.data) {
        setKpis(kpiRes.data);
      }

      if (recRes && recRes.data) {
        setRecommendation(recRes.data);
      }

      // Populate 24h schedule chart from optimizer
      if (Array.isArray(schedRes) && schedRes.length > 0) {
        setDispatchSchedule(schedRes);
        const formattedSchedule = schedRes.map((item) => ({
          hour: item.timeSlot ? item.timeSlot.split(' - ')[0] : `${String(item.hour).padStart(2, '0')}:00`,
          Solar: item.predictedSolarKw,
          Wind: item.predictedWindKw,
          Load: item.predictedLoadKw,
          Net: item.netBalanceKw,
          SoC: item.batteryTargetSocPct,
          window: item.tariffWindow,
        }));
        setChartData(formattedSchedule);
      } else if (forecastRes && forecastRes.hourly_forecast) {
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

      if (Array.isArray(advisoryRes)) {
        setActiveAdvisories(advisoryRes);
      }

      if (finRes) {
        setFinancialSummary(finRes);
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

    // 4-second automatic polling fallback
    const interval = setInterval(fetchData, 4000);

    // Subscribe to STOMP live telemetry stream
    const unsubscribeTelemetry = subscribeCampusTelemetry(campusId, (liveTelemetry) => {
      setStompActive(true);
      if (liveTelemetry) {
        setKpis((prev) => {
          const solar = liveTelemetry.solarKw ?? prev?.solar_generation_kw ?? 0;
          const wind = liveTelemetry.windKw ?? prev?.wind_generation_kw ?? 0;
          const load = liveTelemetry.campusLoadKw ?? prev?.campus_load_kw ?? 0;
          const soc = liveTelemetry.batterySocPct ?? prev?.battery_soc_percent ?? 50;
          return {
            ...prev,
            solar_generation_kw: solar,
            wind_generation_kw: wind,
            campus_load_kw: load,
            battery_soc_percent: soc,
            net_power_kw: Math.round((solar + wind - load) * 10) / 10,
            demo_state: (solar + wind) < load ? 'DEFICIT_DETECTED' : 'NORMAL',
            deficit_kw: Math.max(0, Math.round((load - (solar + wind)) * 10) / 10),
            critical_reserve_locked: soc <= 30,
          };
        });
        setLastUpdated(new Date());
      }
    });

    // Subscribe to STOMP active advisories
    const unsubscribeAdvisories = subscribeCampusAdvisories(campusId, (newAdvisory) => {
      if (newAdvisory && newAdvisory.id) {
        setActiveAdvisories((prev) => {
          const exists = prev.some((a) => a.id === newAdvisory.id);
          return exists ? prev : [newAdvisory, ...prev];
        });
      }
    });

    const handleTejasUpdate = () => fetchData();

    window.addEventListener('tejas-data-update', handleTejasUpdate);

    return () => {
      clearInterval(interval);
      if (typeof unsubscribeTelemetry === 'function') unsubscribeTelemetry();
      if (typeof unsubscribeAdvisories === 'function') unsubscribeAdvisories();
      window.removeEventListener('tejas-data-update', handleTejasUpdate);
    };
  }, [campusId]);

  const handleAcknowledge = async (advisoryId) => {
    try {
      await acknowledgeAdvisory(campusId, advisoryId);
      setActiveAdvisories((prev) => prev.filter((a) => a.id !== advisoryId));
      setActionMsg({ type: 'success', text: `Advisory #${advisoryId} successfully acknowledged by Operator.` });
    } catch (err) {
      setActionMsg({ type: 'error', text: `Failed to acknowledge advisory: ${err.message}` });
    } finally {
      setTimeout(() => setActionMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Zap size={10} /> SCADA STATION #{currentCampus.id} • {currentCampus.districtCode}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <MapPin size={10} /> {currentCampus.district} District
              </span>
              {stompActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40 flex items-center gap-1">
                  <Radio size={10} className="animate-pulse text-emerald-600 dark:text-emerald-400" /> STOMP LIVE
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Building2 className="text-emerald-600 dark:text-emerald-400 shrink-0" size={28} />
              <span>{currentCampus.name}</span>
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-xs flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Assigned Engineer: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{isGovt() ? currentCampus.engineerName : (user?.name || currentCampus.engineerName)}</strong> ({currentCampus.badgeId})</span>
              <span>•</span>
              <span>Autonomous Dispatch Optimizer &amp; RERC ToD Peak Shaving</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            {/* Campus Selector: Dropdown for DTE Admin (Statewide Authority), Locked Badge for Operator */}
            {isGovt() ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={campusId}
                    onChange={(e) => handleCampusChange(e.target.value)}
                    className="bg-white dark:bg-slate-950 text-slate-800 dark:text-white border border-emerald-500/50 hover:border-emerald-500 text-xs font-bold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition cursor-pointer appearance-none max-w-[220px] sm:max-w-[280px] truncate"
                  >
                    {RAJASTHAN_CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1">
                        {c.district}: {c.shortName || c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-2.5 pointer-events-none text-emerald-600 dark:text-emerald-400">
                    <Sliders size={13} />
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-2 py-1 rounded-lg">
                  <Building2 size={11} />
                  <span>DTE SUPERVISION</span>
                </span>
              </div>
            ) : (
              /* Locked Campus Badge (No Dropdown for Station Operator) */
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-amber-800 dark:text-amber-300 shadow-sm">
                <Shield size={13} className="text-amber-600 dark:text-amber-400" />
                <span className="font-bold">{currentCampus.badgeId}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-sans font-medium">{currentCampus.district}</span>
                <span className="text-[10px] text-amber-800 dark:text-amber-400/90 uppercase font-sans font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 ml-0.5">
                  CAMPUS LOCKED
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden md:inline">
                {lastUpdated.toLocaleTimeString()}
              </span>
              <button
                onClick={() => setShowFormulaModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
                title="View Microgrid Physics & Mathematical Formulation"
              >
                <Calculator size={13} />
                <span>Formula Logic</span>
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <Link
                to="/kiosk"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
                title="Launch Public Campus Display Kiosk"
              >
                <Tv size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Public Kiosk</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Microgrid Hardware Specs Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sun size={16} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">Solar PV Plant</div>
              <div className="font-extrabold text-slate-900 dark:text-white">{currentCampus.solarCapacityKw} kW</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wind size={16} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">Wind Micro-Turbines</div>
              <div className="font-extrabold text-slate-900 dark:text-white">{currentCampus.windCapacityKw} kW</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Battery size={16} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">BESS Battery</div>
              <div className="font-extrabold text-slate-900 dark:text-white">{currentCampus.batteryCapacityKwh} kWh</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">Sanctioned Contract</div>
              <div className="font-extrabold text-slate-900 dark:text-white">{currentCampus.sanctionedLoadKw} kW</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Stream */}
      {kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Solar Generation"
            value={
              kpis.solar_generation_kw !== undefined
                ? Number(kpis.solar_generation_kw).toFixed(1)
                : (kpis.solar_kw !== undefined ? Number(kpis.solar_kw).toFixed(1) : '0.0')
            }
            unit="kW"
            icon={Sun}
            trend={kpis.demo_state === 'DEFICIT_DETECTED' ? 'Cloud Drop (-65%)' : 'Optimal Photovoltaic'}
          />
          <KpiCard
            title="Wind Yield"
            value={
              kpis.wind_generation_kw !== undefined
                ? Number(kpis.wind_generation_kw).toFixed(1)
                : (kpis.wind_kw !== undefined ? Number(kpis.wind_kw).toFixed(1) : '0.0')
            }
            unit="kW"
            icon={Wind}
            trend="Nominal Gust (10m)"
          />
          <KpiCard
            title="Battery Storage (BESS)"
            value={`${Number(kpis.battery_soc_percent ?? kpis.battery_soc_pct ?? 50).toFixed(1)}%`}
            unit={`(${Math.round(Number(kpis.battery_soc_percent ?? kpis.battery_soc_pct ?? 50) * 8)} kWh)`}
            icon={Battery}
            trend={kpis.critical_reserve_locked ? 'Safety Lock (30%)' : 'Online / Dispatch Ready'}
          />
          <KpiCard
            title="Campus Demand"
            value={
              kpis.campus_load_kw !== undefined
                ? Number(kpis.campus_load_kw).toFixed(1)
                : '550.0'
            }
            unit="kW"
            icon={Zap}
            trend={(kpis.net_power_kw || 0) < 0 ? 'Deficit Active' : 'Self-Sustaining Clean'}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 animate-pulse">
          Connecting to campus telemetry stream...
        </div>
      )}

      {/* Active Bilingual Operational Advisories */}
      {activeAdvisories.length > 0 && (
        <div className="bg-amber-500/5 dark:bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl">
                <Flame size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Active Bilingual Operational Advisories</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                    {activeAdvisories.length} ACTIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  RERC Tariff Aligned • Real-time Microgrid Recommendations (English &amp; Hindi)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAdvisories.map((advisory) => {
              const title = advisory.titleEn || advisory.title || 'Operational Advisory';
              const titleHi = advisory.titleHi || advisory.titleHindi || '';
              const message = advisory.messageEn || advisory.recommendation || advisory.message || '';
              const messageHi = advisory.messageHi || advisory.recommendationHindi || '';
              const level = advisory.level || advisory.priority || 'INFO';
              const isCritical = level.includes('CRITICAL');
              const isRecommended = level.includes('RECOMMENDED') || level.includes('HIGH') || level.includes('WARN');

              return (
                <div
                  key={advisory.id}
                  className="bg-white dark:bg-slate-950/80 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isCritical
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/40'
                              : isRecommended
                              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/40'
                              : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 dark:border-blue-500/40'
                          }`}
                        >
                          {level.replace('_', ' ')}
                        </span>
                        {advisory.actionType && (
                          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {advisory.actionType}
                          </span>
                        )}
                      </div>
                      {advisory.estimatedSavingsInr > 0 && (
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Est. Savings: ₹{Math.round(advisory.estimatedSavingsInr)}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h4>
                    {titleHi && (
                      <p className="text-xs text-amber-800 dark:text-amber-300/90 font-medium mt-0.5">{titleHi}</p>
                    )}

                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{message}</p>
                    {messageHi && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed border-l-2 border-amber-500/40 pl-2.5 bg-amber-50/50 dark:bg-amber-950/20 py-1 rounded-r-md">
                        {messageHi}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {advisory.timestamp ? new Date(advisory.timestamp).toLocaleTimeString() : ''}
                    </span>
                    <button
                      onClick={() => handleAcknowledge(advisory.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCheck size={13} />
                      <span>Acknowledge</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: 24h Predictive Chart + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Predictive AI Curve */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between transition-colors">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">24-Hour AI Predictive Microgrid Dispatch</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                RERC Time-of-Day (ToD) tariff windows: Peak Shaving &amp; Solar Incentive Optimization
              </p>
            </div>
            {forecastSummary && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
                Peak Solar: {Math.round(forecastSummary.total_projected_solar_kwh)} kWh
              </span>
            )}
          </div>

          {/* RERC Tariff Window Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-[10px] font-mono">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
              <span className="font-bold block">OFF-PEAK SOLAR</span>
              <span className="text-slate-500 dark:text-slate-400">10:00-16:00 • ₹5.80/kWh</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span className="font-bold block">NORMAL WINDOW</span>
              <span className="text-slate-500 dark:text-slate-400">06:00-10, 16:00-18 • ₹7.50</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300">
              <span className="font-bold block">EVENING PEAK</span>
              <span className="text-slate-500 dark:text-slate-400">18:00-22:00 • ₹11.20/kWh</span>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300">
              <span className="font-bold block">NIGHT OFF-PEAK</span>
              <span className="text-slate-500 dark:text-slate-400">22:00-06:00 • ₹6.00/kWh</span>
            </div>
          </div>

          <div className="w-full h-72 min-h-[290px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.6} />
                  <XAxis dataKey="hour" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderRadius: '12px',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      color: isDark ? '#fff' : '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
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
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                Generating 24-hour predictive dispatch schedule...
              </div>
            )}
          </div>
        </div>

        {/* Dispatch Alert & RERC Financial Summary */}
        <div className="lg:col-span-1 space-y-6">
          <DispatchAlert recommendation={recommendation} onExecuted={fetchData} />

          {/* RERC Financial Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">RERC ToD Financial Card</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 dark:border-emerald-500/30">
                Today
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Sanctioned Contract Demand</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {financialSummary?.sanctionedDemandKw || currentCampus.sanctionedLoadKw} kW
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Total Energy Consumed</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {Math.round(financialSummary?.totalConsumedKwh || 4200)} kWh
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Solar Self-Consumption</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(financialSummary?.solarSelfConsumedKwh || 2450)} kWh
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Avoided Grid Cost</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-300">
                  ₹{Math.round(financialSummary?.avoidedGridCostInr ?? financialSummary?.grossGridCostInr ?? 2252)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Peak Shaved Capacity</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(financialSummary?.peakDemandShavedKw || 58.5)} kW
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Current Tariff Window</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-[11px]">
                  {financialSummary?.currentTariffWindow || 'Normal Window (₹7.50/kWh)'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Total Financial Benefit</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{Math.round(financialSummary?.totalFinancialBenefitInr ?? financialSummary?.totalSavingsInr ?? (((kpis?.solar_generation_kw || 0) + (kpis?.wind_generation_kw || 0)) * 6.8))}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500">
                <span>Evening Peak Surcharge Avoided</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{Math.round(financialSummary?.todPeakSavingsInr ?? financialSummary?.eveningPeakSavingsInr ?? 468)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Feedback Message */}
      {actionMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all animate-in fade-in ${
          actionMsg.type === 'success'
            ? 'bg-emerald-950/70 border border-emerald-500 text-emerald-200'
            : 'bg-red-950/70 border border-red-500 text-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className={actionMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'} />
            <span className="text-xs font-semibold">{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Microgrid Mathematical & Physics Formula Modal */}
      <MicrogridFormulaModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        campus={currentCampus}
      />
    </div>
  );
}
