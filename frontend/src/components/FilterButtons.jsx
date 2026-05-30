// import React from 'react';

/**
 * FilterButtons component that provides tabs to filter tasks by status.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.currentFilter - The currently selected filter ('all', 'pending', 'completed')
 * @param {function} props.onFilterChange - Function called when a filter button is clicked
 * @returns {React.ReactElement} The rendered FilterButtons component
 */
export default function FilterButtons({ currentFilter, onFilterChange }) {
  const filters = [
    { label: 'All Tasks', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' }
  ];

  return (
    <div className="flex p-1 rounded-xl bg-slate-950/80 border border-white/[0.04] backdrop-blur-sm self-start">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.value;
        return (
          <button
            key={filter.value}
            id={`filter-btn-${filter.value}`}
            onClick={() => onFilterChange(filter.value)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
