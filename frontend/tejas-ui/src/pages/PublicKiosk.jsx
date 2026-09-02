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
