import { Circle, Hourglass, CheckCircle2, ArrowRight } from 'lucide-react';
import TaskCard from './TaskCard';

/**
 * KanbanBoard component representing tasks divided into status lanes.
 * Implements native drag-and-drop to update statuses.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects
 * @param {function} props.onUpdateTask - Callback to update task details (specifically status)
 * @param {function} props.onDeleteTask - Callback to delete a task
 * @param {Array} props.categories - Array of active category objects { name: string, color: string }
 * @returns {React.ReactElement} The rendered KanbanBoard component
 */
export default function KanbanBoard({ tasks, onUpdateTask, onDeleteTask, categories }) {
  const lanes = [
    { id: 'pending', label: 'To Do', icon: Circle, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' },
    { id: 'in_progress', label: 'In Progress', icon: Hourglass, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' }
  ];

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, laneId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    
    // Find task
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== laneId) {
      try {
        await onUpdateTask(taskId, { status: laneId });
      } catch (err) {
        console.error("Failed to update status on drop:", err);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 h-full min-h-[500px]">
      {lanes.map((lane) => {
        const laneTasks = tasks.filter(t => t.status === lane.id);
        const Icon = lane.icon;

        return (
          <div
            key={lane.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, lane.id)}
            className="flex-1 flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/40 border border-white/[0.03] backdrop-blur-md"
          >
            {/* Lane Header */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${lane.color}`}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <Icon className="w-4 h-4" />
                <span>{lane.label}</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-950/80 font-bold border border-white/[0.04]">
                {laneTasks.length}
              </span>
            </div>

            {/* Lane Task Cards */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1 min-h-[150px] transition-all duration-300">
              {laneTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl p-6 text-slate-500 text-center select-none">
                  <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0 mb-2 opacity-30 text-indigo-400" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Drop tasks here</span>
                </div>
              ) : (
                laneTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-grab active:cursor-grabbing hover:scale-[1.01] transition-transform duration-200"
                  >
                    <TaskCard
                      task={task}
                      onUpdateTask={onUpdateTask}
                      onDeleteTask={onDeleteTask}
                      categories={categories}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
