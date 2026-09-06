import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  Send,
  Check,
  CheckCircle2,
  X,
  RefreshCw,
  Building2,
  Shield,
  Smartphone,
  Award,
  Bell,
  Radio,
  Zap,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RAJASTHAN_CAMPUSES, getCampusById } from '../data/campuses';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  sendDirectDeficitAlert,
  getEnrollmentRequests,
} from '../api/api';

export default function StudentDirectory() {
  const { user, isGovt, isOperator } = useAuth();

  // For DTE Admin: Can switch between campuses. For Operator: Locked to their specific campusId.
  const [selectedCampusId, setSelectedCampusId] = useState(user?.campusId || 1);
  const activeCampusId = isGovt() ? selectedCampusId : (user?.campusId || 1);
  const campusInfo = getCampusById(activeCampusId) || RAJASTHAN_CAMPUSES[0];
  const campusHostels = campusInfo?.hostels || [];

  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');
  const [actionMsg, setActionMsg] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);

  // WhatsApp Gateway status (port 5001)
  const [gatewayStatus, setGatewayStatus] = useState({
    connected: false,
    user: null,
    checking: true,
  });

  // Broadcast modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState(
    `⚡ TEJAS GRID ALERT: Renewable deficit detected at ${campusInfo.name}! Green Hour is now ACTIVE. Please turn off non-essential appliances to earn +50 Karma Points for your hostel leaderboard!`
  );

  // Update default broadcast message when campus switches
  useEffect(() => {
    setBroadcastMessage(
      `⚡ TEJAS GRID ALERT: Renewable deficit detected at ${campusInfo.name}! Green Hour is now ACTIVE. Please turn off non-essential appliances to earn +50 Karma Points for your hostel leaderboard!`
    );
  }, [campusInfo.name]);

  // Continuously check WhatsApp Gateway status
  const checkGatewayStatus = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/status');
      const data = await res.json();
      setGatewayStatus({
        connected: Boolean(data?.connected),
        user: data?.user || null,
        checking: false,
      });
    } catch (e) {
      setGatewayStatus({ connected: false, user: null, checking: false });
    }
  };

  useEffect(() => {
    checkGatewayStatus();
    const interval = setInterval(checkGatewayStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    registrationNumber: '',
    phoneNumber: '',
    email: '',
    hostelId: campusHostels[0]?.id || 1,
    karmaPoints: 100,
    whatsappOptIn: true,
  });

  const fetchCampusStudents = async () => {
    setLoading(true);
    try {
      // Pass activeCampusId to ensure STRICT campus isolation
      const [studentRes, enrollRes] = await Promise.all([
        getStudents(activeCampusId).catch(() => []),
        getEnrollmentRequests().catch(() => []),
      ]);

      const fetchedStudents = Array.isArray(studentRes)
        ? studentRes
        : (studentRes?.data && Array.isArray(studentRes.data) ? studentRes.data : []);

      setStudents(fetchedStudents);

      // Filter enrollments for this campus's hostels if available
      if (Array.isArray(enrollRes)) {
        const hostelNames = campusHostels.map((h) => h.name.toLowerCase());
        const filteredEnroll = enrollRes.filter(
          (e) => !e.hostel || hostelNames.some((hn) => e.hostel.toLowerCase().includes(hn))
        );
        setEnrollments(filteredEnroll);
      }
    } catch (err) {
      console.error('Failed to fetch students for campus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampusStudents();
    const interval = setInterval(fetchCampusStudents, 5000);
    return () => clearInterval(interval);
  }, [activeCampusId]);

  // Update default hostelId when campus changes
  useEffect(() => {
    if (campusHostels.length > 0) {
      setModalForm((prev) => ({
        ...prev,
        hostelId: campusHostels[0]?.id || 1,
      }));
    }
  }, [activeCampusId]);

  // Search & Hostel Filter
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.registrationNumber && s.registrationNumber.toLowerCase().includes(q)) ||
      (s.phoneNumber && s.phoneNumber.includes(q)) ||
      (s.hostel?.name && s.hostel.name.toLowerCase().includes(q));

    const matchesHostel =
      selectedHostelFilter === 'ALL' ||
      (s.hostel?.name && s.hostel.name === selectedHostelFilter) ||
      String(s.hostel?.id) === selectedHostelFilter;

    return matchesSearch && matchesHostel;
  });

  // KPI calculations
  const totalStudents = students.length;
  const optedInStudents = students.filter((s) => s.whatsappOptIn);
  const optInPercent = totalStudents > 0 ? Math.round((optedInStudents.length / totalStudents) * 100) : 0;
  const totalKarma = students.reduce((acc, s) => acc + (s.karmaPoints || 0), 0);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setModalForm({
      name: '',
      registrationNumber: `${campusInfo.districtCode || '24RAJ'}`,
      phoneNumber: '+91 94140 ',
      email: '',
      hostelId: campusHostels[0]?.id || 1,
      karmaPoints: 100,
      whatsappOptIn: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (st) => {
    setEditingStudent(st);
    setModalForm({
      name: st.name || '',
      registrationNumber: st.registrationNumber || '',
      phoneNumber: st.phoneNumber || '',
      email: st.email || '',
      hostelId: st.hostel?.id || campusHostels[0]?.id || 1,
      karmaPoints: st.karmaPoints || 100,
      whatsappOptIn: st.whatsappOptIn !== false,
    });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, {
          name: modalForm.name,
          registrationNumber: modalForm.registrationNumber,
          phoneNumber: modalForm.phoneNumber,
          email: modalForm.email,
          hostelId: Number(modalForm.hostelId),
          karmaPoints: Number(modalForm.karmaPoints),
          whatsappOptIn: Boolean(modalForm.whatsappOptIn),
        });
        setActionMsg({ type: 'success', text: `Updated record for "${modalForm.name}".` });
        setEditingStudent(null);
      } else {
        await createStudent({
          name: modalForm.name,
          registrationNumber: modalForm.registrationNumber,
          phoneNumber: modalForm.phoneNumber,
          email: modalForm.email || `${modalForm.registrationNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@campus.tejas.edu`,
          hostelId: Number(modalForm.hostelId),
          karmaPoints: Number(modalForm.karmaPoints),
        });
        setActionMsg({ type: 'success', text: `Enrolled student "${modalForm.name}" into ${campusInfo.name}.` });
        setShowAddModal(false);
      }
      await fetchCampusStudents();
    } catch (err) {
      setActionMsg({ type: 'error', text: `Operation failed: ${err.message}` });
    } finally {
      setTimeout(() => setActionMsg(null), 5000);
    }
  };

  const handleDelete = async (st) => {
    if (!window.confirm(`Are you sure you want to remove "${st.name}" (${st.registrationNumber}) from ${campusInfo.name}?`)) return;
    try {
      await deleteStudent(st.id);
      setActionMsg({ type: 'success', text: `Removed student "${st.name}" from PostgreSQL database.` });
      await fetchCampusStudents();
    } catch (err) {
      setActionMsg({ type: 'error', text: `Failed to remove student: ${err.message}` });
    } finally {
      setTimeout(() => setActionMsg(null), 5000);
    }
  };

  const handleSendSingleAlert = async (phone, name) => {
    try {
      let cleanPhone = String(phone).replace(/[^0-9]/g, '');
      if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
      }
      const msg = `⚡ TEJAS GRID ALERT: Solar deficit detected at ${campusInfo.name}! Green Hour is active. Turn off high-wattage appliances for 45 mins to earn +50 Karma Points!`;

      // Try local WhatsApp Gateway on port 5001 first for instant socket delivery
      try {
        const res = await fetch('http://localhost:5001/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, message: msg }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        setActionMsg({ type: 'success', text: `Dispatched Green Hour deficit alert directly to WhatsApp of ${name} (+${cleanPhone})!` });
        return;
      } catch (gwErr) {
        // Fallback to Spring Boot / Twilio / System queue
        await sendDirectDeficitAlert(phone, 180.4);
        if (gwErr.message && gwErr.message.includes('not linked')) {
          setActionMsg({ type: 'error', text: `WhatsApp Gateway not linked yet. Dispatched to queue. Open http://localhost:5001 to link WhatsApp.` });
        } else {
          setActionMsg({ type: 'success', text: `Dispatched deficit alert to ${name} (+${phone}).` });
        }
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: `Failed sending alert: ${err.message}` });
    } finally {
      setTimeout(() => setActionMsg(null), 6000);
    }
  };

  const handleBroadcastCampusDeficit = async () => {
    const validPhones = optedInStudents
      .map((s) => String(s.phoneNumber || '').replace(/[^0-9]/g, ''))
      .map((p) => (p.startsWith('91') ? p : '91' + p))
      .filter((p) => p.length >= 10);

    if (validPhones.length === 0) {
      setActionMsg({ type: 'error', text: `No WhatsApp-opted-in students found at ${campusInfo.name}.` });
      setTimeout(() => setActionMsg(null), 5000);
      return;
    }

    setBroadcasting(true);
    try {
      const response = await fetch('http://localhost:5001/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones: validPhones, message: broadcastMessage }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 503 || data.error?.includes('not linked')) {
          throw new Error('WhatsApp Gateway is not linked yet! Open http://localhost:5001 to link your WhatsApp via QR code or Pairing Code.');
        }
        throw new Error(data.error || `WhatsApp Gateway returned HTTP ${response.status}`);
      }

      setShowBroadcastModal(false);
      setActionMsg({
        type: 'success',
        text: `Broadcasted Green Hour alert to WhatsApp of ${data.count || validPhones.length} enrolled student(s) at ${campusInfo.name}!`,
      });
    } catch (err) {
      setActionMsg({ type: 'error', text: `Broadcast failed: ${err.message}` });
    } finally {
      setBroadcasting(false);
      setTimeout(() => setActionMsg(null), 8000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Station Banner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Users size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Campus Student Directory
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {campusInfo.district} District
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Station #{campusInfo.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {campusInfo.name} • Enrolled Hostel Residents for Green Hour Microgrid Peak Shaving
              </p>
            </div>
          </div>

          {/* Campus Selector (DTE Admin only) or Scoped Lock (Operator) */}
          <div className="flex items-center gap-3">
            {isGovt() ? (
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
                <select
                  value={selectedCampusId}
                  onChange={(e) => setSelectedCampusId(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {RAJASTHAN_CAMPUSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.district})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/60 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300">
                <Shield size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Locked to {campusInfo.district} Campus (ROLE_OPERATOR)</span>
              </div>
            )}

            {/* WhatsApp Gateway Quick Link & Status */}
            <a
              href="http://localhost:5001"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-xs transition cursor-pointer ${
                gatewayStatus.connected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              }`}
              title="Open WhatsApp Gateway Control Panel (http://localhost:5001)"
            >
              <Smartphone size={13} className={gatewayStatus.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} />
              <span className="hidden sm:inline">WhatsApp Gateway:</span>
              <span>{gatewayStatus.connected ? `ONLINE (+${gatewayStatus.user})` : 'Standby (Link QR)'}</span>
              <ExternalLink size={11} className="opacity-70" />
            </a>

            <button
              onClick={fetchCampusStudents}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Refresh Directory"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Toast Feedback Message */}
      {actionMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-md transition-all ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold">{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="p-1 opacity-70 hover:opacity-100 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 4 Summary KPI Cards for this Campus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enrolled */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalStudents}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Exclusively at {campusInfo.name}
          </p>
        </div>

        {/* Card 2: WhatsApp Opted-In */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              WhatsApp Opt-In
            </span>
            <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
              <Smartphone size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {optedInStudents.length}{' '}
            <span className="text-xs font-normal text-slate-400">({optInPercent}%)</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Receives live Green Hour broadcasts
          </p>
        </div>

        {/* Card 3: Circulating Karma Points */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Circulating Karma
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Award size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
            {totalKarma.toLocaleString()} <span className="text-xs font-sans font-bold text-slate-400">KP</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Earned via verified load-shedding</p>
        </div>

        {/* Card 4: Campus Hostels */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Hostel Blocks
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{campusHostels.length}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {campusHostels.map((h) => h.name.split(' - ')[0]).join(', ')}
          </p>
        </div>
      </div>

      {/* Live WhatsApp QR Enrollments Stream (Campus Scoped) */}
      {enrollments.length > 0 && (
        <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Live WhatsApp QR Enrollments</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                    {enrollments.length} NEW
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Residents who scanned the {campusInfo.district} hostel leaderboard QR code and joined via WhatsApp
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enrollments.slice(0, 3).map((item) => (
              <div
                key={item.id || item.phone}
                className="bg-white dark:bg-slate-900 border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{item.name}</span>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <Check size={10} /> Auto-Added
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Reg: {item.registrationNumber}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Phone: +{item.phone}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.hostel}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleSendSingleAlert(item.phone, item.name)}
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Send size={11} /> Send Test Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Campus Student Directory Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="text-emerald-600 dark:text-emerald-400" size={20} />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {campusInfo.name} Student Directory
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing enrolled residents for {campusInfo.district} campus only • Direct Green Hour WhatsApp broadcast integration
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, reg no, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-8 pr-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-52"
              />
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
            </div>

            {/* Hostel Block Filter */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Filter size={12} className="text-slate-400" />
              <select
                value={selectedHostelFilter}
                onChange={(e) => setSelectedHostelFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Hostels</option>
                {campusHostels.map((h) => (
                  <option key={h.id || h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Broadcast Green Hour Alert Button */}
            <button
              onClick={() => setShowBroadcastModal(true)}
              disabled={broadcasting || optedInStudents.length === 0}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Broadcast deficit alert to registered students on WhatsApp"
            >
              <Radio size={13} className={broadcasting ? 'animate-pulse' : ''} />
              <span>Broadcast Alert ({optedInStudents.length})</span>
            </button>

            {/* Add Student Button */}
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Registration No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Hostel Block</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4 text-center">WhatsApp Alert</th>
                <th className="py-3 px-4 text-right">Karma Points</th>
                <th className="py-3 px-4 text-center">Operator Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {st.registrationNumber || `24RAJ${activeCampusId}0${st.id}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {st.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {st.hostel?.name || campusHostels[0]?.name || 'Campus Hostel'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-200">
                      {st.phoneNumber}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.whatsappOptIn
                            ? 'bg-emerald-500/10 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {st.whatsappOptIn ? (
                          <>
                            <Check size={10} /> Opted In
                          </>
                        ) : (
                          'Off'
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {st.karmaPoints} KP
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSendSingleAlert(st.phoneNumber, st.name)}
                          title="Send Direct WhatsApp Deficit Alert"
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 rounded-lg transition cursor-pointer"
                        >
                          <Send size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          title="Edit Student Record"
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/50 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 rounded-lg transition cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(st)}
                          title="Delete Student"
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/50 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    {loading ? 'Fetching students from PostgreSQL...' : `No students found for ${campusInfo.name}.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {(showAddModal || editingStudent) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingStudent(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Building2 className="text-emerald-500" size={18} />
              <span>{editingStudent ? 'Edit Student Record' : 'Enroll New Campus Student'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Assigned to: <strong className="text-slate-700 dark:text-slate-300">{campusInfo.name}</strong> ({campusInfo.district})
            </p>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar Choudhary"
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Registration No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24BTU104"
                    value={modalForm.registrationNumber}
                    onChange={(e) => setModalForm({ ...modalForm, registrationNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Mobile (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 94140 XXXXX"
                    value={modalForm.phoneNumber}
                    onChange={(e) => setModalForm({ ...modalForm, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Hostel Block ({campusInfo.district})</label>
                <select
                  value={modalForm.hostelId}
                  onChange={(e) => setModalForm({ ...modalForm, hostelId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {campusHostels.map((h) => (
                    <option key={h.id || h.name} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Karma Points</label>
                  <input
                    type="number"
                    min="0"
                    value={modalForm.karmaPoints}
                    onChange={(e) => setModalForm({ ...modalForm, karmaPoints: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="student@campus.tejas.edu"
                    value={modalForm.email}
                    onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {editingStudent && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="whatsappOptIn"
                    checked={modalForm.whatsappOptIn}
                    onChange={(e) => setModalForm({ ...modalForm, whatsappOptIn: e.target.checked })}
                    className="rounded text-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="whatsappOptIn" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    WhatsApp Green Hour Alert Opt-in Active
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Direct WhatsApp Deficit Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative">
            <button
              onClick={() => setShowBroadcastModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl">
                <Radio size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Broadcast Direct WhatsApp Deficit Alert
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: <strong className="text-slate-700 dark:text-slate-300">{campusInfo.name}</strong> • {optedInStudents.length} Opted-In Students
                </p>
              </div>
            </div>

            {/* Gateway Status Banner inside Modal */}
            <div
              className={`p-3.5 rounded-xl border mb-4 text-xs transition ${
                gatewayStatus.connected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      gatewayStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
                    }`}
                  />
                  <span className="font-bold">
                    {gatewayStatus.connected
                      ? `Gateway Online: Connected to +${gatewayStatus.user}`
                      : 'Gateway Standby: Not Linked to WhatsApp Yet'}
                  </span>
                </div>
                <a
                  href="http://localhost:5001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
                >
                  <ExternalLink size={12} />
                  <span>Open Gateway UI</span>
                </a>
              </div>
              {!gatewayStatus.connected && (
                <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Click <strong>Open Gateway UI</strong> (http://localhost:5001) to link your WhatsApp by scanning the QR code or requesting an 8-digit pairing code. Once linked, broadcasts go directly to students' WhatsApp.
                </p>
              )}
            </div>

            {/* Message input */}
            <div className="space-y-2 mb-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Broadcast Notification Message
              </label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-emerald-500 leading-relaxed"
                placeholder="Enter alert message to broadcast to all students..."
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                <span>Direct delivery via WhatsApp socket</span>
                <span>{optedInStudents.length} student phone numbers loaded</span>
              </div>
            </div>

            {/* Recipient phone numbers preview */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-5 max-h-28 overflow-y-auto">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                Recipient Numbers Preview ({optedInStudents.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {optedInStudents.map((s) => (
                  <span
                    key={s.id}
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {s.name.split(' ')[0]}: {s.phoneNumber}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBroadcastCampusDeficit}
                disabled={broadcasting || optedInStudents.length === 0}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-600/20 transition cursor-pointer"
              >
                <Radio size={14} className={broadcasting ? 'animate-pulse' : ''} />
                <span>{broadcasting ? 'Dispatching...' : `Broadcast to ${optedInStudents.length} Students`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
