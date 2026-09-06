import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Trophy,
  Award,
  Zap,
  QrCode,
  Activity,
  Sun,
  Wind,
  BatteryCharging,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  X,
  Smartphone,
  Leaf,
  Trees,
  Sparkles,
  Building2,
  RefreshCw,
  Tv,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStudentKiosk, getLeaderboard, getKpis, enrollStudent } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function PublicKiosk() {
  const { user, isStudent, isOperator } = useAuth();
  const campusId = user?.campusId || 1;

  const [kioskData, setKioskData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [waChatUrl, setWaChatUrl] = useState('');
  const [gatewayPhone, setGatewayPhone] = useState('918368436712');

  // Self-Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollFeedback, setEnrollFeedback] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    registrationNumber: '',
    phoneNumber: '',
    hostelId: 1,
    hostel: 'Block A (Aryabhata)',
  });

  const fetchKiosk = async () => {
    try {
      const [kioskRes, boardRes, kpiRes] = await Promise.all([
        getStudentKiosk(campusId).catch(() => null),
        getLeaderboard(campusId).catch(() => null),
        getKpis().catch(() => null),
      ]);

      if (kioskRes) {
        setKioskData(kioskRes);
        if (kioskRes.hostelLeaderboard && kioskRes.hostelLeaderboard.length > 0) {
          setLeaderboard(kioskRes.hostelLeaderboard);
        } else if (boardRes?.data && boardRes.data.length > 0) {
          setLeaderboard(boardRes.data);
        }

        if (kioskRes.topStudents && kioskRes.topStudents.length > 0) {
          setTopStudents(kioskRes.topStudents);
        } else if (boardRes?.topStudents && boardRes.topStudents.length > 0) {
          setTopStudents(boardRes.topStudents);
        }
      } else {
        if (boardRes && boardRes.data) {
          setLeaderboard(boardRes.data);
        }
        if (boardRes && boardRes.topStudents) {
          setTopStudents(boardRes.topStudents);
        }
      }
    } catch (e) {
      console.error('Error polling student kiosk data:', e);
    }
  };

  useEffect(() => {
    fetchKiosk();
    const interval = setInterval(fetchKiosk, 4000);

    const handleStudentEnrolled = () => fetchKiosk();
    window.addEventListener('tejas-student-enrolled', handleStudentEnrolled);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tejas-student-enrolled', handleStudentEnrolled);
    };
  }, [campusId]);

  // Generate crisp scannable QR code for camera scan with structured WhatsApp enrollment template
  useEffect(() => {
    const initQr = async () => {
      let botPhone = '918368436712';
      try {
        const res = await fetch('http://localhost:5001/api/status');
        const data = await res.json();
        if (data && data.user) {
          botPhone = String(data.user).replace(/[^0-9]/g, '');
        }
      } catch (err) {
        console.warn('Could not fetch gateway status, using default gateway number:', err);
      }
      setGatewayPhone(botPhone);

      const template = `*TEJAS GRID ENROLLMENT REQUEST*\n\nHello TEJAS Grid, please enroll me in Green Hour alerts!\n\nName: [Enter Your Name]\nReg No: [e.g. 24BCE1050]\nHostel: Block A (Aryabhata)\n\nPlease register me in the Campus Student Directory!`;
      const waLink = `https://wa.me/${botPhone}?text=${encodeURIComponent(template)}`;
      setWaChatUrl(waLink);

      QRCode.toDataURL(waLink, {
        width: 280,
        margin: 1,
        color: { dark: '#022c22', light: '#ffffff' },
      })
        .then(setQrCodeUrl)
        .catch(console.error);
    };

    initQr();
  }, []);

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollForm.name || !enrollForm.phoneNumber) {
      setEnrollFeedback({ type: 'error', text: 'Please enter your name and phone number.' });
      return;
    }

    setEnrollLoading(true);
    try {
      await enrollStudent({
        name: enrollForm.name,
        registrationNumber: enrollForm.registrationNumber || `24BCE${enrollForm.phoneNumber.slice(-4)}`,
        phoneNumber: enrollForm.phoneNumber,
        hostelId: Number(enrollForm.hostelId),
        hostel: enrollForm.hostel,
      });

      setEnrollFeedback({
        type: 'success',
        text: `Welcome ${enrollForm.name}! You are now enrolled in the Student Directory with 100 starting Karma Points! A WhatsApp confirmation has been dispatched.`,
      });

      await fetchKiosk();
      window.dispatchEvent(new Event('tejas-student-enrolled'));

      setTimeout(() => {
        setShowEnrollModal(false);
        setEnrollFeedback(null);
        setEnrollForm({
          name: '',
          registrationNumber: '',
          phoneNumber: '',
          hostelId: 1,
          hostel: 'Block A (Aryabhata)',
        });
      }, 3500);
    } catch (err) {
      setEnrollFeedback({ type: 'error', text: `Enrollment error: ${err.message}` });
    } finally {
      setEnrollLoading(false);
    }
  };

  const statusBadge = kioskData?.statusBadge || 'CLEAN_POWERED';
  const isClean = statusBadge === 'CLEAN_POWERED';
  const isHybrid = statusBadge === 'HYBRID_BALANCED';
  const isGridReliant = statusBadge === 'GRID_RELIANT';

  const renewablePct = kioskData?.currentRenewablePercentage !== undefined
    ? Math.round(kioskData.currentRenewablePercentage)
    : (kioskData?.renewablePercent !== undefined ? Math.round(kioskData.renewablePercent) : 84);

  const carbonAvoided = kioskData?.todayAvoidedCarbonKg !== undefined
    ? Math.round(kioskData.todayAvoidedCarbonKg)
    : (kioskData?.carbonAvoidedTodayKg !== undefined ? Math.round(kioskData.carbonAvoidedTodayKg) : 412);

  const treesEquivalent = kioskData?.equivalentTreesPlanted !== undefined
    ? Number(kioskData.equivalentTreesPlanted).toFixed(1)
    : (kioskData?.treesEquivalent !== undefined ? Number(kioskData.treesEquivalent).toFixed(1) : '18.7');

  const solarKw = Math.round(kioskData?.liveSolarKw ?? kioskData?.solarKw ?? 340);
  const windKw = Math.round(kioskData?.liveWindKw ?? kioskData?.windKw ?? 85);
  const loadKw = Math.round(kioskData?.campusLoadKw ?? 410);

  let ecoTips = [];
  if (kioskData?.ecoTipOfTheDay) {
    if (typeof kioskData.ecoTipOfTheDay === 'object') {
      ecoTips = [
        {
          tipEn: kioskData.ecoTipOfTheDay.tipEn || 'Conserve energy during peak deficit hours to elevate your hostel ranking!',
          tipHi: kioskData.ecoTipOfTheDay.tipHi || 'उच्च मांग के दौरान बिजली बचाएं और अपने छात्रावास को शीर्ष पर पहुंचाएं!',
        },
      ];
    } else {
      ecoTips = [
        {
          tipEn: String(kioskData.ecoTipOfTheDay),
          tipHi: 'ऊर्जा की खपत कम करें और ग्रीन आवर अलर्ट्स का पालन करें।',
        },
      ];
    }
  } else if (kioskData?.bilingualEcoTips && kioskData.bilingualEcoTips.length > 0) {
    ecoTips = kioskData.bilingualEcoTips;
  } else {
    ecoTips = [
      {
        tipEn: 'Conserve power during peak deficit hours to elevate your hostel ranking!',
        tipHi: 'उच्च मांग के दौरान बिजली बचाएं और अपने छात्रावास को शीर्ष पर पहुंचाएं!',
      },
    ];
  }

  const getPoints = (item) => item?.karmaPoints ?? item?.currentPoints ?? item?.currentKarmaPoints ?? 0;
  const getSavedKwh = (item) => item?.savedKwh ?? item?.cumulativeSavedKwh ?? 0;
  const getHostelName = (item) => item?.hostelName ?? item?.name ?? 'Hostel Block';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-12 flex flex-col items-center justify-start -m-4 md:-m-6 lg:-m-8 pb-32 font-sans transition-colors">
      {/* Top Quick Return Nav */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <Link
          to={isStudent() ? '/student' : '/'}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs hover:border-slate-300 transition"
        >
          <ArrowLeft size={14} />
          <span>{isStudent() ? 'Back to Student Portal' : 'Back to SCADA Hub'}</span>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
          <Building2 size={13} />
          <span>{kioskData?.campusName || user?.campusName || `Campus #${campusId}`}</span>
        </div>
      </div>

      {/* Live Campus Grid Status Banner */}
      <div className="w-full max-w-4xl mb-6">
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-all shadow-sm dark:shadow-xl ${
          isClean
            ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
            : isHybrid
            ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 dark:border-amber-500/40 text-amber-900 dark:text-amber-300'
            : 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/30 dark:border-rose-500/40 text-rose-900 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isClean ? 'bg-emerald-400' : isHybrid ? 'bg-amber-400' : 'bg-rose-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                isClean ? 'bg-emerald-500' : isHybrid ? 'bg-amber-500' : 'bg-rose-500'
              }`}></span>
            </span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
                {isClean && <><Sun size={14} className="text-emerald-600 dark:text-emerald-400" /> 100% CLEAN RENEWABLE POWERED</>}
                {isHybrid && <><Activity size={14} className="text-amber-600 dark:text-amber-400" /> HYBRID BALANCED MICROGRID</>}
                {isGridReliant && <><AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" /> GRID RELIANT MODE — CONSERVE POWER</>}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {isClean
                  ? 'Academic & residential campus demand is fully supplied by solar and wind microgrid.'
                  : isHybrid
                  ? 'Solar generation and battery storage actively balance evening residential demand.'
                  : 'Solar deficit detected. Conserve electricity in hostels to earn Karma Points!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <div className="flex items-center gap-1.5">
              <Sun size={15} className="text-amber-500 dark:text-yellow-400" />
              <span>Solar: {solarKw} kW</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>Wind: {windKw} kW</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity size={15} className="text-blue-600 dark:text-blue-400" />
              <span>Load: {loadKw} kW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Kiosk Header */}
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
          <Zap size={14} /> Public Campus Display Kiosk • Hostel Lobby Screen
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">
          CAMPUS <span className="text-emerald-600 dark:text-emerald-400">GREEN HOUR</span> LEADERBOARD
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
          Conserve energy during peak grid deficit alerts to win points, vouchers, and the coveted Green Shield for your hostel!
        </p>
      </div>

      {/* Clean Energy & Environmental Impact Strip (Zero Financial Leakage) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mt-8">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center shadow-sm dark:shadow-lg transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Sun size={20} />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{renewablePct}%</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">Clean Energy Share</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center shadow-sm dark:shadow-lg transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Leaf size={20} />
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{carbonAvoided} kg</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">CO2 Avoided (CEA v19)</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center shadow-sm dark:shadow-lg transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Trees size={20} />
          </div>
          <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono">{treesEquivalent}</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">Mature Trees Equivalent</p>
        </div>
      </div>

      {/* Podium Display (Zero Emojis, Pure Lucide Vector Icons) */}
      <div className="flex items-end justify-center gap-4 md:gap-8 mt-12 w-full max-w-4xl h-72">
        {/* 2nd Place */}
        {leaderboard[1] && (
          <div className="flex flex-col items-center w-48 md:w-56">
            <div className="bg-white dark:bg-slate-900/90 p-4 rounded-t-2xl text-center border-t-4 border-slate-400 border-x border-slate-200 dark:border-slate-800 w-full shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">2nd Place</span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate mt-1">
                {getHostelName(leaderboard[1])}
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xl mt-1">
                {getPoints(leaderboard[1])} <span className="text-xs text-slate-400">KP</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{getSavedKwh(leaderboard[1])} kWh saved</p>
            </div>
            <div className="bg-slate-200 dark:bg-slate-800 w-full h-32 flex items-center justify-center text-4xl font-black text-slate-400 dark:text-slate-500 shadow-inner rounded-b-xl">
              2
            </div>
          </div>
        )}

        {/* 1st Place */}
        {leaderboard[0] && (
          <div className="flex flex-col items-center w-56 md:w-64 z-10">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-t-2xl text-center border-t-4 border-amber-400 border-x border-slate-200 dark:border-slate-800 w-full shadow-md dark:shadow-2xl relative">
              <div className="text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Trophy size={15} />
                <span>CAMPUS CHAMPIONS</span>
              </div>
              <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 dark:text-white truncate mt-1">
                {getHostelName(leaderboard[0])}
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-3xl mt-1">
                {getPoints(leaderboard[0])} <span className="text-sm text-slate-400 font-normal">KP</span>
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400/80 font-semibold">{getSavedKwh(leaderboard[0])} kWh saved</p>
            </div>
            <div className="bg-slate-300 dark:bg-slate-800/90 w-full h-44 flex items-center justify-center text-6xl font-black text-amber-500 dark:text-amber-400 shadow-inner rounded-b-xl">
              1
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {leaderboard[2] && (
          <div className="flex flex-col items-center w-48 md:w-56">
            <div className="bg-white dark:bg-slate-900/90 p-4 rounded-t-2xl text-center border-t-4 border-amber-600 border-x border-slate-200 dark:border-slate-800 w-full shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">3rd Place</span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate mt-1">
                {getHostelName(leaderboard[2])}
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xl mt-1">
                {getPoints(leaderboard[2])} <span className="text-xs text-slate-400">KP</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{getSavedKwh(leaderboard[2])} kWh saved</p>
            </div>
            <div className="bg-slate-200 dark:bg-slate-800 w-full h-24 flex items-center justify-center text-4xl font-black text-slate-400 dark:text-slate-500 shadow-inner rounded-b-xl">
              3
            </div>
          </div>
        )}
      </div>

      {/* Top Student Champions */}
      {topStudents.length > 0 && (
        <div className="mt-12 w-full max-w-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <Award size={16} className="text-amber-500 dark:text-amber-400" /> Top Individual Student Champions
          </h3>
          <div className="space-y-2.5">
            {topStudents.slice(0, 5).map((s, idx) => (
              <div
                key={s.id || idx}
                className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400 dark:text-slate-500 font-mono text-sm">#{idx + 1}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{s.name || `Student #${s.id}`}</span>
                  {s.registrationNumber && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">({s.registrationNumber})</span>
                  )}
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{s.karmaPoints} KP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bilingual Eco-Tips Banner */}
      {ecoTips && ecoTips.length > 0 && (
        <div className="mt-8 w-full max-w-2xl bg-emerald-50/50 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Campus Daily Eco-Action Tips (English &amp; Hindi)
            </h4>
          </div>
          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            {ecoTips.slice(0, 2).map((tip, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="font-medium text-slate-900 dark:text-white">{tip.tipEn}</p>
                {tip.tipHi && (
                  <p className="text-emerald-700 dark:text-emerald-300/80 text-[11px] mt-1 border-l-2 border-emerald-500/40 pl-2">
                    {tip.tipHi}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Working Scannable QR Code Banner & Quick Enroll Action */}
      <div className="mt-10 bg-white dark:bg-slate-900/90 p-6 rounded-2xl flex flex-wrap items-center justify-center gap-6 border border-emerald-500/30 max-w-2xl shadow-lg dark:shadow-2xl dark:shadow-emerald-500/10">
        <a
          href={waChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Click or scan to open WhatsApp"
          className="w-32 h-32 bg-white rounded-xl flex items-center justify-center p-2 shadow-inner border-2 border-emerald-500/40 hover:scale-105 transition-transform cursor-pointer"
        >
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Scan to Enroll in Student Directory" className="w-full h-full object-contain rounded-xl" />
          ) : (
            <QrCode size={64} className="text-slate-950" />
          )}
        </a>

        <div className="text-center sm:text-left max-w-sm">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Scan or Tap to Join Directory</h3>
            <span className="bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30 dark:border-emerald-500/40">
              Live WhatsApp QR
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-3">
            Point camera to WhatsApp the TEJAS Gateway (+{gatewayPhone}) to auto-enroll in Student Directory and alert the Facility Operator, or register instantly on screen!
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Self-Enroll on Screen</span>
            </button>

            <a
              href={waChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              <MessageSquare size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Open WhatsApp</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* On-Screen Self-Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-900 dark:text-white shadow-2xl relative">
            <button
              onClick={() => { setShowEnrollModal(false); setEnrollFeedback(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
                <UserPlus size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Join Student Directory</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Enter your details to opt into Green Hour deficit alerts and start earning Karma points!
              </p>
            </div>

            {enrollFeedback && (
              <div className={`p-3.5 rounded-xl mb-4 text-xs font-medium ${
                enrollFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-300'
              }`}>
                {enrollFeedback.text}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={enrollForm.name}
                  onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                  placeholder="e.g. Priya Patel"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Registration No</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.registrationNumber}
                    onChange={(e) => setEnrollForm({ ...enrollForm, registrationNumber: e.target.value })}
                    placeholder="e.g. 24BCE1055"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.phoneNumber}
                    onChange={(e) => setEnrollForm({ ...enrollForm, phoneNumber: e.target.value })}
                    placeholder="918238893551"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hostel Block</label>
                <select
                  value={enrollForm.hostelId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const name = id === 2 ? 'Block B (Bhaskara)' : (id === 3 ? 'Block C (Raman)' : 'Block A (Aryabhata)');
                    setEnrollForm({ ...enrollForm, hostelId: id, hostel: name });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>Block A (Aryabhata)</option>
                  <option value={2}>Block B (Bhaskara)</option>
                  <option value={3}>Block C (Raman)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={enrollLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {enrollLoading ? (
                    <span>Registering into PostgreSQL...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Complete Enrollment (+100 KP)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
