import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

// Import newly created and updated components
import Sidebar from './components/Sidebar';
import TaskForm from './components/TaskForm';
import FilterButtons from './components/FilterButtons';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import CategoriesView from './components/CategoriesView';

// Fetch API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * App component serves as the root controller.
 * Manages Sidebar routing, task state, custom categories state, and error handling.
 * 
 * @component
 * @returns {React.ReactElement} The rendered main App component
 */
export default function App() {
  // Navigation Routing State
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Categories list persisted in localStorage
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('taskflow_categories');
    if (saved) return JSON.parse(saved);
    return [
      { name: 'Work', color: 'bg-indigo-500' },
      { name: 'Personal', color: 'bg-emerald-500' },
      { name: 'Urgent', color: 'bg-rose-500' },
      { name: 'Shopping', color: 'bg-pink-500' }
    ];
  });

  const handleAddCategory = (newCat) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem('taskflow_categories', JSON.stringify(updated));
  };

  const handleDeleteCategory = (name) => {
    const updated = categories.filter(c => c.name !== name);
    setCategories(updated);
    localStorage.setItem('taskflow_categories', JSON.stringify(updated));
  };

  /**
   * Fetches all tasks from the API.
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

  // Fetch tasks on initial mount
  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  /**
   * Sends a POST request to create a new task.
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

  // Filter tasks for the list dashboard view
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  // Render active page view
  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form creation */}
            <div className="lg:col-span-4 sticky top-6">
              <TaskForm 
                onTaskCreate={handleCreateTask} 
                isSubmitting={isSubmitting} 
                categories={categories}
              />
            </div>

            {/* Right Column: Listing */}
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
                  categories={categories}
                />
              )}
            </div>
          </div>
        );
      case 'board':
        return (
          <KanbanBoard 
            tasks={tasks} 
            onUpdateTask={handleUpdateTask} 
            onDeleteTask={handleDeleteTask} 
            categories={categories}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            tasks={tasks} 
            categories={categories} 
            onAddTask={handleCreateTask} 
          />
        );
      case 'analytics':
        return (
          <AnalyticsView 
            tasks={tasks} 
            categories={categories} 
          />
        );
      case 'categories':
        return (
          <CategoriesView 
            categories={categories} 
            tasks={tasks}
            onAddCategory={handleAddCategory} 
            onDeleteCategory={handleDeleteCategory} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
      
      {/* Sidebar Navigation Panel */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        totalTasks={totalTasks}
        completedTasks={completedTasks}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Error Notification Alert */}
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

        {/* Dynamic page contents loader */}
        <div className="flex-1">
          {renderActivePage()}
        </div>
      </div>
    </div>
  );
}
