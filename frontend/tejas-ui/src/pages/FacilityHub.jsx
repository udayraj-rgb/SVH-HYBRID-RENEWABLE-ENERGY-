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
  Smartphone,
  ExternalLink,
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
  getStudents,
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

  // Interactive Microgrid Simulation State
  const [simState, setSimState] = useState({
    active: false,
    label: 'Real-Time SCADA Live',
    solarDelta: 0,
    loadDelta: 0,
    batteryMode: 'NORMAL',
  });

  const handleSimulate = (type) => {
    if (type === 'reset') {
      setSimState({ active: false, label: 'Real-Time SCADA Live', solarDelta: 0, loadDelta: 0, batteryMode: 'NORMAL' });
      fetchData();
      setActionMsg({ type: 'success', text: 'Telemetry reset to live SCADA sensor feeds.' });
      setTimeout(() => setActionMsg(null), 4000);
      return;
    }
    if (type === 'solar_boost') {
      setSimState({ active: true, label: 'Solar Irradiance Spike (+60 kW)', solarDelta: 60, loadDelta: 0, batteryMode: 'BOOST' });
      setKpis((prev) => {
        if (!prev) return prev;
        const newSolar = Math.round((Number(prev.solar_generation_kw || 280) + 60) * 10) / 10;
        const net = Math.round((newSolar + Number(prev.wind_generation_kw || 0) - Number(prev.campus_load_kw || 400)) * 10) / 10;
        return { ...prev, solar_generation_kw: newSolar, net_power_kw: net, demo_state: net >= 0 ? 'SURPLUS_EXPORT' : 'NORMAL' };
      });
      setActionMsg({ type: 'success', text: 'Simulation Applied: Cloud-free solar spike +60 kW. Excess energy feeding BESS storage.' });
    } else if (type === 'cloud_drop') {
      setSimState({ active: true, label: 'Monsoon Cloud Attenuation (-65%)', solarDelta: -150, loadDelta: 0, batteryMode: 'PEAK_SHAVE' });
      setKpis((prev) => {
        if (!prev) return prev;
        const newSolar = Math.max(25, Math.round(Number(prev.solar_generation_kw || 280) * 0.35));
        const net = Math.round((newSolar + Number(prev.wind_generation_kw || 0) - Number(prev.campus_load_kw || 400)) * 10) / 10;
        return { ...prev, solar_generation_kw: newSolar, net_power_kw: net, demo_state: 'DEFICIT_DETECTED', deficit_kw: Math.abs(net) };
      });
      setActionMsg({ type: 'error', text: 'Simulation Applied: Heavy cloud attenuation. Autonomous BESS peak-shaving dispatch initiated.' });
    } else if (type === 'island') {
      setSimState({ active: true, label: 'Grid Blackout (Microgrid Islanded)', solarDelta: 0, loadDelta: -80, batteryMode: 'ISLAND' });
      setKpis((prev) => {
        if (!prev) return prev;
        return { ...prev, demo_state: 'ISLANDED_AUTONOMOUS', net_power_kw: 0 };
      });
      setActionMsg({ type: 'success', text: 'Simulation Applied: 11kV grid isolated. Campus microgrid running 100% on captive DERs.' });
    } else if (type === 'load_shed') {
      setSimState({ active: true, label: 'Demand-Response Shed (-85 kW)', solarDelta: 0, loadDelta: -85, batteryMode: 'SHED' });
      setKpis((prev) => {
        if (!prev) return prev;
        const newLoad = Math.max(100, Number(prev.campus_load_kw || 400) - 85);
        const net = Math.round((Number(prev.solar_generation_kw || 200) + Number(prev.wind_generation_kw || 0) - newLoad) * 10) / 10;
        return { ...prev, campus_load_kw: newLoad, net_power_kw: net };
      });
      setActionMsg({ type: 'success', text: 'Simulation Applied: 85 kW non-essential hostel AC loads shed to protect lab servers.' });
    }
    setTimeout(() => setActionMsg(null), 5000);
  };

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

  const handleBroadcastAdvisory = async (advisory) => {
    try {
      const studentRes = await getStudents(campusId).catch(() => []);
      const currentStudents = Array.isArray(studentRes)
        ? studentRes
        : (studentRes?.data && Array.isArray(studentRes.data) ? studentRes.data : []);

      const activePhones = currentStudents
        .filter((s) => s.whatsappOptIn !== false)
        .map((s) => String(s.phoneNumber || '').replace(/[^0-9]/g, ''))
        .map((p) => (p.startsWith('91') ? p : '91' + p))
        .filter((p) => p.length >= 10);

      if (activePhones.length === 0) {
        setActionMsg({ type: 'error', text: `No WhatsApp-opted-in students found for ${currentCampus.name}.` });
        setTimeout(() => setActionMsg(null), 5000);
        return;
      }

      const alertText = `⚡ TEJAS GRID SCADA ADVISORY: ${advisory.titleEn || advisory.title}! ${advisory.messageEn || advisory.recommendation || advisory.message}. Please reduce room appliance consumption (+50 Karma Points rewarded).`;

      const res = await fetch('http://localhost:5001/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones: activePhones, message: alertText }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 503 || data.error?.includes('not linked')) {
          throw new Error('WhatsApp Gateway is not linked yet! Open http://localhost:5001 to link WhatsApp via QR code.');
        }
        throw new Error(data.error || `Gateway returned HTTP ${res.status}`);
      }

      setActionMsg({
        type: 'success',
        text: `Broadcasted advisory directly to WhatsApp of ${data.count || activePhones.length} student(s) at ${currentCampus.name}!`,
      });
    } catch (err) {
      setActionMsg({ type: 'error', text: `Broadcast failed: ${err.message}` });
    } finally {
      setTimeout(() => setActionMsg(null), 7000);
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
              <a
                href="http://localhost:5001"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
                title="Open WhatsApp Gateway Dispatcher Control (http://localhost:5001)"
              >
                <Smartphone size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Gateway</span>
                <ExternalLink size={11} className="opacity-70" />
              </a>
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

      {/* Action Notification Toast Banner */}
      {actionMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg transition-all animate-bounce-subtle ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 backdrop-blur-md'
              : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/40 backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className={actionMsg.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} />
            <span>{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="p-1 opacity-70 hover:opacity-100 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Interactive Microgrid Energy Flow & Simulation Lab */}
      <div className="card-interactive bg-gradient-to-r from-emerald-500/12 via-cyan-500/10 to-amber-500/12 dark:from-emerald-950/30 dark:via-slate-900/90 dark:to-amber-950/30 border border-emerald-500/30 dark:border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30 animate-pulse">
              <Zap size={18} className="fill-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Interactive Microgrid Flow &amp; Simulation Lab
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  LIVE INTERACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click simulation buttons below to test live autonomous BESS dispatch, cloud drop &amp; demand response
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
              Status: <span className="text-emerald-600 dark:text-emerald-400">{simState.label}</span>
            </span>
          </div>
        </div>

        {/* 5 Interactive Flow Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* Node 1: Solar */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-white/90 dark:to-slate-950/80 border border-amber-400/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-bold mb-1">
              <span className="flex items-center gap-1"><Sun size={14} /> Solar Array</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
              {Number(kpis?.solar_generation_kw || 0).toFixed(1)} <span className="text-xs font-sans font-normal text-slate-500">kW</span>
            </div>
            <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80 font-mono mt-1">
              {currentCampus.solarCapacityKw} kW Installed
            </div>
          </div>

          {/* Node 2: Wind */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-cyan-500/5 to-white/90 dark:to-slate-950/80 border border-cyan-400/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-cyan-700 dark:text-cyan-400 text-xs font-bold mb-1">
              <span className="flex items-center gap-1"><Wind size={14} /> Wind Turbines</span>
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            </div>
            <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
              {Number(kpis?.wind_generation_kw || 0).toFixed(1)} <span className="text-xs font-sans font-normal text-slate-500">kW</span>
            </div>
            <div className="text-[10px] text-cyan-700/80 dark:text-cyan-300/80 font-mono mt-1">
              {currentCampus.windCapacityKw} kW Gust Active
            </div>
          </div>

          {/* Node 3: BESS Storage */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-white/90 dark:to-slate-950/80 border border-emerald-400/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-1">
              <span className="flex items-center gap-1"><Battery size={14} /> BESS Storage</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 px-1 rounded">
                {Number(kpis?.battery_soc_percent ?? 50).toFixed(0)}%
              </span>
            </div>
            <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
              {Math.round(Number(kpis?.battery_soc_percent ?? 50) * 8)} <span className="text-xs font-sans font-normal text-slate-500">kWh</span>
            </div>
            <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-mono mt-1">
              Dispatch: {simState.batteryMode === 'NORMAL' ? 'Autonomous' : simState.batteryMode}
            </div>
          </div>

          {/* Node 4: Campus Load */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-white/90 dark:to-slate-950/80 border border-purple-400/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-bold mb-1">
              <span className="flex items-center gap-1"><Building2 size={14} /> Campus Load</span>
              <span className="text-[10px] font-mono">Academic</span>
            </div>
            <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
              {Number(kpis?.campus_load_kw || 400).toFixed(1)} <span className="text-xs font-sans font-normal text-slate-500">kW</span>
            </div>
            <div className="text-[10px] text-purple-700/80 dark:text-purple-300/80 font-mono mt-1">
              Demand Surcharge Safe
            </div>
          </div>

          {/* Node 5: Net State Grid Exchange */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-white/90 dark:to-slate-950/80 border border-blue-400/50 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 text-xs font-bold mb-1">
              <span className="flex items-center gap-1"><Shield size={14} /> State DISCOM</span>
              <span className="text-[10px] font-mono">11 kV</span>
            </div>
            <div className={`text-xl font-black font-mono ${Number(kpis?.net_power_kw || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {Number(kpis?.net_power_kw || 0) >= 0 ? `+${kpis?.net_power_kw}` : kpis?.net_power_kw} <span className="text-xs font-sans font-normal text-slate-500">kW</span>
            </div>
            <div className="text-[10px] text-blue-700/80 dark:text-blue-300/80 font-mono mt-1">
              {Number(kpis?.net_power_kw || 0) >= 0 ? 'Clean Green Export' : 'Importing Off-Peak'}
            </div>
          </div>
        </div>

        {/* Interactive Simulation Controls Bar */}
        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Sliders size={13} className="text-amber-500" />
            Trigger Simulation Scenario:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSimulate('solar_boost')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 cursor-pointer"
            >
              <Sun size={13} />
              <span>+60 kW Solar Spike</span>
            </button>
            <button
              onClick={() => handleSimulate('cloud_drop')}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 cursor-pointer"
            >
              <Flame size={13} />
              <span>-65% Monsoon Cloud</span>
            </button>
            <button
              onClick={() => handleSimulate('island')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 cursor-pointer"
            >
              <ShieldAlert size={13} />
              <span>Island Microgrid</span>
            </button>
            <button
              onClick={() => handleSimulate('load_shed')}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 cursor-pointer"
            >
              <Sliders size={13} />
              <span>Shed 85 kW Load</span>
            </button>
            <button
              onClick={() => handleSimulate('reset')}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reset SCADA</span>
            </button>
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

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {advisory.timestamp ? new Date(advisory.timestamp).toLocaleTimeString() : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBroadcastAdvisory(advisory)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        title="Broadcast this Green Hour advisory to registered students on WhatsApp"
                      >
                        <Radio size={13} />
                        <span>Broadcast WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleAcknowledge(advisory.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCheck size={13} />
                        <span>Acknowledge</span>
                      </button>
                    </div>
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
