import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { getLeaderboard, getKpis } from '../api/api';
import { Trophy, Award, Zap, QrCode, Activity, Sun, BatteryCharging, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PublicKiosk() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [kpi, setKpi] = useState(null);

  const fetchBoard = async () => {
    try {
      const [boardRes, kpiRes] = await Promise.all([
        getLeaderboard(),
        getKpis(),
      ]);

      if (boardRes && boardRes.data) {
        setLeaderboard(boardRes.data);
      }
      if (boardRes && boardRes.topStudents) {
        setTopStudents(boardRes.topStudents);
      }
      if (kpiRes && kpiRes.data) {
        setKpi(kpiRes.data);
      }
    } catch (e) {
      console.error('Error polling kiosk data:', e);
    }
  };

  useEffect(() => {
    fetchBoard();
    const int = setInterval(fetchBoard, 4000);
    return () => clearInterval(int);
  }, []);

  // Generate crisp scannable QR code for camera scan
  useEffect(() => {
    const waLink = `https://wa.me/918238893551?text=${encodeURIComponent('Hi TEJAS GRID! I want to opt into Green Hour electricity deficit alerts for my hostel.')}`;
    QRCode.toDataURL(waLink, {
      width: 260,
      margin: 1,
      color: { dark: '#022c22', light: '#ffffff' },
    })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, []);

  const isGreenHour = kpi && (kpi.demo_state === 'DEFICIT_DETECTED' || kpi.deficit_kw > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 flex flex-col items-center justify-start -m-4 md:-m-6 lg:-m-8 pb-32 font-sans">
      {/* Live Campus Grid Status Banner */}
      <div className="w-full max-w-4xl mb-6">
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
          isGreenHour
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isGreenHour ? 'bg-amber-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                isGreenHour ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest block">
                {isGreenHour ? '🚨 GREEN HOUR NOW ACTIVE — HIGH DEFICIT' : '⚡ CAMPUS GRID STABLE — RENEWABLE SURPLUS'}
              </span>
              <p className="text-xs text-slate-300">
                {isGreenHour
                  ? `Solar deficit of ${Number(kpi?.deficit_kw || 180).toFixed(1)} kW detected. Conserve electricity in your hostel to earn +50 Karma Points!`
                  : 'Renewable solar & wind generation fully meet academic and residential campus demand.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <div className="flex items-center gap-1.5">
              <Sun size={15} className="text-yellow-400" />
              <span>Solar: {Math.round(kpi?.solar_generation_kw || 0)} kW</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity size={15} className="text-blue-400" />
              <span>Load: {Math.round(kpi?.campus_load_kw || 0)} kW</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
          <Zap size={14} /> Public Campus Display Kiosk • Hostel Lobby Screen
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
          CAMPUS <span className="text-emerald-400">GREEN HOUR</span> LEADERBOARD
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Conserve energy during peak grid deficit alerts to win points, vouchers, and the coveted Green Shield for your hostel!
        </p>
      </div>

      {/* Podium Display */}
      <div className="flex items-end justify-center gap-4 md:gap-8 mt-12 w-full max-w-4xl h-72">
        {/* 2nd Place */}
        {leaderboard[1] && (
          <div className="flex flex-col items-center w-48 md:w-56">
            <div className="bg-slate-900/90 p-4 rounded-t-2xl text-center border-t-4 border-slate-400 w-full shadow-lg">
              <span className="text-xs text-slate-400 font-bold uppercase">2nd Place</span>
              <h3 className="font-bold text-lg text-white truncate mt-1">{leaderboard[1].name}</h3>
              <p className="text-emerald-400 font-mono font-bold text-xl mt-1">
                {leaderboard[1].currentPoints} <span className="text-xs text-slate-400">KP</span>
              </p>
              <p className="text-xs text-slate-500">{leaderboard[1].cumulativeSavedKwh} kWh saved</p>
            </div>
            <div className="bg-slate-800 w-full h-32 flex items-center justify-center text-4xl font-black text-slate-500 shadow-inner rounded-b-lg">
              2
            </div>
          </div>
        )}

        {/* 1st Place */}
        {leaderboard[0] && (
          <div className="flex flex-col items-center w-56 md:w-64 z-10">
            <div className="bg-slate-900 p-5 rounded-t-2xl text-center border-t-4 border-yellow-400 w-full shadow-2xl relative">
              <div className="text-yellow-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1">
                <Trophy size={14} /> CAMPUS CHAMPIONS
              </div>
              <h3 className="font-extrabold text-xl md:text-2xl text-white truncate mt-1">{leaderboard[0].name}</h3>
              <p className="text-emerald-400 font-mono font-black text-3xl mt-1">
                {leaderboard[0].currentPoints} <span className="text-sm text-slate-400 font-normal">KP</span>
              </p>
              <p className="text-xs text-emerald-400/80 font-semibold">{leaderboard[0].cumulativeSavedKwh} kWh saved</p>
            </div>
            <div className="bg-slate-800/90 w-full h-44 flex items-center justify-center text-6xl font-black text-yellow-400 shadow-inner rounded-b-lg">
              1
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {leaderboard[2] && (
          <div className="flex flex-col items-center w-48 md:w-56">
            <div className="bg-slate-900/90 p-4 rounded-t-2xl text-center border-t-4 border-amber-600 w-full shadow-lg">
              <span className="text-xs text-slate-400 font-bold uppercase">3rd Place</span>
              <h3 className="font-bold text-lg text-white truncate mt-1">{leaderboard[2].name}</h3>
              <p className="text-emerald-400 font-mono font-bold text-xl mt-1">
                {leaderboard[2].currentPoints} <span className="text-xs text-slate-400">KP</span>
              </p>
              <p className="text-xs text-slate-500">{leaderboard[2].cumulativeSavedKwh} kWh saved</p>
            </div>
            <div className="bg-slate-800 w-full h-24 flex items-center justify-center text-4xl font-black text-slate-500 shadow-inner rounded-b-lg">
              3
            </div>
          </div>
        )}
      </div>

      {/* Top Student Champions */}
      {topStudents.length > 0 && (
        <div className="mt-12 w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Award size={16} className="text-yellow-400" /> Top Individual Student Champions (PostgreSQL)
          </h3>
          <div className="space-y-2.5">
            {topStudents.slice(0, 5).map((s, idx) => (
              <div
                key={s.id || idx}
                className="flex justify-between items-center bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-500 font-mono text-sm">#{idx + 1}</span>
                  <span className="font-bold text-slate-200 text-sm">{s.name || `Student #${s.id}`}</span>
                  {s.registrationNumber && (
                    <span className="text-[10px] text-slate-400 font-mono">({s.registrationNumber})</span>
                  )}
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">{s.karmaPoints} KP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Working Scannable QR Code Banner */}
      <div className="mt-10 bg-slate-900/90 p-6 rounded-3xl flex flex-wrap items-center justify-center gap-6 border border-emerald-500/30 max-w-xl shadow-2xl shadow-emerald-500/10">
        <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner border border-emerald-500/40">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Scan to Opt-in WhatsApp Alerts" className="w-full h-full object-contain rounded-xl" />
          ) : (
            <QrCode size={64} className="text-slate-950" />
          )}
        </div>
        <div className="text-center sm:text-left max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-black text-white">Scan with Camera to Opt-In</h3>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/40">
              Live QR
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Point your phone camera to instantly link your WhatsApp. Receive live Green Hour alerts and earn Karma points for your hostel during grid deficits!
          </p>
        </div>
      </div>
    </div>
  );
}
