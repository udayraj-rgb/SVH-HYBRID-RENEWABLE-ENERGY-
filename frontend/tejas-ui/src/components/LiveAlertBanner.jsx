import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Zap, X, Check, MessageSquare } from 'lucide-react';
import { getKpis, executeDispatch } from '../api/api';

export default function LiveAlertBanner() {
  const [kpis, setKpis] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappSent, setWhatsappSent] = useState(false);

  const checkGrid = async () => {
    try {
      const res = await getKpis();
      if (res && res.data) {
        setKpis(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkGrid();
    const interval = setInterval(checkGrid, 4000);
    const handleUpdate = () => checkGrid();
    window.addEventListener('tejas-data-update', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tejas-data-update', handleUpdate);
    };
  }, []);

  const isDeficit = kpis && kpis.demo_state === 'DEFICIT_DETECTED';
  const deficitKw = kpis ? (kpis.deficit_kw || 180.4).toFixed(1) : '180.0';

  const alertMessage = `TEJAS GRID ALERT: Solar deficit of ${deficitKw} kW detected on campus! Green Hour is now active. Reduce non-essential appliances in your hostel for 45 mins to earn 50 Karma points for your hostel leaderboard!`;

  const handleOpenWhatsApp = (customNumber) => {
    const cleanNum = (customNumber || phoneNumber).replace(/[^0-9]/g, '');
    let url = '';
    if (cleanNum && cleanNum.length >= 10) {
      // Direct message to specific phone number
      const fullNum = cleanNum.startsWith('91') ? cleanNum : `91${cleanNum}`;
      url = `https://api.whatsapp.com/send?phone=${fullNum}&text=${encodeURIComponent(alertMessage)}`;
    } else {
      // General WhatsApp share
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(alertMessage)}`;
    }
    window.open(url, '_blank');
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 5000);
  };

  const handleClaimPoints = async () => {
    try {
      await executeDispatch();
      setClaimed(true);
      setTimeout(() => setClaimed(false), 5000);
      window.dispatchEvent(new CustomEvent('tejas-data-update'));
    } catch (e) {
      setClaimed(true);
    }
  };

  return (
    <>
      {/* Top Banner when Electricity is Low */}
      {isDeficit && (
        <div className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 text-white px-4 py-2.5 shadow-lg border-b border-white/20 flex flex-wrap items-center justify-between gap-3 text-sm z-40 animate-pulse">
          <div className="flex items-center gap-2.5 font-semibold">
            <AlertTriangle className="text-yellow-300 animate-bounce" size={20} />
            <span>
              <strong className="uppercase">Campus Electricity Deficit ({deficitKw} kW)!</strong> Green Hour is active — please turn off heavy appliances in your hostel.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenWhatsApp()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow transition"
            >
              <MessageSquare size={14} /> Send to WhatsApp
            </button>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1 rounded-lg text-xs backdrop-blur-sm transition"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Modal / Alert Dialog */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 relative">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl bg-slate-100 dark:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Electricity Shortage Notification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Autonomous Campus Demand-Response Alert</p>
              </div>
            </div>

            {/* Message Preview Box */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 p-4 rounded-xl mb-5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5 uppercase tracking-wider">
                <span>Incoming WhatsApp Message:</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                  Twilio Sandbox
                </span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-mono whitespace-pre-line">
                {alertMessage}
              </p>
            </div>

            {/* Send to Your Personal Number */}
            <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Send this alert directly to your phone:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your phone number (e.g. 9876543210)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-grow px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                />
                <button
                  onClick={() => handleOpenWhatsApp(phoneNumber)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition shrink-0 cursor-pointer"
                >
                  <MessageSquare size={14} /> Open in WhatsApp
                </button>
              </div>
              {whatsappSent && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={14} /> WhatsApp window opened!
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClaimPoints}
                disabled={claimed}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  claimed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900'
                }`}
              >
                {claimed ? (
                  <>
                    <Check size={16} /> +50 Karma Points Claimed!
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-yellow-400 dark:text-amber-500" /> I Reduced Load (Claim +50 KP)
                  </>
                )}
              </button>

              <button
                onClick={() => setOpenModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
