import React, { useState } from 'react';
import { useAuth, DEFAULT_USERS } from '../context/AuthContext';
import { Zap, Shield, GraduationCap, Lock, ArrowRight, UserCheck, CheckCircle2, Sparkles, Building2, Activity } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'operator'

  // Student form state
  const [studentReg, setStudentReg] = useState('24BCE1082');
  const [studentPass, setStudentPass] = useState('••••••••');

  // Operator form state
  const [operatorId, setOperatorId] = useState('OP-7701');
  const [operatorPass, setOperatorPass] = useState('••••••••');

  const handleStudentLogin = (e) => {
    if (e) e.preventDefault();
    // Match against known students or use default
    if (studentReg === '24BCE1095') {
      login('STUDENT', DEFAULT_USERS.student2);
    } else if (studentReg === '24BCE1102') {
      login('STUDENT', DEFAULT_USERS.student3);
    } else {
      login('STUDENT', {
        ...DEFAULT_USERS.student1,
        registrationNumber: studentReg || '24BCE1082',
      });
    }
    if (onLoginSuccess) onLoginSuccess('STUDENT');
  };

  const handleOperatorLogin = (e) => {
    if (e) e.preventDefault();
    login('OPERATOR', DEFAULT_USERS.operator);
    if (onLoginSuccess) onLoginSuccess('OPERATOR');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl w-full relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs font-bold text-emerald-400 mb-4 shadow-xl">
            <Zap size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
            CAMPUS VIRTUAL POWER PLANT (VPP 2.0)
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span className="text-emerald-400">⚡ TEJAS</span> GRID
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Role-Based Access Portal: Connect as a Campus Student Resident or Authorized Facility Grid Engineer.
          </p>
        </div>

        {/* Role Selection Card */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/80">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 mb-6">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'student'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <GraduationCap size={18} />
              <span>Student Resident</span>
            </button>

            <button
              onClick={() => setActiveTab('operator')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'operator'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Shield size={18} />
              <span>Facility Operator</span>
            </button>
          </div>

          {/* TAB 1: Student Login */}
          {activeTab === 'student' && (
            <div>
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <GraduationCap className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-emerald-300">Student Resident Access:</p>
                  <p className="text-slate-400">
                    View personal Karma points, Green Hour alerts, redeem cafeteria vouchers, and participate in hostel energy savings.
                  </p>
                  <p className="text-emerald-400/90 font-medium pt-1">
                    🔒 Protected: Executive Analytics & Grid Controls are hidden for student privacy.
                  </p>
                </div>
              </div>

              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Hostel Registration / Roll Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentReg}
                      onChange={(e) => setStudentReg(e.target.value)}
                      placeholder="e.g. 24BCE1082"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      required
                    />
                    <div className="absolute right-3 top-3 text-xs text-slate-500 font-mono">VIT-B</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Hostel Portal PIN / Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={studentPass}
                      onChange={(e) => setStudentPass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      required
                    />
                    <Lock className="absolute right-3.5 top-3.5 text-slate-500" size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Quick Demo Student Profiles */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  1-Click Quick Demo Login (Pre-Configured Students):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      login('STUDENT', DEFAULT_USERS.student1);
                      if (onLoginSuccess) onLoginSuccess('STUDENT');
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all hover:border-emerald-500/50 group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400">Udayraj</div>
                    <div className="text-[10px] text-slate-400 font-mono">24BCE1082 (Blk A)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      login('STUDENT', DEFAULT_USERS.student2);
                      if (onLoginSuccess) onLoginSuccess('STUDENT');
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all hover:border-emerald-500/50 group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400">Aniket Gawai</div>
                    <div className="text-[10px] text-slate-400 font-mono">24BCE1095 (Blk A)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      login('STUDENT', DEFAULT_USERS.student3);
                      if (onLoginSuccess) onLoginSuccess('STUDENT');
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all hover:border-emerald-500/50 group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400">Priya Patel</div>
                    <div className="text-[10px] text-slate-400 font-mono">24BEE1045 (Blk B)</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Facility Operator Login */}
          {activeTab === 'operator' && (
            <div>
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <Shield className="text-amber-400 shrink-0 mt-0.5" size={20} />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-amber-300">SCADA Engineering Clearance:</p>
                  <p className="text-slate-400">
                    Full authority to view 1,200 kW PV arrays, 24h AI predictive curves, 30% battery reserve safety lock, and official ESG Executive Analytics.
                  </p>
                  <p className="text-amber-400/90 font-medium pt-1">
                    ✓ Executive Analytics Unlocked: Cost savings (₹), carbon reduction, and grid audit logs.
                  </p>
                </div>
              </div>

              <form onSubmit={handleOperatorLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Engineer / Operator Badge ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={operatorId}
                      onChange={(e) => setOperatorId(e.target.value)}
                      placeholder="e.g. OP-7701"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      required
                    />
                    <div className="absolute right-3 top-3 text-xs text-amber-400 font-bold font-mono">LEVEL-4</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    SCADA Passkey / Security Token
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={operatorPass}
                      onChange={(e) => setOperatorPass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      required
                    />
                    <Lock className="absolute right-3.5 top-3.5 text-slate-500" size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  <span>Authorize & Enter Mission Control</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Quick Demo Operator Profile */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  1-Click Quick Demo Login (Chief Operator):
                </p>
                <button
                  type="button"
                  onClick={() => {
                    login('OPERATOR', DEFAULT_USERS.operator);
                    if (onLoginSuccess) onLoginSuccess('OPERATOR');
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all hover:border-amber-500/50 group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400">Eng. Rajesh Verma</div>
                    <div className="text-[10px] text-slate-400">Chief Energy Officer & SCADA Director (Full Access)</div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md">
                    OP-7701
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          TEJAS GRID VPP 2.0 • Smart VIT Hackathon Hybrid Renewable Energy
        </div>
      </div>
    </div>
  );
}
