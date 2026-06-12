import { 
  LayoutDashboard, 
  Trello, 
  Calendar, 
  BarChart3, 
  Tags, 
  CheckSquare 
} from 'lucide-react';

/**
 * Sidebar component that manages layout navigation across different pages of the application.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.currentPage - The active page identifier ('dashboard', 'board', 'calendar', 'analytics', 'categories')
 * @param {function} props.onPageChange - Callback when a navigation item is clicked
 * @param {number} props.totalTasks - Total number of tasks
 * @param {number} props.completedTasks - Number of completed tasks
 * @returns {React.ReactElement} The rendered Sidebar component
 */
export default function Sidebar({ currentPage, onPageChange, totalTasks, completedTasks }) {
  const menuItems = [
    { id: 'dashboard', label: 'List Dashboard', icon: LayoutDashboard },
    { id: 'board', label: 'Kanban Board', icon: Trello },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'analytics', label: 'Analytics Insights', icon: BarChart3 },
    { id: 'categories', label: 'Manage Categories', icon: Tags },
  ];

  // Calculate completion percentage
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <aside className="glass-card w-full lg:w-64 h-auto lg:h-[calc(100vh-2rem)] sticky lg:top-4 p-5 rounded-2xl flex flex-col justify-between gap-6 shadow-2xl border-white/[0.06]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4">
        <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 glow-indigo flex-shrink-0">
          <CheckSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
            TaskFlow
          </h1>
          <p className="text-[9px] text-slate-500 tracking-wider uppercase font-semibold">SaaS Enterprise</p>
        </div>
      </div>

      {/* Navigation Menu Links */}
      <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 flex-1 scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 flex-1 lg:flex-none ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Productivity Section */}
      <div className="hidden lg:flex flex-col gap-3 pt-4 border-t border-white/[0.04]">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Task Progress</span>
          <span className="text-indigo-400">{completionRate}%</span>
        </div>
        
        {/* Progress bar container */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.02]">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        
        <p className="text-[10px] text-slate-500 leading-normal">
          Keep crushing it! You completed {completedTasks} out of {totalTasks} tasks.
        </p>
      </div>
    </aside>
  );
}
