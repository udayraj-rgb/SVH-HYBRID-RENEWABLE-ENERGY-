import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RAJASTHAN_CAMPUSES, getCampusById } from '../data/campuses';
import {
  Zap,
  Shield,
  GraduationCap,
  Lock,
  ArrowRight,
  Building2,
  Sparkles,
  AlertCircle,
  Activity,
  CheckCircle2,
  Sun,
  Moon,
  Cpu,
  MapPin,
  Sliders,
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { loginWithCredentials } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('govt'); // 'govt' | 'operator' | 'student'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form credentials by role
  const [govtUser, setGovtUser] = useState('govt_admin');
  const [govtPass, setGovtPass] = useState('Govt@2026');

  // Campus selection for Operator
  const [selectedCampusId, setSelectedCampusId] = useState(1);
  const selectedCampus = getCampusById(selectedCampusId);

  const [operatorUser, setOperatorUser] = useState('operator_bikaner');
  const [operatorPass, setOperatorPass] = useState('Operator@2026');

  const handleSelectCampus = (campusId) => {
    const camp = getCampusById(campusId);
    setSelectedCampusId(camp.id);
    setOperatorUser(camp.operatorUsername);
    setOperatorPass('Operator@2026');
    setErrorMsg(null);
  };

  // Campus and Student selection for Student Resident
  const [studentCampusId, setStudentCampusId] = useState(1);
  const selectedStudentCampus = getCampusById(studentCampusId);

  const [studentUser, setStudentUser] = useState('student_bikaner');
  const [studentPass, setStudentPass] = useState('Student@2026');

  const handleSelectStudentCampus = (campusId) => {
    const camp = getCampusById(campusId);
    setStudentCampusId(camp.id);
    setStudentUser(camp.studentUsername);
    setStudentPass('Student@2026');
    setErrorMsg(null);
  };

  const handleLogin = async (e, username, password, expectedRole, customProfile = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginWithCredentials(username, password, customProfile);
      if (onLoginSuccess) {
        onLoginSuccess(res.role || expectedRole);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Verify backend service is running on port 8080.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative font-sans flex flex-col justify-between overflow-x-hidden transition-colors duration-200 bg-slate-950"
      style={{
        backgroundImage: "url('/rajasthan_backdrop.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Translucent cinematic overlay for ambient depth and contrast */}
      <div className="fixed inset-0 bg-slate-950/20 dark:bg-slate-950/45 pointer-events-none z-0" />

      {/* Main Content: Centered Glassmorphic Multi-Tenant Authentication Terminal below State Heading */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-12 px-4 sm:px-6 w-full">
        {/* Glassmorphic Multi-Tenant Authentication Terminal */}
        <div className="w-full max-w-lg bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/15 shadow-2xl shadow-black/50 p-6 sm:p-8 text-slate-900 dark:text-white mx-auto transition-all">
          <div className="mb-6 pb-4 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider mb-1.5 border border-amber-500/30">
                <Zap size={11} className="fill-amber-500 text-amber-500" />
                <span>TEJAS GRID VPP 2.0</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Shield size={18} className="text-amber-500 dark:text-amber-400" />
                <span>Portal Authentication</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select your designated clearance tier across 20 Campuses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white border border-slate-200 dark:border-white/20 shadow-xs transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
              >
                {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-500" />}
              </button>
              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md">
                JWT SECURED
              </span>
            </div>
          </div>

          {/* 3 Role Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 dark:bg-black/40 p-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 mb-6">
            <button
              onClick={() => { setActiveTab('govt'); setErrorMsg(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'govt'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'
              }`}
            >
              <Building2 size={16} />
              <span>DTE Admin</span>
            </button>

            <button
              onClick={() => { setActiveTab('operator'); setErrorMsg(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'operator'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'
              }`}
            >
              <Shield size={16} />
              <span>Operator</span>
            </button>

            <button
              onClick={() => { setActiveTab('student'); setErrorMsg(null); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'
              }`}
            >
              <GraduationCap size={16} />
              <span>Student</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: DTE STATE ADMIN (ROLE_GOVT) */}
          {activeTab === 'govt' && (
            <div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Building2 className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-blue-900 dark:text-blue-300">DTE Rajasthan State Administrator:</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Statewide authority over all 20 anchor technical campuses, NAAC Criterion 7.1.2 audits, district comparative ranking, and aggregate MW load-shaving summaries.
                  </p>
                  <p className="text-blue-700 dark:text-blue-400 font-medium pt-1">
                    Clearance: Unrestricted Statewide Access (ROLE_GOVT)
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => handleLogin(e, govtUser, govtPass, 'ROLE_GOVT')} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Government Officer Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={govtUser}
                      onChange={(e) => setGovtUser(e.target.value)}
                      placeholder="govt_admin"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      required
                    />
                    <div className="absolute right-3 top-3 text-xs text-blue-600 dark:text-blue-400 font-bold font-mono">DTE-RAJ</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Official Security Passkey
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={govtPass}
                      onChange={(e) => setGovtPass(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      required
                    />
                    <Lock className="absolute right-3.5 top-3.5 text-slate-400" size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating with Directorate...' : 'Enter Statewide Command Center'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* 1-Click Quick Demo Login Button */}
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  1-Click Demo Login (Pre-configured Credentials):
                </p>
                <button
                  type="button"
                  onClick={(e) => handleLogin(e, 'govt_admin', 'Govt@2026', 'ROLE_GOVT')}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition-all hover:border-blue-500/50 group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Shri Alok Sharma, IAS</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Director, Technical Education Rajasthan (Statewide Access)</div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                    STATEWIDE
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FACILITY OPERATOR (ROLE_OPERATOR) */}
          {activeTab === 'operator' && (
            <div className="space-y-5">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex items-start gap-3">
                <Shield className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-amber-900 dark:text-amber-300">SCADA Facility Clearance (Campus Scoped):</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Dedicated operator clearance for individual Rajasthan anchor campuses. Each facility features unique PV/wind generation, diurnal demand profiles, and autonomous battery dispatch.
                  </p>
                  <p className="text-amber-700 dark:text-amber-400 font-medium pt-1">
                    Clearance: Assigned Campus Level 4 (ROLE_OPERATOR)
                  </p>
                </div>
              </div>

              {/* 1. CAMPUS SELECTOR DROPDOWN (All 20 Rajasthan Anchor Campuses) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-amber-600 dark:text-amber-400" />
                    Select Campus Microgrid Station ({RAJASTHAN_CAMPUSES.length} Campuses)
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                    Station #{selectedCampus.id} • {selectedCampus.districtCode}
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCampusId}
                    onChange={(e) => handleSelectCampus(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors cursor-pointer appearance-none pr-10"
                  >
                    {RAJASTHAN_CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1">
                        {c.district}: {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-amber-600 dark:text-amber-400">
                    <Sliders size={16} />
                  </div>
                </div>
              </div>

              {/* Quick Select Station Pills for Top Anchor Hubs */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPin size={11} className="text-amber-500" />
                  Quick Select Anchor Stations:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RAJASTHAN_CAMPUSES.filter((c) => c.isMajorHub).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCampus(c.id)}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        selectedCampusId === c.id
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/60 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span>{c.district}</span>
                      <span className="text-[9px] opacity-70 font-mono">({c.districtCode})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. OPERATOR CREDENTIALS FORM */}
              <form onSubmit={(e) => handleLogin(e, operatorUser, operatorPass, 'ROLE_OPERATOR')} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Station Operator Username / Badge ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={operatorUser}
                      onChange={(e) => setOperatorUser(e.target.value)}
                      placeholder="operator_username"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors"
                      required
                    />
                    <div className="absolute right-3 top-3 text-xs text-amber-600 dark:text-amber-400 font-bold font-mono">
                      {selectedCampus.districtCode}-STATION
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    SCADA Passkey
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={operatorPass}
                      onChange={(e) => setOperatorPass(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors"
                      required
                    />
                    <Lock className="absolute right-3.5 top-3.5 text-slate-400" size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-amber-600/25 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Validating Station SCADA Token...' : `Authorize ${selectedCampus.shortName} SCADA Hub`}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* 4. 1-CLICK QUICK DEMO LOGIN BUTTON */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  1-Click Quick Demo Login ({selectedCampus.shortName}):
                </p>
                <button
                  type="button"
                  onClick={(e) => handleLogin(e, selectedCampus.operatorUsername, 'Operator@2026', 'ROLE_OPERATOR')}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition-all hover:border-amber-500/50 group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      {selectedCampus.engineerName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {selectedCampus.engineerTitle} • {selectedCampus.name}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 px-2 py-0.5 rounded-md font-mono">
                    {selectedCampus.badgeId}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STUDENT RESIDENT (ROLE_STUDENT) */}
          {activeTab === 'student' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 flex items-start gap-3">
                <GraduationCap className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">Campus Resident Student Access (Campus Scoped):</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Live renewable generation mix, hostel energy leaderboard, avoided carbon metrics, bilingual conservation tips, and cafeteria reward redemptions across 20 technical campuses.
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium pt-1">
                    Clearance: Resident Student • Institutional Microgrid & Hostel Scoped
                  </p>
                </div>
              </div>

              {/* 1. CAMPUS SELECTOR DROPDOWN (All 20 Rajasthan Anchor Campuses) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                    Select Academic Campus ({RAJASTHAN_CAMPUSES.length} Technical Campuses)
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                    Campus #{selectedStudentCampus.id} • {selectedStudentCampus.districtCode}
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={studentCampusId}
                    onChange={(e) => handleSelectStudentCampus(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors cursor-pointer appearance-none pr-10"
                  >
                    {RAJASTHAN_CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1">
                        {c.district}: {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-emerald-600 dark:text-emerald-400">
                    <Sliders size={16} />
                  </div>
                </div>
              </div>

              {/* Quick Select Anchor Pills for Top Anchor Hubs */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-500" />
                  Quick Select Anchor Colleges:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RAJASTHAN_CAMPUSES.filter((c) => c.isMajorHub).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectStudentCampus(c.id)}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        studentCampusId === c.id
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/60 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span>{c.district}</span>
                      <span className="text-[9px] opacity-70 font-mono">({c.districtCode})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. STUDENT CREDENTIALS FORM */}
              <form
                onSubmit={(e) => {
                  const currentStudent = selectedStudentCampus.students?.[0];
                  handleLogin(e, studentUser, studentPass, 'ROLE_STUDENT', currentStudent);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Student Roll / Account Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentUser}
                      onChange={(e) => setStudentUser(e.target.value)}
                      placeholder="student_username"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                      required
                    />
                    <div className="absolute right-3 top-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      {selectedStudentCampus.districtCode}-STU
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Hostel Portal PIN / Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={studentPass}
                      onChange={(e) => setStudentPass(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                      required
                    />
                    <Lock className="absolute right-3.5 top-3.5 text-slate-400" size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Connecting to Hostel Hub...' : `Enter ${selectedStudentCampus.shortName} Student Portal`}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* 3. 1-CLICK QUICK DEMO LOGIN BUTTON */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  1-Click Quick Demo Login ({selectedStudentCampus.shortName}):
                </p>
                {(() => {
                  const currentStudent = selectedStudentCampus.students?.[0];
                  return (
                    <button
                      type="button"
                      onClick={(e) =>
                        handleLogin(e, selectedStudentCampus.studentUsername, 'Student@2026', 'ROLE_STUDENT', currentStudent)
                      }
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition-all hover:border-emerald-500/50 group flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {currentStudent?.name} ({currentStudent?.regNo})
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {currentStudent?.hostel} • Room {currentStudent?.room} • {selectedStudentCampus.name}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-md font-mono">
                        {currentStudent?.karmaPoints} KP
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Official Rajasthan DTE Footer */}
      <footer className="w-full py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-amber-200/40 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TEJAS GRID VPP 2.0 • Directorate of Technical Education, Government of Rajasthan</span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">20 Districts Synchronized • NAAC Criterion 7.1.2 Compliant</span>
        </div>
      </footer>
    </div>
  );
}


