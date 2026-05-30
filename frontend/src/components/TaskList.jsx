import React from 'react';
import { ClipboardList } from 'lucide-react';
import TaskCard from './TaskCard';

/**
 * TaskList component renders a grid of TaskCards or a fallback empty state.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.tasks - List of task objects to display
 * @param {function} props.onUpdateTask - Callback handler passed down to TaskCard for task updates
 * @param {function} props.onDeleteTask - Callback handler passed down to TaskCard for task deletion
 * @returns {React.ReactElement} The rendered TaskList component
 */
export default function TaskList({ tasks, onUpdateTask, onDeleteTask }) {
  if (tasks.length === 0) {
    return (
      <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center border-dashed border-white/5 animate-fade-in shadow-lg">
        <div className="p-4 rounded-full bg-slate-900 border border-white/[0.04] text-slate-500 mb-4">
          <ClipboardList className="w-8 h-8 text-indigo-400/80 animate-pulse-subtle" />
        </div>
        <h3 className="text-base font-bold text-slate-300">No tasks found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
          There are no tasks matching your selected filter. Start by creating a task or checking other tabs!
        </p>
      </div>
    );
  }

  return (
    <div 
      id="task-list-grid"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in"
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}
