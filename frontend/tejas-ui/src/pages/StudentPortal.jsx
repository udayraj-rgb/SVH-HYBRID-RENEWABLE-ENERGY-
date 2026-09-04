import React, { useEffect, useState } from 'react';
import {
  getRewards,
  toggleWhatsappOptIn,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  sendDirectDeficitAlert,
  sendWhatsAppMessage,
  getKpis,
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import StudentWhatsAppQRModal from '../components/StudentWhatsAppQRModal';
import KarmaCalculationModal from '../components/KarmaCalculationModal';
import {
  Award,
  Gift,
  Bell,
  Check,
  Sparkles,
  Send,
  Users,
  ShieldCheck,
  Zap,
  QrCode,
  Plus,
  Pencil,
  Trash2,
  X,
  Smartphone,
  ExternalLink,
  Shield,
  GraduationCap,
  Calculator,
} from 'lucide-react';

export default function StudentPortal() {
  const { user, isOperator, isStudent } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [karmaBalance, setKarmaBalance] = useState(user?.karmaPoints || 870);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [currentDeficit, setCurrentDeficit] = useState(180.4);

  // QR Modal State for Students
  const [showQrModal, setShowQrModal] = useState(false);

  // Karma Formula Explainer Modal State
  const [showKarmaModal, setShowKarmaModal] = useState(false);

  // CRUD State for Facility Operator
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [crudLoading, setCrudLoading] = useState(false);
  const [crudMsg, setCrudMsg] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    phoneNumber: '',
    email: '',
    hostelId: '1',
    karmaPoints: '100',
  });

  const currentUser = isStudent()
    ? {
        name: user.name,
        registrationNumber: user.registrationNumber || '24BCE1082',
        hostel: user.hostel || 'Block A (Aryabhata)',
        phoneNumber: user.phoneNumber || '+91 82388 93551',
        cleanNumber: user.cleanNumber || '918238893551',
        badge: user.badge || 'GREEN GUARDIAN',
      }
    : {
        name: 'Udayraj',
        registrationNumber: '24BCE1082',
        hostel: 'Block A (Aryabhata)',
        phoneNumber: '+91 82388 93551',
        cleanNumber: '918238893551',
        badge: 'OPERATOR DIRECTORY VIEW',
      };

  const loadData = async () => {
    try {
      const [rewardRes, students, kpis] = await Promise.all([
        getRewards(),
        getStudents(),
        getKpis(),
      ]);

      if (rewardRes && rewardRes.data) setRewards(rewardRes.data);
      if (students && Array.isArray(students)) setStudentList(students);
      if (kpis && kpis.data && kpis.data.deficit_kw) {
        setCurrentDeficit(kpis.data.deficit_kw || 180.4);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRedeem = async (reward) => {
    if (karmaBalance < reward.pointsCost) return;

    const voucherCode = `TEJAS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBalance = karmaBalance - reward.pointsCost;
    setKarmaBalance(newBalance);

    const voucherMsg = `🎉 *TEJAS GRID VOUCHER CONFIRMATION*\n\nCongratulations *${currentUser.name}*!\nYou successfully redeemed *"${reward.name}"* for ${reward.pointsCost} Karma Points.\n\n🎟️ *Voucher Code:* ${voucherCode}\n📍 *Redeem Location:* Central Campus Cafeteria / Academic Admin\n💰 *Remaining Karma:* ${newBalance} KP\n\n⚡ _Thank you for reducing electricity load during Green Hours to keep TEJAS GRID balanced!_`;

    try {
      // 1. Dispatch real WhatsApp message via Baileys gateway (:5001)
      const res = await sendWhatsAppMessage(currentUser.phoneNumber, voucherMsg);

      // Check if sent to self (e.g. 918238893551 linked device)
      if (res && res.isSelf) {
        // WhatsApp silences push alerts for self-messages; open WhatsApp Web/App so user views it immediately
        const cleanNumber = currentUser.cleanNumber || '918238893551';
        const waUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(voucherMsg)}`;
        window.open(waUrl, '_blank');
        setRedeemSuccess(`🎉 Successfully redeemed "${reward.name}"! Voucher [${voucherCode}] sent to your WhatsApp (opened in chat).`);
      } else {
        setRedeemSuccess(`🎉 Successfully redeemed "${reward.name}"! Voucher [${voucherCode}] sent directly to your WhatsApp (${currentUser.phoneNumber})!`);
      }
    } catch (e) {
      console.warn('Gateway dispatch failed, opening WhatsApp directly:', e);
      const cleanNumber = currentUser.cleanNumber || '918238893551';
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(voucherMsg)}`;
      window.open(waUrl, '_blank');
      setRedeemSuccess(`🎉 Successfully redeemed "${reward.name}"! Voucher [${voucherCode}] pre-filled in WhatsApp.`);
    }

    setTimeout(() => setRedeemSuccess(null), 8000);
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

  const handleSendDirectAlert = async (targetNumber, targetHostel) => {
    const phone = targetNumber || currentUser.phoneNumber;
    const hostel = targetHostel || currentUser.hostel;
    setSendingAlert(true);
    const deficit = currentDeficit > 0 ? currentDeficit : 180.4;
    const msg = `⚡ TEJAS GRID ALERT: High campus load & solar deficit of ${deficit.toFixed(1)} kW detected! Green Hour is now active. Reduce non-essential appliances in ${hostel} for 45 mins to earn 50 Karma points for your hostel leaderboard!`;

    try {
      await sendDirectDeficitAlert(phone, deficit);
      setAlertSuccess(`✅ Direct Deficit Alert Dispatched to ${phone} via WhatsApp!`);
    } catch (e) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      setAlertSuccess(`📲 WhatsApp opened with alert pre-filled for ${phone}`);
    } finally {
      setSendingAlert(false);
      setTimeout(() => setAlertSuccess(null), 6000);
    }
  };

  // ==========================================
  // FACILITY OPERATOR CRUD HANDLERS
  // ==========================================
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      registrationNumber: '',
      phoneNumber: '+91',
      email: '',
      hostelId: '1',
      karmaPoints: '100',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      registrationNumber: student.registrationNumber || '',
      phoneNumber: student.phoneNumber || '',
      email: student.email || '',
      hostelId: String(student.hostel?.id || '1'),
      karmaPoints: String(student.karmaPoints || '100'),
    });
  };

  const handleSaveAddStudent = async (e) => {
    e.preventDefault();
    setCrudLoading(true);
    try {
      await createStudent({
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        hostelId: Number(formData.hostelId),
        karmaPoints: Number(formData.karmaPoints),
      });
      setCrudMsg(`✓ Successfully added student "${formData.name}" to PostgreSQL database!`);
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      setCrudMsg(`⚠️ Error adding student: ${err.message}`);
    } finally {
      setCrudLoading(false);
      setTimeout(() => setCrudMsg(null), 6000);
    }
  };

  const handleSaveUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setCrudLoading(true);
    try {
      await updateStudent(editingStudent.id, {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        hostelId: Number(formData.hostelId),
        karmaPoints: Number(formData.karmaPoints),
      });
      setCrudMsg(`✓ Successfully updated record for "${formData.name}"!`);
      setEditingStudent(null);
      await loadData();
    } catch (err) {
      setCrudMsg(`⚠️ Error updating student: ${err.message}`);
    } finally {
      setCrudLoading(false);
      setTimeout(() => setCrudMsg(null), 6000);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to permanently delete student "${student.name}" (${student.registrationNumber}) from PostgreSQL?`)) {
      return;
    }
    try {
      await deleteStudent(student.id);
      setCrudMsg(`🗑️ Student "${student.name}" was deleted from PostgreSQL.`);
      await loadData();
    } catch (err) {
      setCrudMsg(`⚠️ Error deleting student: ${err.message}`);
    } finally {
      setTimeout(() => setCrudMsg(null), 6000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 font-sans">
      {/* Dynamic Alerts */}
      {crudMsg && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-500 animate-in fade-in">
          <div className="flex items-center gap-3">
            <Check className="text-emerald-400" size={20} />
            <span className="font-bold text-sm">{crudMsg}</span>
          </div>
          <button onClick={() => setCrudMsg(null)} className="text-white/60 hover:text-white text-xs uppercase font-bold">
            Dismiss
          </button>
        </div>
      )}

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
              {isStudent() ? 'Active Student Resident' : 'Facility Operator View'}
            </span>
            <span className="text-slate-400 text-xs font-mono font-bold">Reg: {currentUser.registrationNumber}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">{currentUser.name}</h1>
          <p className="text-emerald-300 text-sm font-medium mb-4">
            {currentUser.hostel} • <span className="font-mono">{currentUser.phoneNumber}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full font-semibold text-xs items-center gap-2 border border-white/20">
              <Award className="text-yellow-400" size={15} />
              Tier: {currentUser.badge}
            </div>

            {/* SCAN QR CODE BUTTON FOR STUDENTS */}
            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 cursor-pointer"
            >
              <QrCode size={15} />
              <span>Scan WhatsApp Alert QR Code</span>
            </button>
          </div>
        </div>

        <div className="text-right bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-inner">
          <p className="opacity-80 text-xs uppercase tracking-widest font-bold mb-1">Karma Points Balance</p>
          <div className="text-6xl font-black text-emerald-300 font-mono tracking-tight">{karmaBalance}</div>
          <p className="text-xs text-emerald-400 mt-1 font-medium">+50 KP per Green Hour load reduction</p>
          <button
            onClick={() => setShowKarmaModal(true)}
            className="mt-3 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ml-auto transition cursor-pointer"
          >
            <Calculator size={12} />
            <span>How Karma is Calculated</span>
          </button>
        </div>
      </div>

      {/* STUDENT-FACING INSTANT WHATSAPP OPT-IN CARD */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-wrap justify-between items-center gap-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
            <Smartphone size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-white">Get Campus Deficit Alerts on WhatsApp</h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/40">
                1-Tap Camera Scan
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Point your phone camera or WhatsApp scanner at our QR code to immediately opt in and receive real-time electricity deficit alerts directly to your phone.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <QrCode size={16} />
            <span>Open Working WhatsApp QR Code</span>
          </button>

          <button
            disabled={sendingAlert}
            onClick={() => handleSendDirectAlert(currentUser.phoneNumber, currentUser.hostel)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <Send size={14} />
            <span>Send Test Alert to My Phone</span>
          </button>
        </div>
      </div>

      {/* POSTGRESQL STUDENT DIRECTORY & OPERATOR MANAGEMENT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">Registered Hostel Students (PostgreSQL Database)</h3>
                {isOperator() && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-300">
                    Operator CRUD Enabled
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isOperator()
                  ? 'Facility Operator Authority: Add new students, edit contact details, update Karma scores, or delete records.'
                  : 'Campus Resident Directory: Showing active hostel participants across campus.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
              {studentList.length} Students in DB
            </span>

            {/* OPERATOR ADD STUDENT BUTTON */}
            {isOperator() && (
              <button
                onClick={handleOpenAddModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Add New Student</span>
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Registration No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Hostel Block</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4 text-center">WhatsApp Alert</th>
                <th className="py-3 px-4 text-right">Karma Points</th>
                {isOperator() && <th className="py-3 px-4 text-center">Operator Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {studentList.map((st) => {
                const isTarget = st.phoneNumber?.includes('8238893551');
                return (
                  <tr key={st.id} className={`hover:bg-slate-50/80 transition ${isTarget ? 'bg-emerald-50/40' : ''}`}>
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

                    {/* OPERATOR CRUD BUTTONS */}
                    {isOperator() && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Send test WhatsApp */}
                          <button
                            onClick={() => handleSendDirectAlert(st.phoneNumber, st.hostel?.name)}
                            title="Send WhatsApp Alert"
                            className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg transition"
                          >
                            <Send size={13} />
                          </button>

                          {/* Edit Student */}
                          <button
                            onClick={() => handleOpenEditModal(st)}
                            title="Edit Student"
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-lg transition"
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Delete Student */}
                          <button
                            onClick={() => handleDeleteStudent(st)}
                            title="Delete Student"
                            className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
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

      {/* ========================================== */}
      {/* 1. STUDENT WORKING WHATSAPP QR MODAL       */}
      {/* ========================================== */}
      <StudentWhatsAppQRModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        studentPhone={currentUser.phoneNumber}
        studentName={currentUser.name}
      />

      {/* ========================================== */}
      {/* 2. OPERATOR ADD STUDENT MODAL              */}
      {/* ========================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Register New Student</h2>
                <p className="text-xs text-slate-400">Add a resident directly to PostgreSQL database</p>
              </div>
            </div>

            <form onSubmit={handleSaveAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24BCE1150"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">WhatsApp Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +919876543210"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Campus Email</label>
                  <input
                    type="email"
                    placeholder="e.g. priya@campus.tejas.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Hostel Block</label>
                  <select
                    value={formData.hostelId}
                    onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="1">Block A (Aryabhata)</option>
                    <option value="2">Block B (Bhaskara)</option>
                    <option value="3">Block C (Charaka)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Initial Karma Points</label>
                  <input
                    type="number"
                    value={formData.karmaPoints}
                    onChange={(e) => setFormData({ ...formData, karmaPoints: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crudLoading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  {crudLoading ? 'Saving...' : 'Save Student to PostgreSQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. OPERATOR EDIT STUDENT MODAL             */}
      {/* ========================================== */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setEditingStudent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <Pencil size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Edit Student Details</h2>
                <p className="text-xs text-slate-400">Update ID #{editingStudent.id} in PostgreSQL database</p>
              </div>
            </div>

            <form onSubmit={handleSaveUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Hostel Block</label>
                  <select
                    value={formData.hostelId}
                    onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="1">Block A (Aryabhata)</option>
                    <option value="2">Block B (Bhaskara)</option>
                    <option value="3">Block C (Charaka)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Karma Points Balance</label>
                  <input
                    type="number"
                    value={formData.karmaPoints}
                    onChange={(e) => setFormData({ ...formData, karmaPoints: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crudLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  {crudLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================== */}
      {/* 4. KARMA POINTS CALCULATION EXPLAINER MODAL */}
      {/* ========================================== */}
      <KarmaCalculationModal
        isOpen={showKarmaModal}
        onClose={() => setShowKarmaModal(false)}
      />
    </div>
  );
}
