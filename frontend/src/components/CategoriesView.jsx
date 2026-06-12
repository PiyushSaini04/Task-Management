import { useState } from 'react';
import { Tag, Plus, Trash2, ShieldAlert, Check } from 'lucide-react';

/**
 * CategoriesView component allows creating and managing task categories/tags.
 * Includes color presets selection and in-use task warnings.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.categories - Array of active category objects { name: string, color: string }
 * @param {Array} props.tasks - Array of tasks to check references
 * @param {function} props.onAddCategory - Callback to register a new category
 * @param {function} props.onDeleteCategory - Callback to remove a category
 * @returns {React.ReactElement} The rendered CategoriesView component
 */
export default function CategoriesView({ categories, tasks, onAddCategory, onDeleteCategory }) {
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-indigo-500');
  const [error, setError] = useState('');

  const colorPresets = [
    { class: 'bg-indigo-500', name: 'Indigo' },
    { class: 'bg-purple-500', name: 'Purple' },
    { class: 'bg-pink-500', name: 'Pink' },
    { class: 'bg-rose-500', name: 'Rose' },
    { class: 'bg-amber-500', name: 'Amber' },
    { class: 'bg-emerald-500', name: 'Emerald' },
    { class: 'bg-cyan-500', name: 'Cyan' },
    { class: 'bg-blue-500', name: 'Blue' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) {
      setError('Category name is required.');
      return;
    }
    if (cleanName.length > 50) {
      setError('Category name must be 50 characters or less.');
      return;
    }
    // Check duplicates
    if (categories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      setError('A category with this name already exists.');
      return;
    }

    setError('');
    onAddCategory({ name: cleanName, color: selectedColor });
    setNewCatName('');
  };

  const handleDeleteClick = (name) => {
    const isReferenced = tasks.some(t => t.category === name);
    if (isReferenced) {
      const confirmDelete = window.confirm(
        `Category "${name}" is currently assigned to some tasks. Deleting it will leave those tasks uncategorized. Proceed?`
      );
      if (!confirmDelete) return;
    }
    onDeleteCategory(name);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
      {/* Category Creation Form */}
      <div className="glass-card p-6 rounded-2xl lg:col-span-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Create Category</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Define a label and custom color code.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Category Name *</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              placeholder="e.g. Design, Sprint-2, Dev"
              className="glass-input px-3.5 py-2.5 rounded-xl text-sm text-slate-200 placeholder:text-slate-600"
              maxLength={50}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400">Select Badge Color</label>
            <div className="grid grid-cols-4 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.class}
                  type="button"
                  onClick={() => setSelectedColor(preset.class)}
                  title={preset.name}
                  className={`h-9 rounded-xl flex items-center justify-center transition-all ${preset.class} ${
                    selectedColor === preset.class 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-95' 
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {selectedColor === preset.class && <Check className="w-4 h-4 text-white font-bold" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </form>
      </div>

      {/* Categories Listing */}
      <div className="glass-card p-6 rounded-2xl lg:col-span-7 flex flex-col gap-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 border-b border-white/[0.04] pb-3">
          Manage Existing Categories
        </h3>

        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
          {categories.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-6">
              No custom categories created yet.
            </div>
          ) : (
            categories.map((cat) => {
              const activeCount = tasks.filter(t => t.category === cat.name).length;
              
              return (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/[0.02] hover:border-white/[0.04] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${cat.color} flex-shrink-0`} />
                    <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      ({activeCount} {activeCount === 1 ? 'task' : 'tasks'} linked)
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteClick(cat.name)}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-2 flex items-start gap-2.5 p-3.5 bg-indigo-600/5 border border-indigo-500/10 rounded-xl">
          <ShieldAlert className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-normal">
            Deleting a category does not delete its linked tasks. They will automatically fall back to an &quot;Uncategorized&quot; state.
          </p>
        </div>
      </div>
    </div>
  );
}
