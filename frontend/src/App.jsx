import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import TaskForm from './components/TaskForm';
import FilterButtons from './components/FilterButtons';
import TaskList from './components/TaskList';

// Fetch API base URL from Vite environment variables.
// Fallback to relative path '/api/v1' if running under proxy or unset.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * App component that serves as the root container of the Task Management System.
 * Coordinates tasks list state, filter, loading indicators, error display, and API calls.
 * 
 * @component
 * @returns {React.ReactElement} The rendered main App component
 */
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Fetches all tasks from the API.
   * Runs on load or after mutation operations.
   */
  const fetchTasks = useCallback(async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    setError('');
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Could not fetch tasks. Please verify that the backend is running and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tasks on initial render
  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  /**
   * Sends a POST request to create a new task.
   * Auto-refreshes the task list after successful creation.
   * 
   * @param {Object} taskData - The new task data
   * @param {string} taskData.title - Task title
   * @param {string} [taskData.description] - Task description
   * @returns {Promise<void>} Resolves when the task is created and the list is updated
   */
  const handleCreateTask = async (taskData) => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/tasks', taskData);
      await fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      const msg = err.response?.data?.detail?.[0]?.msg || 'Failed to create task. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Sends a PUT request to update a task's fields.
   * Auto-refreshes the task list on success.
   * 
   * @param {string} id - Task UUID
   * @param {Object} updatedFields - Fields to update
   * @returns {Promise<void>} Resolves when the task is updated and the list is refreshed
   */
  const handleUpdateTask = async (id, updatedFields) => {
    setError('');
    try {
      await api.put(`/tasks/${id}`, updatedFields);
      await fetchTasks();
    } catch (err) {
      console.error(`Error updating task ${id}:`, err);
      setError('Failed to update task. Please check server status.');
      throw err;
    }
  };

  /**
   * Sends a DELETE request to delete a task by ID.
   * Auto-refreshes the task list on success.
   * 
   * @param {string} id - Task UUID
   * @returns {Promise<void>} Resolves when the task is deleted and the list is refreshed
   */
  const handleDeleteTask = async (id) => {
    setError('');
    try {
      await api.delete(`/tasks/${id}`);
      await fetchTasks();
    } catch (err) {
      console.error(`Error deleting task ${id}:`, err);
      setError('Failed to delete task. Please try again.');
      throw err;
    }
  };

  // Filter tasks based on selected status
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  // Stats calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen pb-16">
      {/* Navbar with stats */}
      <Navbar 
        totalCount={totalCount} 
        completedCount={completedCount} 
        pendingCount={pendingCount} 
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-6">
        {/* Error Notification banner */}
        {error && (
          <div className="glass-card border-rose-500/20 bg-rose-500/5 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fade-in shadow-lg">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium leading-normal">{error}</p>
            </div>
            <button
              onClick={() => fetchTasks(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Dashboard layout: responsive columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form creation (takes 4 cols on lg) */}
          <div className="lg:col-span-4 sticky top-28">
            <TaskForm 
              onTaskCreate={handleCreateTask} 
              isSubmitting={isSubmitting} 
            />
          </div>

          {/* Right Column: Listing & Controls (takes 8 cols on lg) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <FilterButtons 
                currentFilter={filter} 
                onFilterChange={setFilter} 
              />
              <button
                onClick={() => fetchTasks(false)}
                title="Refresh tasks"
                className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.04] text-slate-400 hover:text-indigo-400 transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>

            {/* List area with loading overlay */}
            {loading && tasks.length === 0 ? (
              <div className="glass-card p-24 rounded-2xl flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <span className="text-xs font-medium text-slate-400">Syncing workspace...</span>
              </div>
            ) : (
              <TaskList
                tasks={filteredTasks}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
