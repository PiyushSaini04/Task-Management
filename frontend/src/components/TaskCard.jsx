import { useState } from 'react';
import { Edit2, Trash2, Check, X, Calendar, Clock, AlertTriangle, Play } from 'lucide-react';

/**
 * TaskCard component represents a single task item.
 * Supports cycling statuses (Pending -> In Progress -> Completed), past-due alerts, category badges,
 * and inline editing of all task properties.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.task - The task object
 * @param {string} props.task.id - UUID of the task
 * @param {string} props.task.title - Title of the task
 * @param {string} props.task.description - Description of the task
 * @param {string} props.task.status - 'pending', 'in_progress', or 'completed'
 * @param {string} props.task.category - Category label
 * @param {string} props.task.due_date - ISO due date timestamp
 * @param {string} props.task.created_at - ISO creation timestamp
 * @param {string} props.task.updated_at - ISO last-updated timestamp
 * @param {function} props.onUpdateTask - Callback handler for task updates
 * @param {function} props.onDeleteTask - Callback handler for task deletion
 * @param {Array} props.categories - Array of active category objects { name: string, color: string }
 * @returns {React.ReactElement} The rendered TaskCard component
 */
export default function TaskCard({ task, onUpdateTask, onDeleteTask, categories }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editCategory, setEditCategory] = useState(task.category || '');
  const [editDueDate, setEditDueDate] = useState(() => {
    if (!task.due_date) return '';
    // Format to YYYY-MM-DDTHH:MM for datetime-local input
    const d = new Date(task.due_date);
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [validationError, setValidationError] = useState('');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Format timestamps nicely
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const handleToggleStatus = async () => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    
    // Cycle status: pending -> in_progress -> completed -> pending
    let nextStatus = 'pending';
    if (task.status === 'pending') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') nextStatus = 'completed';
    
    try {
      await onUpdateTask(task.id, { status: nextStatus });
    } catch {
      // Handled by App.jsx
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    const cleanTitle = editTitle.trim();
    if (!cleanTitle) {
      setValidationError('Title cannot be empty');
      return;
    }
    setValidationError('');
    setIsActionLoading(true);
    try {
      await onUpdateTask(task.id, {
        title: cleanTitle,
        description: editDescription.trim() || null,
        category: editCategory || null,
        due_date: editDueDate ? new Date(editDueDate).toISOString() : null
      });
      setIsEditing(false);
    } catch {
      // Restore previous state if API failed
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditCategory(task.category || '');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategory(task.category || '');
    setValidationError('');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      await onDeleteTask(task.id);
    } catch {
      setShowDeleteConfirm(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Visual variables
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
  
  // Color configuration based on status
  let statusColorClass = 'bg-indigo-500';
  let checkboxBorderClass = 'border-slate-700 hover:border-indigo-500';
  if (isCompleted) {
    statusColorClass = 'bg-emerald-500';
    checkboxBorderClass = 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20';
  } else if (isInProgress) {
    statusColorClass = 'bg-amber-500';
    checkboxBorderClass = 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/20';
  }

  // Get active category color
  const taskCat = categories?.find(c => c.name === task.category);
  const badgeColorClass = taskCat ? taskCat.color : 'bg-slate-700/60 border-slate-600/50';

  // Check if task is past its due date
  const isPastDue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  return (
    <div 
      className={`glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300 animate-fade-in ${
        isCompleted 
          ? 'border-emerald-500/10 bg-slate-900/10' 
          : isInProgress 
          ? 'border-amber-500/10 bg-amber-500/[0.01]' 
          : 'glass-card-hover'
      }`}
    >
      {/* Left-hand color indicator stripe */}
      <div 
        className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 ${statusColorClass}`}
      />

      {isEditing ? (
        /* EDITING MODE FORM */
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Editing Task</span>
            {validationError && (
              <span className="text-xs text-rose-400 font-semibold">{validationError}</span>
            )}
          </div>
          
          <input
            type="text"
            value={editTitle}
            onChange={(e) => {
              setEditTitle(e.target.value);
              if (e.target.value.trim()) setValidationError('');
            }}
            className="glass-input px-3 py-2 rounded-xl text-sm text-slate-200"
            placeholder="Task Title"
            maxLength={255}
            disabled={isActionLoading}
          />
          
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="glass-input px-3 py-2 rounded-xl text-xs text-slate-300 min-h-[60px]"
            placeholder="Task Description"
            maxLength={1000}
            disabled={isActionLoading}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="glass-input px-2.5 py-1.5 rounded-xl text-xs text-slate-300"
                disabled={isActionLoading}
              >
                <option value="">No Category</option>
                {categories && categories.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Due Date</label>
              <input
                type="datetime-local"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="glass-input px-2.5 py-1.5 rounded-xl text-xs text-slate-300"
                disabled={isActionLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleCancelEdit}
              disabled={isActionLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isActionLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-xs text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 transition-all duration-200"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      ) : showDeleteConfirm ? (
        /* DELETE CONFIRMATION OVERLAY */
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-3 animate-bounce">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-1">Delete Task?</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-[200px]">This action cannot be undone.</p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isActionLoading}
              className="px-4 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isActionLoading}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs text-white shadow-md shadow-rose-600/10 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        /* NORMAL CARD DISPLAY */
        <div className="flex flex-col h-full justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left section: checkbox + details */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              
              {/* Cycling Status Checkbox Trigger */}
              <button
                onClick={handleToggleStatus}
                disabled={isActionLoading}
                title={`Status: ${task.status}. Click to progress.`}
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-300 ${checkboxBorderClass}`}
              >
                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3] text-slate-950" />}
                {isInProgress && <Play className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />}
              </button>

              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 
                  className={`font-semibold text-sm leading-tight transition-all duration-300 break-words ${
                    isCompleted ? 'text-slate-500 line-through font-medium' : 'text-slate-100'
                  }`}
                >
                  {task.title}
                </h3>
                
                {/* Description */}
                {task.description && (
                  <p 
                    className={`mt-1.5 text-xs leading-relaxed break-words whitespace-pre-wrap ${
                      isCompleted ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {task.description}
                  </p>
                )}

                {/* Badges / Tags (Category & Due Date alerts) */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {/* Category Badge */}
                  {task.category && (
                    <span 
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border text-white tracking-wide ${badgeColorClass}`}
                    >
                      {task.category}
                    </span>
                  )}

                  {/* Due Date Indicator */}
                  {task.due_date && (
                    <span 
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isPastDue 
                          ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                      title={isPastDue ? 'Past Due Date!' : 'Task Due Date'}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{isPastDue ? 'Overdue: ' : 'Due: '}{formatDate(task.due_date)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right section: edit/delete actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                title="Edit Task"
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all duration-200"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete Task"
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card Footer: Creation timestamp */}
          <div className="pt-3 border-t border-white/[0.03] flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1" title="Created date">
              <Calendar className="w-3 h-3 text-slate-600" />
              <span>{formatDate(task.created_at)}</span>
            </div>
            
            <div className="flex items-center gap-1.5 capitalize font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${
                isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-indigo-400'
              }`} />
              <span className="text-[9px] text-slate-400 tracking-wider">
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
