import axios from 'axios';

const ORCHESTRATOR_URL = 'http://localhost:8080';
const TELEMETRY_URL = 'http://localhost:8000';

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

export const triggerDemoScenario = async (scenario) => {
  try {
    if (scenario === 'cloud-cover' || scenario === 'demand-spike') {
      simulatedSocOverride = null;
      const res = await axios.post(`${TELEMETRY_URL}/api/telemetry/simulate-cloud-cover`);

      // Trigger automatic WhatsApp deficit dispatch directly to student inboxes
      try {
        await axios.post('http://localhost:5001/api/broadcast', {
          phones: ['918238893551', '919834031115', '919031717980'],
          message: '⚡ TEJAS GRID LIVE ALERT: Solar deficit of 184.2 kW detected on campus! Green Hour is now ACTIVE in Block A (Aryabhata). Please turn off AC/heaters to earn +50 Karma Points!'
        });
      } catch (err) {
        console.warn('Direct gateway dispatch error:', err.message);
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

export const getLeaderboard = async () => {
  try {
    const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/gamification/leaderboard`);
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
        participating_hostels: hostels.length || 3,
      },
    };
  } catch (e) {
    return {
      data: {
        total_cost_saved_inr: 46500,
        total_carbon_avoided_kg: 3050,
        total_energy_saved_kwh: 3720,
        participating_hostels: 3,
      },
    };
  }
};

export const getStudents = async () => {
  try {
    const res = await axios.get(`${ORCHESTRATOR_URL}/api/v1/students`);
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

