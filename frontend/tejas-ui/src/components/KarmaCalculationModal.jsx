import React from 'react';
import { X, Award, Zap, TrendingUp, Sparkles, CheckCircle2, Gift, Calculator } from 'lucide-react';

export default function KarmaCalculationModal({ isOpen, onClose }) {
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
          <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-2xl border border-emerald-500/30">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">How Karma Points Are Calculated</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transparent, real-time demand-response gamification formula
            </p>
          </div>
        </div>

        {/* Master Formula Box */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-6 font-mono text-xs">
          <p className="text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider text-[10px] mb-1 font-sans">
            📐 Master Calculation Formula:
          </p>
          <p className="text-slate-900 dark:text-emerald-100 font-bold text-sm">
            Total KP = Base Event (50 KP) + (Δ kWh × 10) × Streak Multiplier + Block Bonus
          </p>
        </div>

        {/* Breakdown of Components */}
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 font-bold font-mono">
              +50 KP
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">1. Base Green Hour Participation</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Awarded automatically when you acknowledge an automated WhatsApp solar deficit alert and your room's smart meter confirms power reduction during the 45-minute window.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0 font-bold font-mono">
              10 KP/kWh
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">2. Actual Energy Curtailed (Δ kWh)</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Calculated against your room's 7-day rolling baseline:
              </p>
              <ul className="mt-1.5 space-y-1 text-slate-600 dark:text-slate-300">
                <li>• <strong>AC (1.5 kW) turned off for 1 hr:</strong> 1.5 kWh saved = <strong>+15 KP</strong></li>
                <li>• <strong>Water Geyser (2.0 kW) delayed:</strong> 2.0 kWh saved = <strong>+20 KP</strong></li>
                <li>• <strong>High-end GPU / Gaming Rig paused:</strong> 0.4 kWh saved = <strong>+4 KP</strong></li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg shrink-0 font-bold font-mono">
              1.2x - 1.5x
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">3. Consistency Streak Multipliers</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Students participating in consecutive alerts unlock progressive multipliers:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-emerald-500">3-Event Streak:</span> 1.2x boost
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-purple-500">7-Event Streak:</span> 1.5x boost (Green Guardian)
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 font-bold font-mono">
              +100 KP
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">4. Community Block Victory Cup</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                When your hostel (e.g. <em>Block A Aryabhata</em>) leads the weekly energy efficiency leaderboard, all active participating students receive a +100 KP community bonus.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">VPP 2.0 Dynamic Gamification Engine</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
