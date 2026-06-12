import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, Clock, PieChart } from 'lucide-react';

/**
 * AnalyticsView component that visualizes productivity metrics using custom SVG charts.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects
 * @param {Array} props.categories - Array of custom category tags
 * @returns {React.ReactElement} The rendered AnalyticsView component
 */
export default function AnalyticsView({ tasks, categories }) {
  // 1. Calculate general stats
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;

  // 2. Weekly Productivity Trend: Tasks completed over the past 7 days
  const getWeeklyTrendData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dateString = d.toDateString();
      
      // Filter tasks completed on this specific day
      const count = tasks.filter(t => {
        if (t.status !== 'completed' || !t.updated_at) return false;
        return new Date(t.updated_at).toDateString() === dateString;
      }).length;
      
      data.push({ day: dayLabel, count });
    }
    return data;
  };

  const trendData = getWeeklyTrendData();
  const maxCount = Math.max(...trendData.map(d => d.count), 4); // Min ceiling of 4 for visual spacing

  // Calculate SVG points for weekly line/area chart
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 20;
  
  const points = trendData.map((d, index) => {
    const x = paddingX + (index * (svgWidth - paddingX * 2) / (trendData.length - 1));
    const y = svgHeight - paddingY - (d.count * (svgHeight - paddingY * 2) / maxCount);
    return { x, y, ...d };
  });

  const linePath = points.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  // 3. Category distribution
  const getCategoryStats = () => {
    const stats = {};
    // Seed all active categories
    categories.forEach(c => {
      stats[c.name] = { count: 0, color: c.color };
    });
    // Add "Uncategorized" bucket
    stats['Uncategorized'] = { count: 0, color: 'bg-slate-700' };

    tasks.forEach(t => {
      const catName = t.category && stats[t.category] ? t.category : 'Uncategorized';
      stats[catName].count += 1;
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .filter(c => c.count > 0 || c.name !== 'Uncategorized') // filter unused empty ones, keep uncategorized if used
      .sort((a, b) => b.count - a.count);
  };

  const categoryStats = getCategoryStats();
  const maxCategoryCount = Math.max(...categoryStats.map(c => c.count), 1);

  // Donut chart parameters
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Calculate stroke dashoffsets
  const compStroke = circumference - (completionRate / 100) * circumference;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Tasks</span>
            <h4 className="text-xl font-bold text-slate-200">{total}</h4>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Completed</span>
            <h4 className="text-xl font-bold text-emerald-400">{completed}</h4>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-600/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">In Progress</span>
            <h4 className="text-xl font-bold text-amber-400">{inProgress}</h4>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">To Do</span>
            <h4 className="text-xl font-bold text-rose-400">{pending}</h4>
          </div>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Productivity Trend (SVG Line Area Chart) */}
        <div className="glass-card p-5 rounded-2xl lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">Productivity Trend (Last 7 Days)</h3>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
              Completed Tasks
            </span>
          </div>

          <div className="w-full h-[180px] relative mt-2">
            {total === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-medium">
                No completion data available. Complete tasks to display trend.
              </div>
            ) : (
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  {/* Gradient for area fill */}
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {[0, 1, 2, 3].map((g, idx) => {
                  const yVal = paddingY + (idx * (svgHeight - paddingY * 2) / 3);
                  return (
                    <line
                      key={idx}
                      x1={paddingX}
                      y1={yVal}
                      x2={svgWidth - paddingX}
                      y2={yVal}
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Area under the line */}
                {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                {/* Connecting Trend Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="glow-indigo"
                  />
                )}

                {/* Data Points / Circles */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5.5"
                      fill="#0b0f19"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                    />
                    {p.count > 0 && (
                      <text
                        x={p.x}
                        y={p.y - 12}
                        textAnchor="middle"
                        fill="#a5b4fc"
                        className="text-[9px] font-bold"
                      >
                        {p.count}
                      </text>
                    )}
                  </g>
                ))}

                {/* Day Labels on X Axis */}
                {points.map((p, idx) => (
                  <text
                    key={idx}
                    x={p.x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    fill="#64748b"
                    className="text-[9px] font-semibold"
                  >
                    {p.day}
                  </text>
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* Task Completion Ratio Donut Chart */}
        <div className="glass-card p-5 rounded-2xl lg:col-span-4 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">Completion Ratios</h3>
          </div>

          <div className="flex items-center justify-center py-2">
            {total === 0 ? (
              <div className="text-xs text-slate-500 font-medium h-[120px] flex items-center">
                No tasks available
              </div>
            ) : (
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Underlay tracks */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.02)"
                    strokeWidth={strokeWidth}
                  />
                  {/* Completed arc */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={compStroke}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-slate-100">{completionRate}%</span>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Completed</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend ratios */}
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Completed</span>
              </div>
              <span className="font-bold text-emerald-400">{completed} ({completionRate}%)</span>
            </div>
            <div className="flex justify-between items-center px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-400">In Progress</span>
              </div>
              <span className="font-bold text-amber-400">{inProgress} ({inProgressRate}%)</span>
            </div>
            <div className="flex justify-between items-center px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-400">To Do</span>
              </div>
              <span className="font-bold text-rose-400">{pending} ({pendingRate}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Category Breakdown */}
      <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-200">Category Distribution</h3>
        
        {categoryStats.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-6">
            No categorized tasks found. Add categories to structure tasks.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {categoryStats.map((cat, idx) => {
              const pct = Math.round((cat.count / maxCategoryCount) * 100);
              
              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                      <span className="text-slate-300">{cat.name}</span>
                    </div>
                    <span className="text-slate-400 font-bold">{cat.count} {cat.count === 1 ? 'task' : 'tasks'}</span>
                  </div>

                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/[0.02]">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${cat.color}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
