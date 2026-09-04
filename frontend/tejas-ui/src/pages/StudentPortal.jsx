import React, { useEffect, useState } from 'react';
import { getRewards, toggleWhatsappOptIn, getStudents, sendDirectDeficitAlert, getKpis } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Award, Gift, Bell, Check, Sparkles, Send, Users, ShieldCheck, Zap } from 'lucide-react';

export default function StudentPortal() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [karmaBalance, setKarmaBalance] = useState(user?.karmaPoints || 870);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [currentDeficit, setCurrentDeficit] = useState(180.4);

  const currentUser = user?.role === 'STUDENT' ? {
    name: user.name,
    registrationNumber: user.registrationNumber || '24BCE1082',
    hostel: user.hostel || 'Block A (Aryabhata)',
    phoneNumber: user.phoneNumber || '+91 82388 93551',
    cleanNumber: user.cleanNumber || '918238893551',
    badge: user.badge || 'GREEN GUARDIAN',
  } : {
    name: 'Udayraj',
    registrationNumber: '24BCE1082',
    hostel: 'Block A (Aryabhata)',
    phoneNumber: '+91 82388 93551',
    cleanNumber: '918238893551',
    badge: 'OPERATOR AUDIT VIEW',
  };

  const loadData = async () => {
    try {
      const [rewardRes, students, kpis] = await Promise.all([
        getRewards(),
        getStudents(),
        getKpis(),
      ]);

      if (rewardRes && rewardRes.data) setRewards(rewardRes.data);
      if (students && students.length > 0) setStudentList(students);
      if (kpis && kpis.data && kpis.data.deficit_kw) {
        setCurrentDeficit(kpis.data.deficit_kw || 180.4);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRedeem = (reward) => {
    if (karmaBalance < reward.pointsCost) return;
    setKarmaBalance((prev) => prev - reward.pointsCost);
    setRedeemSuccess(`🎉 Successfully redeemed "${reward.name}"! Voucher TEJAS-${Math.floor(1000 + Math.random() * 9000)} sent to ${currentUser.phoneNumber}.`);
    setTimeout(() => setRedeemSuccess(null), 6000);
  };

  const handleToggleWhatsapp = async () => {
    setToggling(true);
    try {
      const res = await toggleWhatsappOptIn(1);
      setWhatsappOptIn(Boolean(res.whatsappOptIn));
    } catch (e) {
      setWhatsappOptIn((prev) => !prev);
    } finally {
      setToggling(false);
    }
  };

  const handleSendDirectAlert = async () => {
    setSendingAlert(true);
    const deficit = currentDeficit > 0 ? currentDeficit : 180.4;
    const msg = `⚡ TEJAS GRID ALERT: High campus load & solar deficit of ${deficit.toFixed(1)} kW detected! Green Hour is now active. Reduce non-essential appliances in ${currentUser.hostel} for 45 mins to earn 50 Karma points for your hostel leaderboard!`;

    try {
      // 1. Trigger backend orchestrator dispatch
      await sendDirectDeficitAlert('+918238893551', deficit);

      // 2. Open WhatsApp Web / App directly targeting 8238893551
      const url = `https://api.whatsapp.com/send?phone=${currentUser.cleanNumber}&text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');

      setAlertSuccess(`✅ Direct Deficit Alert Dispatched to ${currentUser.phoneNumber} via WhatsApp!`);
      setTimeout(() => setAlertSuccess(null), 6000);
    } catch (e) {
      // Fallback: open WhatsApp directly
      const url = `https://api.whatsapp.com/send?phone=${currentUser.cleanNumber}&text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      setAlertSuccess(`📲 WhatsApp opened with alert pre-filled for ${currentUser.phoneNumber}`);
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 font-sans">
      {/* Notifications */}
      {alertSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-400 animate-bounce">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-300" size={24} />
            <span className="font-bold text-sm">{alertSuccess}</span>
          </div>
          <button onClick={() => setAlertSuccess(null)} className="text-white/80 hover:text-white font-bold text-xs uppercase px-2 py-1">
            Dismiss
          </button>
        </div>
      )}

      {redeemSuccess && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-500 animate-fade-in">
          <div className="flex items-center gap-3">
            <Sparkles className="text-emerald-400" size={24} />
            <span className="font-semibold text-sm">{redeemSuccess}</span>
          </div>
          <button onClick={() => setRedeemSuccess(null)} className="text-white/80 hover:text-white font-bold text-xs uppercase px-2 py-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 rounded-3xl p-8 text-white shadow-2xl flex flex-wrap justify-between items-center gap-6 border border-emerald-700/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-400/20 text-emerald-300 text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              Active Student Resident
            </span>
            <span className="text-slate-400 text-xs font-mono font-bold">Reg: {currentUser.registrationNumber}</span>
          </div>
          <h1 className="text-4xl font-black mb-1 tracking-tight">{currentUser.name}</h1>
          <p className="text-emerald-300 text-sm font-medium mb-4">
            {currentUser.hostel} • <span className="font-mono">{currentUser.phoneNumber}</span>
          </p>
          <div className="inline-flex bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full font-semibold text-xs items-center gap-2 border border-white/20">
            <Award className="text-yellow-400" size={16} />
            Tier: {currentUser.badge}
          </div>
        </div>

        <div className="text-right bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-inner">
          <p className="opacity-80 text-xs uppercase tracking-widest font-bold mb-1">Karma Points Balance</p>
          <div className="text-6xl font-black text-emerald-300 font-mono tracking-tight">{karmaBalance}</div>
          <p className="text-xs text-emerald-400 mt-1 font-medium">+50 KP per Green Hour load reduction</p>
        </div>
      </div>

      {/* WhatsApp Deficit Trigger Panel for 8238893551 */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Bell size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-900">High Load / Deficit WhatsApp Dispatch</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Active Test Target: 8238893551
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              When campus load exceeds solar generation, an automated WhatsApp alert is triggered to notify students to turn off non-essential appliances.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleWhatsapp}
            disabled={toggling}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              whatsappOptIn
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            {whatsappOptIn ? (
              <>
                <ShieldCheck size={16} className="text-emerald-600" /> Opted In (8238893551)
              </>
            ) : (
              'Opt In to WhatsApp'
            )}
          </button>

          <button
            disabled={sendingAlert}
            onClick={handleSendDirectAlert}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Send size={15} />
            {sendingAlert ? 'Dispatching Alert...' : '📲 Send High Load Alert to 8238893551'}
          </button>
        </div>
      </div>

      {/* Student PostgreSQL Database Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Registered Hostel Students (PostgreSQL Database)</h3>
              <p className="text-xs text-slate-500">Auto-synced with PostgreSQL 15 `students` table</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
            {studentList.length} Students Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Registration No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Hostel Block</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4 text-center">WhatsApp Alert Status</th>
                <th className="py-3 px-4 text-right">Karma Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {studentList.map((st) => {
                const isTarget = st.phoneNumber?.includes('8238893551');
                return (
                  <tr key={st.id} className={`hover:bg-slate-50/80 transition ${isTarget ? 'bg-emerald-50/50' : ''}`}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {st.registrationNumber || `24BCE100${st.id}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      {st.name}
                      {isTarget && (
                        <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{st.hostel?.name || 'Block A (Aryabhata)'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{st.phoneNumber}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.whatsappOptIn
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.whatsappOptIn ? '✓ Opted In' : 'Off'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                      {st.karmaPoints} KP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rewards Store */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2.5 tracking-tight">
          <Gift className="text-emerald-600" /> Karma Points Reward Store
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-base mb-1.5 text-slate-900">{reward.name}</h3>
                <p className="text-slate-500 text-xs mb-4 leading-relaxed">{reward.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="font-black text-emerald-600 text-base">{reward.pointsCost} KP</span>
                <button
                  disabled={karmaBalance < reward.pointsCost}
                  onClick={() => handleRedeem(reward)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    karmaBalance >= reward.pointsCost
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm cursor-pointer active:scale-95'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
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
