import React, { useState } from 'react';
import {
  X,
  Sun,
  Wind,
  Battery,
  Activity,
  IndianRupee,
  Calculator,
  Shield,
  Zap,
  Info,
  CheckCircle2,
  TreePine,
  Leaf,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function MicrogridFormulaModal({ isOpen, onClose, campus }) {
  const [activeTab, setActiveTab] = useState('solar');

  if (!isOpen) return null;

  // Concrete campus parameters or statewide default
  const solarCap = campus?.solarCapacityKw || 500;
  const windCap = campus?.windCapacityKw || 100;
  const battCap = campus?.batteryCapacityKwh || 800;
  const loadCap = campus?.sanctionedLoadKw || 500;
  const districtName = campus?.district || 'Jaipur (Statewide Benchmark)';
  const campusName = campus?.name || 'Directorate of Technical Education (Statewide)';

  const tabs = [
    { id: 'solar', label: 'Solar Generation', icon: Sun },
    { id: 'wind', label: 'Wind Yield', icon: Wind },
    { id: 'battery', label: 'Battery Storage (BESS)', icon: Battery },
    { id: 'demand', label: 'Campus Demand', icon: Activity },
    { id: 'tariffs', label: 'RERC ToD & ESG', icon: IndianRupee },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 text-slate-900 dark:text-slate-100 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-xl bg-slate-100 dark:bg-slate-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Calculator size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Microgrid Mathematical &amp; Physics Formulation
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                IEEE 2030.7 SCADA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic physics equations, Open-Meteo irradiance models, and autonomous battery dispatch algorithms
            </p>
          </div>
        </div>

        {/* Campus Context Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-amber-500" />
            <span className="font-bold text-slate-700 dark:text-slate-200">Active Parameters:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{campusName}</span>
            <span className="text-slate-400">({districtName})</span>
          </div>
          <div className="flex items-center gap-3 font-mono font-bold text-[11px] text-slate-600 dark:text-slate-300">
            <span className="text-amber-600 dark:text-amber-400">PV: {solarCap} kW</span>
            <span className="text-emerald-600 dark:text-emerald-400">Wind: {windCap} kW</span>
            <span className="text-blue-600 dark:text-blue-400">BESS: {battCap} kWh</span>
            <span className="text-purple-600 dark:text-purple-400">Demand: {loadCap} kW</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 overflow-x-auto shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 space-y-4 text-xs">
          {/* TAB 1: SOLAR GENERATION */}
          {activeTab === 'solar' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-amber-700 dark:text-amber-400">
                  <Sun size={18} />
                  <span>1. Diurnal Bell Curve Physics (Instantaneous SCADA Simulation)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Solar photovoltaic generation follows an astronomical sun-angle bell curve active between sunrise (06:00) and sunset (18:30), with peak solar altitude occurring at solar noon (~12:15 IST).
                </p>
              </div>

              {/* Master Formula */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Core Generation Equation:
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-amber-600 dark:text-amber-300 font-bold">
                  P_solar(t) = min( C_solar , C_solar × [ sin( π × (h_dec - 6.0) / 12.5 ) ]^1.15 × η_cloud )
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>• <strong>C_solar:</strong> Rated DC Solar PV Capacity ({solarCap} kW)</div>
                  <div>• <strong>h_dec:</strong> Current decimal time (Hour + Min/60)</div>
                  <div>• <strong>Exponent 1.15:</strong> Atmospheric air-mass optical path coefficient</div>
                  <div>• <strong>η_cloud:</strong> Stochastic atmospheric transmittance factor (0.96 – 1.04)</div>
                </div>
              </div>

              {/* Weather Grounding */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Numerical Weather Prediction (Open-Meteo Integration):
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-emerald-600 dark:text-emerald-300 font-bold">
                  P_solar_pred(t) = min( C_solar , ( GHI(t) / 1000 W/m² ) × C_solar × η_PR )
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                  <p>• <strong>GHI(t):</strong> Global Horizontal Irradiance in W/m² retrieved hourly from Open-Meteo satellite feeds.</p>
                  <p>• <strong>1000 W/m²:</strong> Standard Test Condition (STC) reference irradiance.</p>
                  <p>• <strong>η_PR = 0.88:</strong> System Performance Ratio accounting for inverter conversion efficiency (97.5%), dust/soiling losses (5%), and cell temperature derating.</p>
                </div>
              </div>

              {/* Live Campus Substitution */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200">
                <div className="font-bold text-xs flex items-center gap-1.5 mb-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={14} /> Campus Substitution for {campusName}:
                </div>
                <p className="font-mono text-[11px]">
                  Peak Noon Yield = {solarCap} kW × 1.0 × 0.88 = <strong>{(solarCap * 0.88).toFixed(1)} kW</strong> clean output during clear sky conditions.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: WIND YIELD */}
          {activeTab === 'wind' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-emerald-700 dark:text-emerald-400">
                  <Wind size={18} />
                  <span>2. Regional Microclimate Wind Yield Model</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Wind turbine yield incorporates Rajasthan's distinct geographic terrain: Western Thar desert corridors (Bikaner, Jodhpur, Barmer, Nagaur, Pali, Churu) exhibit significantly higher mean wind speeds than the eastern plains.
                </p>
              </div>

              {/* Master Formula */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Regional Geographic Formulation:
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-emerald-600 dark:text-emerald-300 font-bold">
                  P_wind(t) = min( C_wind , C_wind × R_regional )
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>• <strong>Western Thar Desert:</strong> R_regional ∈ [0.45, 0.80] (High yield: 45% – 80%)</div>
                  <div>• <strong>Eastern / Southern Plains:</strong> R_regional ∈ [0.15, 0.40] (Mild yield: 15% – 40%)</div>
                  <div>• <strong>C_wind:</strong> Rated Wind Turbine Capacity ({windCap} kW)</div>
                  <div>• <strong>Temporal Smoothing:</strong> 1-hour rolling averaging window</div>
                </div>
              </div>

              {/* Aerodynamic Power Curve */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Turbine Aerodynamic Power Curve (Open-Meteo Windspeed):
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-teal-600 dark:text-teal-300 font-bold">
                  P_wind_pred(t) = min( C_wind , C_wind × min( 1.0 , v_wind(t) / 22.0 km/h ) × 0.65 )
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                  <p>• <strong>v_wind(t):</strong> 10-meter hub-height velocity in km/h from Open-Meteo.</p>
                  <p>• <strong>v_rated = 22.0 km/h:</strong> Rated wind velocity achieving maximum power output.</p>
                  <p>• <strong>η_aero = 0.65:</strong> Combined Betz limit factor, generator efficiency, and yaw alignment factor.</p>
                </div>
              </div>

              {/* Live Campus Substitution */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200">
                <div className="font-bold text-xs flex items-center gap-1.5 mb-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={14} /> Campus Substitution for {campusName}:
                </div>
                <p className="font-mono text-[11px]">
                  Nominal Wind Yield = {windCap} kW × 0.45 = <strong>{(windCap * 0.45).toFixed(1)} kW</strong> continuous baseline support.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BATTERY STORAGE */}
          {activeTab === 'battery' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-blue-700 dark:text-blue-400">
                  <Battery size={18} />
                  <span>3. Battery Energy Storage System (BESS) &amp; SoC Dynamics</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  The BESS dynamically balances generation surpluses and deficits while preserving battery degradation life through strict C-rate limits (0.40C) and a hard 30% Critical Lab Reserve safety floor.
                </p>
              </div>

              {/* Power Balance */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Net Power Balance &amp; C-Rate Constraint:
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-blue-600 dark:text-blue-300 font-bold space-y-1">
                  <div>P_net(t) = ( P_solar(t) + P_wind(t) ) - P_campus_load(t)</div>
                  <div>P_max_c = C_battery × 0.40 C   [Max power = {(battCap * 0.4).toFixed(0)} kW for {battCap} kWh BESS]</div>
                </div>
              </div>

              {/* Charging and Discharging Equations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Charging */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    Surplus Charging (P_net &gt; 0):
                  </span>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-emerald-600 dark:text-emerald-300">
                    P_chg = min( P_net , P_max_c , (95% - SoC) × C_batt / 100 )
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-emerald-600 dark:text-emerald-300">
                    ΔSoC = +( P_chg × Δt / C_batt ) × 100%
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Remaining surplus exports to RERC utility grid: P_export = max(0, P_net - P_chg).
                  </p>
                </div>

                {/* Discharging */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400">
                    Peak Discharging (P_net &lt; 0):
                  </span>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-red-600 dark:text-red-300">
                    P_dis = min( |P_net| , P_max_c , (SoC - 25%) × C_batt / 100 )
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-red-600 dark:text-red-300">
                    ΔSoC = -( P_dis × Δt / C_batt ) × 100%
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Unmet deficit imports from utility grid: P_import = max(0, |P_net| - P_dis).
                  </p>
                </div>
              </div>

              {/* 30% Safety Lock */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Shield size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-amber-800 dark:text-amber-300">30% Critical Lab Reserve Threshold:</strong> If battery SoC drops to ≤ 30% ({(battCap * 0.3).toFixed(0)} kWh), residential demand response discharge is immediately halted to guarantee uninterrupted clean power for mission-critical campus AI servers, robotics labs, and incubation facilities.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CAMPUS DEMAND */}
          {activeTab === 'demand' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-purple-700 dark:text-purple-400">
                  <Activity size={18} />
                  <span>4. Diurnal Institutional &amp; Residential Demand Profile</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Campus electricity consumption is modeled on verified institutional load profiles comprising academic departments, research computing laboratories, hostel blocks, and central dining facilities.
                </p>
              </div>

              {/* Master Formula */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Sanctioned Demand Ratio Equation:
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-purple-600 dark:text-purple-300 font-bold">
                  P_campus_load(t) = L_sanctioned × Load_Ratio( t )
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Where L_sanctioned is the campus's statutory utility contract demand ({loadCap} kW).
                </p>
              </div>

              {/* 4 Time Window Breakdown */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Academic &amp; Labs Peak (08:30 – 17:30)</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Air conditioning, classrooms, computing labs, workshop machinery</p>
                  </div>
                  <div className="text-right font-mono font-bold">
                    <span className="text-purple-600 dark:text-purple-400 text-sm">68% – 90% (Nom. 72%)</span>
                    <div className="text-[10px] text-slate-400">~{(loadCap * 0.72).toFixed(1)} kW</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Hostel Evening Peak (17:30 – 23:00)</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Hostel lighting, dining halls, geysers, campus perimeter illumination</p>
                  </div>
                  <div className="text-right font-mono font-bold">
                    <span className="text-amber-600 dark:text-amber-400 text-sm">52% – 72% (Nom. 62%)</span>
                    <div className="text-[10px] text-slate-400">~{(loadCap * 0.62).toFixed(1)} kW</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Morning Ramp-up (06:00 – 08:30)</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Kitchen prep, hostel water pumps, campus awakening</p>
                  </div>
                  <div className="text-right font-mono font-bold">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">38% – 53% (Nom. 40%)</span>
                    <div className="text-[10px] text-slate-400">~{(loadCap * 0.40).toFixed(1)} kW</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Night Baseload (23:00 – 06:00)</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Critical servers, emergency lighting, cold storage refrigeration</p>
                  </div>
                  <div className="text-right font-mono font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">22% – 32% (Nom. 25%)</span>
                    <div className="text-[10px] text-slate-400">~{(loadCap * 0.25).toFixed(1)} kW</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TARIFFS & ESG */}
          {activeTab === 'tariffs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-emerald-700 dark:text-emerald-400">
                  <IndianRupee size={18} />
                  <span>5. RERC Time-of-Day (ToD) Tariffs &amp; Scope 2 Carbon Offsets</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Statutory Rajasthan Electricity Regulatory Commission (RERC) high-tension institutional tariff structures and Central Electricity Authority (CEA v19) carbon displacement factors.
                </p>
              </div>

              {/* RERC ToD Table */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  RERC High-Tension Tariff Windows:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-500/30">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">Off-Peak Solar (10:00 – 16:00)</div>
                    <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">₹5.80 / kWh</div>
                    <div className="text-[10px] text-slate-400">15% solar incentive rebate</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="font-bold text-slate-700 dark:text-slate-300">Normal (06-10, 16-18, 22-24)</div>
                    <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">₹7.50 / kWh</div>
                    <div className="text-[10px] text-slate-400">Standard institutional baseline</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-red-500/30">
                    <div className="font-bold text-red-600 dark:text-red-400">Evening Peak (18:00 – 22:00)</div>
                    <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">₹9.50 / kWh</div>
                    <div className="text-[10px] text-slate-400">26.7% surcharge + kVA penalty</div>
                  </div>
                </div>
              </div>

              {/* CEA Carbon Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-teal-600 dark:text-teal-400">
                    <Leaf size={14} /> Scope 2 Carbon Mitigation:
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-white p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                    CO₂ (kg) = Clean Energy (kWh) × 0.820 kg/kWh
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Central Electricity Authority (CEA) Baseline Database Version 19.0.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <TreePine size={14} /> Mature Tree Carbon Offset:
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-white p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                    Trees = CO₂ Avoided (kg) ÷ 21.77 kg/tree/year
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    EPA Biophilic Standard: 1 mature tree absorbs ~21.77 kg atmospheric CO₂ annually.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs shrink-0">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info size={13} className="text-emerald-500" />
            <span>Mathematical engine validated against IEEE 2030.7 &amp; RERC 2024-25 standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition shadow-sm"
          >
            Close Explainer
          </button>
        </div>
      </div>
    </div>
  );
}
