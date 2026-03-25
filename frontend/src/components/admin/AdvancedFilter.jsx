import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa';

/**
 * Advanced filter panel for data filtering
 * @param {Array} filters - Filter configuration: { key, label, type: 'select'|'text'|'range'|'checkbox', options?, min?, max? }
 * @param {Object} values - Current filter values
 * @param {Function} onChange - Callback when filters change
 * @param {Function} onReset - Callback when filters reset
 */
export default function AdvancedFilter({ filters = [], values = {}, onChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = Object.values(values).filter((v) => v != null && v !== '' && v !== false).length;

  const handleChange = (key, value) => {
    onChange?.({ ...values, [key]: value });
  };

  const handleReset = () => {
    onReset?.();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
      >
        <FaFilter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-surface-dark">
          <div className="space-y-3 p-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-1.5">
                  {filter.label}
                </label>

                {filter.type === 'select' && (
                  <select
                    value={values[filter.key] || ''}
                    onChange={(e) => handleChange(filter.key, e.target.value || null)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="">All</option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'text' && (
                  <input
                    type="text"
                    value={values[filter.key] || ''}
                    onChange={(e) => handleChange(filter.key, e.target.value || null)}
                    placeholder="Enter text..."
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                )}

                {filter.type === 'checkbox' && (
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values[filter.key] || false}
                      onChange={(e) => handleChange(filter.key, e.target.checked ? true : null)}
                      className="rounded"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Active</span>
                  </label>
                )}

                {filter.type === 'range' && (
                  <div className="space-y-2">
                    <input
                      type="number"
                      min={filter.min}
                      max={filter.max}
                      value={values[filter.key]?.min || ''}
                      onChange={(e) =>
                        handleChange(filter.key, {
                          min: e.target.value ? parseInt(e.target.value) : null,
                          max: values[filter.key]?.max
                        })
                      }
                      placeholder="Min"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                    <input
                      type="number"
                      min={filter.min}
                      max={filter.max}
                      value={values[filter.key]?.max || ''}
                      onChange={(e) =>
                        handleChange(filter.key, {
                          min: values[filter.key]?.min,
                          max: e.target.value ? parseInt(e.target.value) : null
                        })
                      }
                      placeholder="Max"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="border-t border-neutral-200 pt-3 dark:border-neutral-700">
              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AdvancedFilter.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['select', 'text', 'range', 'checkbox']).isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired
        })
      ),
      min: PropTypes.number,
      max: PropTypes.number
    })
  ),
  values: PropTypes.object,
  onChange: PropTypes.func,
  onReset: PropTypes.func
};
