import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';

/**
 * TaskForm component renders a form to create a new task.
 * 
 * @component
 * @param {Object} props
 * @param {function} props.onTaskCreate - Function that handles task submission, must return a promise
 * @param {boolean} props.isSubmitting - Disables the button and shows a loader if true
 * @returns {React.ReactElement} The rendered TaskForm component
 */
export default function TaskForm({ onTaskCreate, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    
    if (!cleanTitle) {
      setValidationError('Task title is required.');
      return;
    }
    
    setValidationError('');
    
    try {
      await onTaskCreate({
        title: cleanTitle,
        description: description.trim()
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      // Errors are caught and bubbled to App.jsx for general warning notifications
    }
  };

  return (
    <form 
      id="task-form"
      onSubmit={handleSubmit} 
      className="glass-card p-6 rounded-2xl flex flex-col gap-4 animate-fade-in shadow-xl"
    >
      <div>
        <h2 className="text-lg font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Create New Task
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Add a new item to your task dashboard.</p>
      </div>
      
      {validationError && (
        <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
          {validationError}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400">Task Title *</label>
        <input
          id="task-title-input"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setValidationError('');
          }}
          placeholder="e.g. Finish docker-compose config"
          className="glass-input px-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500"
          maxLength={255}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400">Description (Optional)</label>
        <textarea
          id="task-desc-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Map correct ports and add db dependencies..."
          className="glass-input px-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500 min-h-[80px] resize-y"
          maxLength={1000}
          disabled={isSubmitting}
        />
      </div>

      <button
        id="task-submit-btn"
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-md shadow-indigo-600/15"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Task...
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4" />
            Create Task
          </>
        )}
      </button>
    </form>
  );
}
