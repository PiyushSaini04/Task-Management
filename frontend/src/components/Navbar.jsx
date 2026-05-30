import React from 'react';
import { CheckSquare, Activity, BarChart2 } from 'lucide-react';

/**
 * Navbar component that displays application branding and a summary of task statistics.
 * 
 * @component
 * @param {Object} props
 * @param {number} props.totalCount - Total number of tasks
 * @param {number} props.completedCount - Number of completed tasks
 * @param {number} props.pendingCount - Number of pending tasks
 * @returns {React.ReactElement} The rendered Navbar component
 */
export default function Navbar({ totalCount, completedCount, pendingCount }) {
  return (
    <nav className="glass-card sticky top-0 z-50 px-6 py-4 mb-8 backdrop-blur-md rounded-b-2xl border-t-0 border-x-0">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 glow-indigo">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
              TaskFlow
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Workspace Dashboard</p>
          </div>
        </div>

        {/* Stats summary dashboard */}
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/[0.04]">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 hidden xs:inline">Total:</span>
            <span className="font-bold text-slate-200">{totalCount}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/[0.04]">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 hidden xs:inline">Completed:</span>
            <span className="font-bold text-emerald-400">{completedCount}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/[0.04]">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 hidden xs:inline">Pending:</span>
            <span className="font-bold text-amber-400">{pendingCount}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
