import React from 'react';
import { X, IndianRupee, Leaf, Zap, Shield, BarChart3, TreePine, Calculator } from 'lucide-react';

export default function ExecutiveCalculationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 text-slate-900 dark:text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-xl bg-slate-100 dark:bg-slate-800 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-500/30">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">How Executive Analytics Are Calculated</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              National CEA benchmarks & commercial tariff accounting methodology
            </p>
          </div>
        </div>

        {/* Breakdown of 4 Core ESG Metrics */}
        <div className="space-y-4 text-xs">
          {/* 1. FINANCIAL */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                <IndianRupee size={16} />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Peak Tariff Financial Savings (₹)</h3>
            </div>
            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] mb-2 text-emerald-600 dark:text-emerald-300">
              Cost Saved (₹) = Total kWh Saved × Commercial Time-of-Day Tariff (₹12.50 / kWh)
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Commercial educational institutions in India incur steep Time-of-Day (ToD) peak tariffs between 18:00 – 22:00. Every unit of electricity shifted from the utility grid to campus solar/batteries or curtailed through student demand response saves <strong>₹12.50 per kWh</strong>, avoiding expensive maximum demand penalties (kVA penalty).
            </p>
          </div>

          {/* 2. CARBON EMISSIONS */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                <Leaf size={16} />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Scope 2 Carbon Emissions Avoided (kg CO₂e)</h3>
            </div>
            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] mb-2 text-emerald-600 dark:text-emerald-300">
              CO₂ Avoided (kg) = Total Clean Energy (kWh) × 0.82 kg CO₂ / kWh
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Sourced from the <strong>Central Electricity Authority (CEA) of India Baseline Carbon Database (Version 19)</strong>. Because the national grid relies predominantly on coal-fired thermal generation, replacing 1 kWh of grid draw prevents <strong>0.82 kg of CO₂ equivalent</strong> greenhouse gas emissions.
            </p>
          </div>

          {/* 3. TREE EQUIVALENT */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
                <TreePine size={16} />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Mature Tree Sequestration Offset</h3>
            </div>
            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] mb-2 text-teal-600 dark:text-teal-300">
              Tree Offset = Total CO₂ Avoided (kg) ÷ 21.77 kg CO₂ / tree / year
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Based on EPA and Forestry Commission standards: an average mature urban tree absorbs approximately <strong>21.77 kg of atmospheric CO₂ annually</strong>.
            </p>
          </div>

          {/* 4. SAFETY ASSURANCE */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                <Shield size={16} />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">4. 30% Battery Critical Lab Reserve Floor</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              The 800 kWh BESS (Battery Energy Storage System) enforces an un-bypassable hardware threshold at <strong>30% State of Charge (SoC = 240 kWh)</strong>. Discharging is automatically locked out for general residential demand response below 30% to guarantee continuous, uninterruptible power for campus AI servers, robotics labs, and critical research infrastructure.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">Official ISO 50001 & ESG Compliance Methodology</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
          >
            Close Formula Explainer
          </button>
        </div>
      </div>
    </div>
  );
}
