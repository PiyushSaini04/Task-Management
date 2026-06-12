import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, X, Tag } from 'lucide-react';

/**
 * CalendarView component displays tasks in a monthly grid based on due dates.
 * Allows quick-adding tasks by clicking on a calendar cell.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects
 * @param {Array} props.categories - Array of custom category tags
 * @param {function} props.onAddTask - Callback to create a new task with due_date preset
 * @returns {React.ReactElement} The rendered CalendarView component
 */
export default function CalendarView({ tasks, categories, onAddTask }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCellDate, setSelectedCellDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for quick add
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar Grid Calculation
  const getCalendarCells = () => {
    const cells = [];
    
    // First day of current month (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    // Total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Total days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // 1. Pad previous month days
    const prevMonthStartDay = daysInPrevMonth - firstDayIndex + 1;
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({
        date: new Date(year, month - 1, prevMonthStartDay + i),
        isCurrentMonth: false
      });
    }
    
    // 2. Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // 3. Pad next month days to complete 6 rows (42 cells)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return cells;
  };

  const cells = getCalendarCells();
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle open quick add modal
  const handleCellClick = (date) => {
    setSelectedCellDate(date);
    setTaskTitle('');
    setTaskDesc('');
    // Pick first category as default if available
    setTaskCategory(categories && categories.length > 0 ? categories[0].name : '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle quick task submit
  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setFormError('Task title is required.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);

    try {
      // Create a localized datetime set to 12:00 PM on the selected date
      const due = new Date(selectedCellDate);
      due.setHours(12, 0, 0, 0);

      await onAddTask({
        title: taskTitle.trim(),
        description: taskDesc.trim() || null,
        category: taskCategory || null,
        due_date: due.toISOString(),
        status: 'pending'
      });
      setIsModalOpen(false);
    } catch (err) {
      setFormError('Failed to create scheduled task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 h-full animate-fade-in">
      {/* Calendar Header Nav */}
      <div className="flex justify-between items-center bg-slate-900/60 border border-white/[0.03] p-4 rounded-2xl backdrop-blur-md flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-100">
            {monthNames[month]} {year}
          </h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/[0.04] text-slate-400 hover:text-slate-200 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/[0.04] text-xs font-semibold text-slate-300 hover:text-slate-100 transition"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/[0.04] text-slate-400 hover:text-slate-200 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="glass-card overflow-hidden rounded-2xl border border-white/[0.06] shadow-xl">
        {/* Weekday Row */}
        <div className="grid grid-cols-7 border-b border-white/[0.04] bg-slate-950/40 text-center py-3">
          {weekdayNames.map((day) => (
            <span key={day} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 bg-slate-900/10">
          {cells.map((cell, idx) => {
            const dateStr = cell.date.toDateString();
            const dayTasks = tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === dateStr);
            const isToday = new Date().toDateString() === dateStr;

            return (
              <div
                key={idx}
                onClick={() => handleCellClick(cell.date)}
                className={`min-h-[100px] p-2 border-b border-r border-white/[0.03] flex flex-col gap-1.5 cursor-pointer transition-all duration-200 hover:bg-white/[0.01] ${
                  cell.isCurrentMonth ? 'text-slate-200' : 'text-slate-600 bg-slate-950/10'
                }`}
              >
                {/* Cell Number Header */}
                <div className="flex justify-between items-center">
                  <span 
                    className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                        : cell.isCurrentMonth ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  
                  {cell.isCurrentMonth && (
                    <button 
                      title="Quick Schedule Task" 
                      className="opacity-0 hover:opacity-100 group-hover:opacity-100 text-slate-500 hover:text-indigo-400 p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[70px] scrollbar-none">
                  {dayTasks.map((t) => {
                    const isCompleted = t.status === 'completed';
                    
                    return (
                      <div
                        key={t.id}
                        title={`${t.title} [${t.status}]`}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold truncate border ${
                          isCompleted 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80 line-through' 
                            : t.status === 'in_progress'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {t.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/[0.08] shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-1">
              <Calendar className="w-4.5 h-4.5 text-indigo-400" />
              Schedule Task
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Create a task scheduled for <strong>{selectedCellDate?.toLocaleDateString(undefined, { dateStyle: 'full' })}</strong>
            </p>

            {formError && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleQuickAddSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Task Title *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => {
                    setTaskTitle(e.target.value);
                    if (e.target.value.trim()) setFormError('');
                  }}
                  placeholder="Task title"
                  className="glass-input px-3.5 py-2 rounded-xl text-sm text-slate-200"
                  maxLength={255}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Description (Optional)</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Task description"
                  className="glass-input px-3.5 py-2 rounded-xl text-xs text-slate-300 min-h-[60px]"
                  maxLength={1000}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Category
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="glass-input px-3 py-2 rounded-xl text-xs text-slate-300"
                >
                  <option value="">No Category</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium py-2.5 px-4 rounded-xl text-xs font-semibold transition"
              >
                Create Scheduled Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
