import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

/**
 * Enhanced DataTable component with sorting, filtering, and pagination
 * @param {Array} columns - Array of { key, label, render?, sortable?, width? }
 * @param {Array} data - Array of data objects
 * @param {number} itemsPerPage - Items per page (default: 10)
 * @param {Function} onRowClick - Callback when row is clicked
 * @param {Array} actions - Array of { label, onClick, icon?, variant? }
 * @param {string} emptyMessage - Message to show when no data
 */
export default function DataTable({
  columns = [],
  data = [],
  itemsPerPage = 10,
  onRowClick,
  actions = [],
  emptyMessage = 'No data found'
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Handle sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return sortConfig.direction === 'asc'
        ? aVal - bVal
        : bVal - aVal;
    });
    
    return sorted;
  }, [data, sortConfig]);

  // Handle pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="h-3 w-3 text-neutral-400" />;
    return sortConfig.direction === 'asc'
      ? <FaSortUp className="h-3 w-3 text-primary-600" />
      : <FaSortDown className="h-3 w-3 text-primary-600" />;
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 p-8 text-center dark:border-neutral-800">
        <p className="text-neutral-600 dark:text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop view */}
      <div className="hidden overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-semibold text-neutral-900 dark:text-white"
                  style={{ width: col.width }}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-2 rounded hover:bg-neutral-200 px-1 py-0.5 dark:hover:bg-neutral-800"
                    >
                      {col.label}
                      {getSortIcon(col.key)}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {actions.length > 0 && <th className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/30"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {actions.map((action, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            action.variant === 'danger'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="space-y-3 md:hidden">
        {paginatedData.map((row, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between py-1.5">
                <span className="font-medium text-neutral-600 dark:text-neutral-400">{col.label}</span>
                <span className="text-neutral-900 dark:text-white">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
            {actions.length > 0 && (
              <div className="mt-3 flex gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                {actions.map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => action.onClick(row)}
                    className="flex-1 text-xs px-2 py-1.5 rounded font-medium"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {currentPage} of {totalPages} ({sortedData.length} total)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-neutral-200 text-sm font-medium disabled:opacity-50 dark:border-neutral-700"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded border border-neutral-200 text-sm font-medium disabled:opacity-50 dark:border-neutral-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      sortable: PropTypes.bool,
      width: PropTypes.string
    })
  ),
  data: PropTypes.array,
  itemsPerPage: PropTypes.number,
  onRowClick: PropTypes.func,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.elementType,
      variant: PropTypes.string
    })
  ),
  emptyMessage: PropTypes.string
};
