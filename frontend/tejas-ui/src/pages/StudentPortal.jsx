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
