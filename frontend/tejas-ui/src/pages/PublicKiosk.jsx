import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/api';
import { Trophy, Award, Zap, QrCode } from 'lucide-react';

export default function PublicKiosk() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  const fetchBoard = async () => {
    try {
      const res = await getLeaderboard();
      if (res && res.data) {
        setLeaderboard(res.data);
      }
      if (res && res.topStudents) {
        setTopStudents(res.topStudents);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBoard();
    const int = setInterval(fetchBoard, 5000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 md:p-12 flex flex-col items-center justify-start -m-4 md:-m-6 lg:-m-8 pb-32">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
          <Zap size={14} /> Smart Campus Energy Gamification
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
          CAMPUS <span className="text-emerald-400">GREEN HOUR</span> LEADERBOARD
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Conserve energy during peak grid deficit alerts to win points and prizes for your hostel!
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
                <Trophy size={14} /> CHAMPIONS
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
            <Award size={16} className="text-yellow-400" /> Individual Student Champions
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
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">{s.karmaPoints} KP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Banner */}
      <div className="mt-10 bg-slate-900/90 p-6 rounded-2xl flex flex-wrap items-center justify-center gap-6 border border-slate-800 max-w-xl">
        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center text-slate-950 p-2">
          <QrCode size={56} />
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold text-emerald-400">Opt-in to WhatsApp Alerts!</h3>
          <p className="text-slate-400 text-xs mt-1">
            Receive automated Green Hour notifications when solar drops.<br />
            Earn individual karma points and lead your hostel to victory.
          </p>
        </div>
      </div>
    </div>
  );
}
