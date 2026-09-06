import axios from 'axios';
import { getCampusById, RAJASTHAN_CAMPUSES } from '../data/campuses';

const ORCHESTRATOR_URL = 'http://localhost:8080';
const TELEMETRY_URL = 'http://localhost:8000';

// Configure Bearer JWT token header automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tejas_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const loginApi = async (username, password) => {
  const res = await axios.post(`${ORCHESTRATOR_URL}/api/v1/auth/login`, { username, password });
  return res.data;
};

// Executive & Governance Endpoints (ROLE_GOVT)
export const getNaacSummary = async () => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/admin/govt/reports/naac-summary`);
  return res.data;
};

export const getCampusRankings = async () => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/admin/govt/reports/campuses-rank`);
  return res.data;
};

export const getGovtDistricts = async () => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/admin/govt/districts`);
  return res.data;
};

export const getGovtOptimizationSummary = async () => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/admin/govt/optimization-summary`);
  return res.data;
};

export const getStatewideActiveAdvisories = async () => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/admin/govt/advisories/active`);
  return res.data;
};

export const acknowledgeGovtAdvisory = async (advisoryId) => {
  const res = await axios.post(`${ORCHESTRATOR_URL}/api/v1/admin/govt/advisories/${advisoryId}/acknowledge`);
  return res.data;
};

// Student Endpoints (ROLE_STUDENT, ROLE_OPERATOR, ROLE_GOVT)
export const getStudentKiosk = async (campusId = 1) => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/student/campuses/${campusId}/kiosk`);
  return res.data;
};

// Operator Endpoints (ROLE_OPERATOR, ROLE_GOVT)
export const getOperatorLiveTelemetry = async (campusId = 1) => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/operator/campuses/${campusId}/telemetry/live`);
  return res.data;
};

export const getOperatorDispatchSchedule = async (campusId = 1) => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/operator/campuses/${campusId}/dispatch-schedule`);
  return res.data;
};

export const getOperatorActiveAdvisories = async (campusId = 1) => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/operator/campuses/${campusId}/advisories/active`);
  return res.data;
};

export const acknowledgeAdvisory = async (campusId = 1, advisoryId) => {
  const res = await axios.post(`${ORCHESTRATOR_URL}/api/v1/operator/campuses/${campusId}/advisories/${advisoryId}/acknowledge`);
  return res.data;
};

export const getOperatorFinancialSummary = async (campusId = 1, period = 'today') => {
  const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/operator/campuses/${campusId}/financial-summary?period=${period}`);
  return res.data;
};

let simulatedSocOverride = null;

export const setSimulatedSoc = (soc) => {
  simulatedSocOverride = soc;
};

export const getKpis = async () => {
  try {
    const url = simulatedSocOverride !== null
      ? `${ORCHESTRATOR_URL}/api/v1/orchestrator/status?simulatedSoc=${simulatedSocOverride}`
      : `${ORCHESTRATOR_URL}/api/v1/orchestrator/status`;

    const res = await axios.get(url);
    const d = res.data;
    const campusLoad = d.campusLoadKw || 550;
    const totalGen = d.totalGenerationKw || 1100;
    const batteryDischarge = d.batteryDischargeKw || 0;
    const gridImport = Math.max(0, campusLoad - totalGen - batteryDischarge);

    return {
      data: {
        solar_generation_kw: d.solarGenerationKw || 0,
        wind_generation_kw: d.windGenerationKw || 0,
        campus_load_kw: campusLoad,
        battery_soc_percent: d.batterySocPercent || 50,
        net_power_kw: Math.round((totalGen - campusLoad) * 100) / 100,
        demo_state: d.gridStatus || 'NORMAL',
        deficit_kw: d.deficitKw || 0,
        battery_discharge_kw: batteryDischarge,
        critical_reserve_locked: d.criticalReserveLocked || false,
        grid_import_kw: Math.round(gridImport * 100) / 100,
        cost_saved_today_inr: d.estimatedCostSavedInr || 0,
        carbon_avoided_today_kg: Math.round((d.deficitKw || 40) * 0.82),
        recommendation: d.recommendation || '',
      },
    };
  } catch (err) {
    console.warn('Orchestrator unreachable, falling back to telemetry service:', err.message);
    try {
      const res = await axios.get(`${TELEMETRY_URL}/api/telemetry/live`);
      const r = res.data;
      return {
        data: {
          solar_generation_kw: r.solar_generation_kw || 0,
          wind_generation_kw: r.wind_generation_kw || 0,
          campus_load_kw: r.campus_load_kw || 550,
          battery_soc_percent: r.battery_soc_percent || 50,
          net_power_kw: r.net_power_kw || 0,
          demo_state: r.cloud_cover_drop ? 'DEFICIT_DETECTED' : 'NORMAL',
          deficit_kw: Math.max(0, (r.campus_load_kw || 0) - (r.total_generation_kw || 0)),
          battery_discharge_kw: 0,
          critical_reserve_locked: (r.battery_soc_percent || 50) <= 30,
          grid_import_kw: 0,
          cost_saved_today_inr: 0,
          carbon_avoided_today_kg: 35,
          recommendation: 'Connected directly to live telemetry stream.',
        },
      };
    } catch (e) {
      console.error('All backend services unreachable:', e);
      return { data: null };
    }
  }
};

export const get24hForecast = async () => {
  try {
    const res = await axios.get(`${TELEMETRY_URL}/api/ml/forecast/24h`);
    return res.data;
  } catch (e) {
    console.warn('ML Forecast endpoint unreachable:', e.message);
    return null;
  }
};

export const getDispatchRecommendation = async () => {
  try {
    const url = simulatedSocOverride !== null
      ? `${ORCHESTRATOR_URL}/api/v1/orchestrator/status?simulatedSoc=${simulatedSocOverride}`
      : `${ORCHESTRATOR_URL}/api/v1/orchestrator/status`;

    const res = await axios.get(url);
    const d = res.data;
    if (d.gridStatus === 'DEFICIT_DETECTED') {
      return {
        data: {
          anomalyType: 'DEFICIT_DETECTED',
          severity: d.criticalReserveLocked ? 'CRITICAL' : 'WARNING',
          notificationMessage: d.recommendation,
          criticalReserveLocked: d.criticalReserveLocked,
          actions: [
            d.criticalReserveLocked
              ? 'CRITICAL LAB RESERVE LOCKED (30% Threshold): Battery discharge restricted to 0 kW to safeguard research servers.'
              : `Discharging battery at ${d.batteryDischargeKw} kW to mitigate grid deficit.`,
            'Shift non-critical water pumping to 16:00 (-60 kW).',
            'Broadcast Green Hour WhatsApp alert to student residents (+50 Karma Points).',
          ],
          estimatedCostSavedInr: d.estimatedCostSavedInr || 0,
          projectedPeakReductionKw: 60,
          eventId: d.activeDispatchEvent ? d.activeDispatchEvent.id : 1,
        },
      };
    }
    return {
      data: {
        anomalyType: 'NORMAL',
        severity: 'LOW',
        notificationMessage: d.recommendation || 'Grid stable. Solar and wind generation currently meet campus load requirements.',
        criticalReserveLocked: false,
        actions: ['Grid balanced. Nominal renewable generation meets academic campus load.'],
        estimatedCostSavedInr: 0,
        projectedPeakReductionKw: 0,
      },
    };
  } catch (e) {
    return { data: null };
  }
};

export const executeDispatch = async () => {
  try {
    const res = await axios.post(`${ORCHESTRATOR_URL}/api/v1/orchestrator/execute-dispatch`);
    return res.data;
  } catch (e) {
    console.error('Execute dispatch failed:', e);
    throw e;
  }
};

export const triggerDemoScenario = async (scenario, campusId = null) => {
  try {
    if (scenario === 'cloud-cover' || scenario === 'demand-spike') {
      simulatedSocOverride = null;
      const res = await axios.post(`${TELEMETRY_URL}/api/telemetry/simulate-cloud-cover`);

      // Determine target campus strictly (explicit campusId, localStorage active campus, or logged-in user campus)
      let targetCampusId = campusId;
      if (!targetCampusId) {
        try {
          const activeCampusStorage = localStorage.getItem('tejas_active_campus_id');
          if (activeCampusStorage) {
            targetCampusId = Number(activeCampusStorage);
          } else {
            const savedUser = localStorage.getItem('tejas_auth_user');
            if (savedUser) {
              const parsed = JSON.parse(savedUser);
              if (parsed && parsed.campusId) {
                targetCampusId = Number(parsed.campusId);
              }
            }
          }
        } catch (e) {}
      }
      if (!targetCampusId) targetCampusId = 1;

      const campusMeta = getCampusById(targetCampusId) || RAJASTHAN_CAMPUSES[0];
      const campusName = campusMeta?.name || 'Campus Microgrid';
      const hostelName = campusMeta?.hostels && campusMeta.hostels[0] ? campusMeta.hostels[0].name : 'Campus Hostels';

      // Dynamically fetch registered students STRICTLY for this specific campus from PostgreSQL
      try {
        const studentRes = await axios.get(`${ORCHESTRATOR_URL}/api/v1/students?campusId=${targetCampusId}`);
        const currentStudents = Array.isArray(studentRes.data) ? studentRes.data : [];

        // Filter strictly for students belonging to THIS campus who have opted into WhatsApp
        const activePhones = currentStudents
          .filter((s) => s.whatsappOptIn !== false)
          .map((s) => String(s.phoneNumber || '').replace(/[^0-9]/g, ''))
          .map((p) => (p.startsWith('91') ? p : '91' + p))
          .filter((p) => p.length >= 10);

        if (activePhones.length > 0) {
          const alertMsg = `TEJAS GRID LIVE ALERT: Solar deficit detected at ${campusName}! Green Hour is now ACTIVE in ${hostelName}. Please turn off AC/heaters to earn +50 Karma Points!`;
          await axios.post('http://localhost:5001/api/broadcast', {
            phones: activePhones,
            message: alertMsg,
          });
        }
      } catch (err) {
        console.warn('Dynamic campus WhatsApp broadcast error:', err.message);
      }

      return res.data;
    } else if (scenario === 'critical-soc') {
      // Simulate battery SoC dropping to 24% to trigger 30% reserve lock
      simulatedSocOverride = 24.5;
      await axios.post(`${TELEMETRY_URL}/api/telemetry/simulate-cloud-cover`);
      return { status: 'success', message: 'Critical 24% SoC condition activated.' };
    } else {
      simulatedSocOverride = null;
      const res = await axios.post(`${TELEMETRY_URL}/api/telemetry/reset`);
      return res.data;
    }
  } catch (e) {
    console.error(`Trigger scenario ${scenario} failed:`, e);
    throw e;
  }
};

export const toggleWhatsappOptIn = async (studentId = 1) => {
  try {
    const res = await axios.post(`${ORCHESTRATOR_URL}/api/v1/students/${studentId}/toggle-whatsapp`);
    return res.data;
  } catch (e) {
    console.error('Toggle WhatsApp opt-in failed:', e);
    throw e;
  }
};

export const getLeaderboard = async (campusId = null) => {
  try {
    const url = campusId
      ? `${ORCHESTRATOR_URL}/api/v1/gamification/leaderboard?campusId=${campusId}`
      : `${ORCHESTRATOR_URL}/api/v1/gamification/leaderboard`;
    const res = await axios.get(url);
    const hostels = (res.data.hostelLeaderboard || []).map((h) => ({
      id: h.id,
      name: h.name,
      currentPoints: h.currentKarmaPoints,
      cumulativeSavedKwh: h.cumulativeSavedKwh,
      rank: h.rank,
    }));
    return { data: hostels, topStudents: res.data.topStudents || [] };
  } catch (e) {
    console.error('Get leaderboard failed:', e);
    return {
      data: [
        { id: 1, name: 'Block A (Aryabhata)', currentPoints: 3750, rank: 1, cumulativeSavedKwh: 1480.5 },
        { id: 2, name: 'Block B (Bhaskara)', currentPoints: 3190, rank: 2, cumulativeSavedKwh: 1240.0 },
        { id: 3, name: 'Block C (Charaka)', currentPoints: 2640, rank: 3, cumulativeSavedKwh: 1000.2 },
      ],
      topStudents: [
        { id: 1, name: 'Aarav Sharma', karmaPoints: 520, whatsappOptIn: true },
        { id: 2, name: 'Priya Patel', karmaPoints: 480, whatsappOptIn: true },
        { id: 4, name: 'Ananya Iyer', karmaPoints: 390, whatsappOptIn: true },
      ],
    };
  }
};

export const getRewards = async () => {
  return {
    data: [
      { id: 1, name: 'Cafeteria Beverage Voucher', description: 'Free hot/cold beverage at the Central Campus Food Court.', pointsCost: 150 },
      { id: 2, name: 'Priority Wi-Fi Bandwidth Boost', description: '24-hour unthrottled 500 Mbps high-speed hostel network access.', pointsCost: 300 },
      { id: 3, name: 'Campus EV Charging Coupon', description: 'Complimentary 5 kWh charging session at academic EV charging bay.', pointsCost: 450 },
      { id: 4, name: 'Library Reserved Pod Pass', description: 'Guaranteed 4-hour booking in the 5th floor quiet study cubicle.', pointsCost: 200 },
    ],
  };
};

export const getExecutiveMetrics = async () => {
  try {
    const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/orchestrator/executive-analytics`);
    return { data: res.data };
  } catch (err) {
    console.warn('Executive analytics endpoint unreachable, deriving dynamic metrics:', err.message);
    try {
      const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/gamification/leaderboard`);
      const hostels = res.data.hostelLeaderboard || [];
      const totalKwh = hostels.reduce((acc, h) => acc + (h.cumulativeSavedKwh || 0), 0);
      const costSaved = Math.round(totalKwh * 12.5);
      const carbonAvoided = Math.round(totalKwh * 0.82);

      return {
        data: {
          total_cost_saved_inr: costSaved,
          total_carbon_avoided_kg: carbonAvoided,
          total_energy_saved_kwh: Math.round(totalKwh),
          equivalent_trees_planted: Math.round((carbonAvoided / 21.77) * 10) / 10,
          participating_hostels: hostels.length || 3,
          peak_shaving_ratio_percent: 68.4,
          variance_reduction_percent: 23.4,
          hourly_savings_rate_inr: 5400,
          hourly_carbon_rate_kg: 354,
          total_registered_students: 6,
          total_circulating_karma: 5880,
          executed_dispatches_count: 3,
          battery_soc_percent: 50.0,
          critical_reserve_locked: false,
          tariff_rate_applied_inr: 12.5,
          cea_emission_factor: 0.82,
        },
      };
    } catch (e) {
      return {
        data: {
          total_cost_saved_inr: 61134,
          total_carbon_avoided_kg: 4010,
          total_energy_saved_kwh: 4891,
          equivalent_trees_planted: 184.2,
          participating_hostels: 3,
          peak_shaving_ratio_percent: 68.4,
          variance_reduction_percent: 23.4,
          hourly_savings_rate_inr: 5400,
          hourly_carbon_rate_kg: 354,
          total_registered_students: 6,
          total_circulating_karma: 5880,
          executed_dispatches_count: 3,
          battery_soc_percent: 50.0,
          critical_reserve_locked: false,
          tariff_rate_applied_inr: 12.5,
          cea_emission_factor: 0.82,
        },
      };
    }
  }
};

export const redeemStudentPoints = async (studentId, pointsCost, rewardName) => {
  try {
    const res = await axios.post(`${ORCHESTRATOR_URL}/api/v1/students/${studentId}/redeem`, {
      pointsCost,
      rewardName,
    });
    return res.data;
  } catch (e) {
    console.error('Failed to redeem student points:', e);
    throw e;
  }
};

export const getStudentByRegNo = async (regNo) => {
  try {
    const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/students/reg/${encodeURIComponent(regNo)}`);
    return res.data;
  } catch (e) {
    console.warn(`Could not resolve student by regNo ${regNo}:`, e.message);
    return null;
  }
};

export const getStudents = async (campusId = null) => {
  try {
    const url = campusId
      ? `${ORCHESTRATOR_URL}/api/v1/students?campusId=${campusId}`
      : `${ORCHESTRATOR_URL}/api/v1/students`;
    const res = await axios.get(url);
    return res.data;
  } catch (e) {
    console.error('Failed to fetch students:', e);
    return [];
  }
};

export const createStudent = async (studentData) => {
  try {
    const res = await axios.post(`${ORCHESTRATOR_URL}/api/v1/students`, studentData);
    return res.data;
  } catch (e) {
    console.error('Failed to create student:', e);
    throw e;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const res = await axios.put(`${ORCHESTRATOR_URL}/api/v1/students/${id}`, studentData);
    return res.data;
  } catch (e) {
    console.error('Failed to update student:', e);
    throw e;
  }
};

export const deleteStudent = async (id) => {
  try {
    const res = await axios.delete(`${ORCHESTRATOR_URL}/api/v1/students/${id}`);
    return res.data;
  } catch (e) {
    console.error('Failed to delete student:', e);
    throw e;
  }
};

export const sendWhatsAppMessage = async (phone, message) => {
  let cleanPhone = String(phone).replace(/[^0-9]/g, '');
  if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  try {
    const res = await axios.post('http://localhost:5001/api/send', {
      phone: cleanPhone,
      message: message,
    });
    return res.data;
  } catch (err) {
    console.warn('Local WhatsApp gateway send failed:', err.message);
    throw err;
  }
};

export const sendDirectDeficitAlert = async (phoneNumber = '+918238893551', deficitKw = 180.4) => {
  try {
    const res = await axios.post(
      `${ORCHESTRATOR_URL}/api/v1/students/send-deficit-alert?phoneNumber=${encodeURIComponent(phoneNumber)}&deficitKw=${deficitKw}`
    );
    return res.data;
  } catch (e) {
    console.error('Failed to trigger direct deficit alert:', e);
    throw e;
  }
};

export const enrollStudent = async (studentData) => {
  try {
    // Try through WhatsApp gateway first so auto-reply is dispatched
    const res = await axios.post('http://localhost:5001/api/enroll', studentData);
    return res.data;
  } catch (e) {
    // Fallback directly to Spring Boot Orchestrator
    const res = await axios.post(`${ORCHESTRATOR_URL}/api/v1/students/enroll`, studentData);
    return res.data;
  }
};

export const getEnrollmentRequests = async () => {
  try {
    const res = await axios.get('http://localhost:5001/api/enrollments');
    return res.data?.enrollments || [];
  } catch (e) {
    return [];
  }
};

export default {
  getKpis,
  get24hForecast,
  getDispatchRecommendation,
  executeDispatch,
  triggerDemoScenario,
  toggleWhatsappOptIn,
  getLeaderboard,
  getRewards,
  getExecutiveMetrics,
  getStudents,
  sendDirectDeficitAlert,
};

