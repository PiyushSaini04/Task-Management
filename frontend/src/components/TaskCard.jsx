import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, Calendar, Clock, AlertTriangle } from 'lucide-react';

/**
 * TaskCard component represents a single task item.
 * Supports inline editing of title and description, status toggles, and deletion with confirmation.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.task - The task object
 * @param {string} props.task.id - UUID of the task
 * @param {string} props.task.title - Title of the task
 * @param {string} props.task.description - Description of the task
 * @param {string} props.task.status - 'pending' or 'completed'
 * @param {string} props.task.created_at - ISO timestamp of task creation
 * @param {string} props.task.updated_at - ISO timestamp of last update
 * @param {function} props.onUpdateTask - Function called to update the task, accepts id and update fields
 * @param {function} props.onDeleteTask - Function called to delete the task, accepts id
 * @returns {React.ReactElement} The rendered TaskCard component
 */
export default function TaskCard({ task, onUpdateTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
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
    const nextStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await onUpdateTask(task.id, { status: nextStatus });
    } catch {
      // Error handled by parent App.jsx notification
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
        description: editDescription.trim() || null
      });
      setIsEditing(false);
    } catch {
      // Restore previous state if API failed
      setEditTitle(task.title);
      setEditDescription(task.description || '');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
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

  const isCompleted = task.status === 'completed';

  return (
    <div 
      className={`glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300 animate-fade-in ${
        isCompleted ? 'border-emerald-500/10 bg-slate-900/20' : 'glass-card-hover'
      }`}
    >
      {/* Visual Indicator of Completion */}
      <div 
        className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 ${
          isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
        }`}
      />

      {isEditing ? (
        /* Edit Mode View */
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
            placeholder="Task Description (Optional)"
            maxLength={1000}
            disabled={isActionLoading}
          />

          <div className="flex justify-end gap-2 mt-1">
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
        /* Delete Confirmation Dialog */
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
              No, keep it
            </button>
            <button
              onClick={handleDelete}
              disabled={isActionLoading}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs text-white shadow-md shadow-rose-600/10 transition-all"
            >
              Yes, delete
            </button>
          </div>
        </div>
      ) : (
        /* Normal Display View */
        <div className="flex flex-col h-full justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            {/* Status Checkbox & Title/Desc */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                onClick={handleToggleStatus}
                disabled={isActionLoading}
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                    : 'border-slate-700 hover:border-indigo-500 bg-slate-950/40 text-transparent'
                }`}
              >
                <Check className={`w-3.5 h-3.5 stroke-[3] ${isCompleted ? 'block' : 'hidden'}`} />
              </button>

              <div className="flex-1 min-w-0">
                <h3 
                  className={`font-semibold text-sm leading-tight transition-all duration-300 break-words ${
                    isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p 
                    className={`mt-1.5 text-xs leading-relaxed break-words whitespace-pre-wrap ${
                      isCompleted ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
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

          {/* Timestamps */}
          <div className="pt-3 border-t border-white/[0.03] flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1" title="Created date">
              <Calendar className="w-3 h-3 text-slate-600" />
              <span>{formatDate(task.created_at)}</span>
            </div>
            
            {task.updated_at !== task.created_at && (
              <div className="flex items-center gap-1" title="Last updated">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>Updated</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
