import React from 'react';

/**
 * PaginationControls - Reusable pagination UI component
 * 
 * @param {object} pagination - Pagination state from usePagination hook
 * @param {number} pagination.pageNumber - Current page number (0-indexed)
 * @param {number} pagination.totalPages - Total number of pages
 * @param {number} pagination.pageSize - Current page size
 * @param {boolean} pagination.isFirst - Is current page first page
 * @param {boolean} pagination.isLast - Is current page last page
 * @param {boolean} pagination.hasNext - Has next page
 * @param {boolean} pagination.hasPrevious - Has previous page
 * @param {number} pagination.totalElements - Total number of elements
 * @param {function} pagination.goToPage - Navigate to specific page
 * @param {function} pagination.nextPage - Navigate to next page
 * @param {function} pagination.prevPage - Navigate to previous page
 * @param {function} pagination.goToFirst - Navigate to first page
 * @param {function} pagination.goToLast - Navigate to last page
 * @param {function} pagination.changePageSize - Change page size
 * @param {array} pageSizeOptions - Array of page size options (default: [10, 20, 50, 100])
 * @param {boolean} showPageSizeSelector - Show page size dropdown (default: true)
 * @param {string} className - Additional CSS classes
 */
export default function PaginationControls({
  pagination,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  className = '',
}) {
  const {
    pageNumber,
    totalPages,
    pageSize,
    totalElements,
    isFirst,
    isLast,
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    changePageSize,
  } = pagination;

  // Generate page numbers to display (e.g., [1, 2, 3, ..., 10])
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const halfWindow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(0, pageNumber - halfWindow);
    let endPage = Math.min(totalPages - 1, pageNumber + halfWindow);

    // Adjust if at start or end
    if (endPage - startPage < maxPagesToShow - 1) {
      if (startPage === 0) {
        endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }
    }

    if (startPage > 0) {
      pages.push(0);
      if (startPage > 1) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) pages.push('...');
      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className={`pagination-controls ${className}`}>
      <div className="pagination-info">
        <span>
          Page <strong>{pageNumber + 1}</strong> of <strong>{totalPages}</strong>
          {totalElements > 0 && (
            <>
              {' '}
              | Total: <strong>{totalElements}</strong> items
            </>
          )}
        </span>
      </div>

      <div className="pagination-buttons">
        {/* First Button */}
        <button
          onClick={goToFirst}
          disabled={isFirst}
          className="btn btn-sm btn-outline-primary"
          title="First page"
        >
          ⟨⟨
        </button>

        {/* Previous Button */}
        <button
          onClick={prevPage}
          disabled={isFirst}
          className="btn btn-sm btn-outline-primary"
          title="Previous page"
        >
          ⟨
        </button>

        {/* Page Numbers */}
        <div className="page-numbers">
          {getPageNumbers().map((page, idx) => (
            <React.Fragment key={idx}>
              {page === '...' ? (
                <span className="page-ellipsis">...</span>
              ) : (
                <button
                  onClick={() => goToPage(page)}
                  className={`btn btn-sm ${
                    page === pageNumber
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  }`}
                  disabled={page === pageNumber}
                >
                  {page + 1}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextPage}
          disabled={isLast}
          className="btn btn-sm btn-outline-primary"
          title="Next page"
        >
          ⟩
        </button>

        {/* Last Button */}
        <button
          onClick={goToLast}
          disabled={isLast}
          className="btn btn-sm btn-outline-primary"
          title="Last page"
        >
          ⟩⟩
        </button>
      </div>

      {showPageSizeSelector && pageSizeOptions.length > 0 && (
        <div className="page-size-selector">
          <label htmlFor="pageSize">Items per page: </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => changePageSize(Number(e.target.value))}
            className="form-select form-select-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <style>{`
        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .pagination-info {
          flex: 0 0 auto;
          font-size: 0.95rem;
          color: #666;
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          justify-content: center;
          flex-wrap: wrap;
        }

        .page-numbers {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .page-ellipsis {
          padding: 0 0.5rem;
          color: #999;
        }

        .pagination-controls .btn {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 0 0 auto;
        }

        .page-size-selector select {
          width: auto;
          padding: 0.375rem 0.75rem;
        }

        @media (max-width: 768px) {
          .pagination-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .pagination-buttons {
            justify-content: center;
            order: 2;
          }

          .pagination-info {
            text-align: center;
            order: 1;
          }

          .page-size-selector {
            justify-content: center;
            order: 3;
          }
        }
      `}</style>
    </div>
  );
}
