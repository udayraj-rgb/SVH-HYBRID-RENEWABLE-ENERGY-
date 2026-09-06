import React, { useState } from 'react';
import { Activity } from 'lucide-react';

export default function KpiCard({ title, value, unit, icon: Icon, trend, color }) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine vibrant theme color based on title or explicit prop
  const getColorTheme = () => {
    if (color) return color;
    const t = (title || '').toLowerCase();
    if (t.includes('solar') || t.includes('pv')) return 'amber';
    if (t.includes('wind') || t.includes('turbine')) return 'cyan';
    if (t.includes('battery') || t.includes('storage') || t.includes('soc')) return 'emerald';
    if (t.includes('demand') || t.includes('load')) return 'purple';
    if (t.includes('cost') || t.includes('saved') || t.includes('rupee')) return 'emerald';
    if (t.includes('carbon') || t.includes('co2') || t.includes('tree')) return 'teal';
    return 'blue';
  };

  const c = getColorTheme();

  const themeStyles = {
    amber: {
      card: 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-white/90 dark:from-amber-500/10 dark:via-slate-900/95 dark:to-slate-900 border-amber-300/70 dark:border-amber-500/30 shadow-amber-500/5',
      iconBox: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 group-hover:scale-110',
      badge: 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      glow: 'group-hover:shadow-amber-500/20',
      dot: 'bg-amber-500',
    },
    cyan: {
      card: 'bg-gradient-to-br from-cyan-500/15 via-cyan-500/5 to-white/90 dark:from-cyan-500/10 dark:via-slate-900/95 dark:to-slate-900 border-cyan-300/70 dark:border-cyan-500/30 shadow-cyan-500/5',
      iconBox: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 group-hover:scale-110',
      badge: 'bg-cyan-100/80 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60',
      glow: 'group-hover:shadow-cyan-500/20',
      dot: 'bg-cyan-500',
    },
    emerald: {
      card: 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-white/90 dark:from-emerald-500/10 dark:via-slate-900/95 dark:to-slate-900 border-emerald-300/70 dark:border-emerald-500/30 shadow-emerald-500/5',
      iconBox: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-110',
      badge: 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      glow: 'group-hover:shadow-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    purple: {
      card: 'bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-white/90 dark:from-purple-500/10 dark:via-slate-900/95 dark:to-slate-900 border-purple-300/70 dark:border-purple-500/30 shadow-purple-500/5',
      iconBox: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 group-hover:scale-110',
      badge: 'bg-purple-100/80 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
      glow: 'group-hover:shadow-purple-500/20',
      dot: 'bg-purple-500',
    },
    teal: {
      card: 'bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-white/90 dark:from-teal-500/10 dark:via-slate-900/95 dark:to-slate-900 border-teal-300/70 dark:border-teal-500/30 shadow-teal-500/5',
      iconBox: 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 group-hover:scale-110',
      badge: 'bg-teal-100/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/60',
      glow: 'group-hover:shadow-teal-500/20',
      dot: 'bg-teal-500',
    },
    blue: {
      card: 'bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-white/90 dark:from-blue-500/10 dark:via-slate-900/95 dark:to-slate-900 border-blue-300/70 dark:border-blue-500/30 shadow-blue-500/5',
      iconBox: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 group-hover:scale-110',
      badge: 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      glow: 'group-hover:shadow-blue-500/20',
      dot: 'bg-blue-500',
    },
  }[c];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`card-interactive p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between ${themeStyles.card} ${themeStyles.glow}`}
    >
      {/* Top row: Title and Icon Box */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${themeStyles.dot} ${isHovered ? 'animate-ping' : ''}`} />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">{title}</p>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {value}
            </h3>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{unit}</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl transition-transform duration-300 shadow-xs shrink-0 ${themeStyles.iconBox}`}>
          <Icon size={22} />
        </div>
      </div>

      {/* Bottom row: Trend indicator */}
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${themeStyles.badge}`}>
            <Activity size={10} className="shrink-0" />
            <span className="truncate max-w-[190px]">{trend}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">
            LIVE SCADA
          </span>
        </div>
      )}
    </div>
  );
}
