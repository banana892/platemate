import React from 'react'
import EmptyState from './EmptyState.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'

export function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display right now.',
  onRowClick,
  className = '',
}) {
  if (isLoading) {
    return <LoadingSpinner center size="lg" label="Loading table data..." />
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className="my-4" />
  }

  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={col.key || idx} scope="col" className={`px-4 py-3.5 ${col.align === 'right' ? 'text-right' : ''} ${col.headerClassName || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors hover:bg-gray-50/60 dark:hover:bg-slate-800/50 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((col, colIdx) => (
                <td key={col.key || colIdx} className={`px-4 py-3.5 text-gray-700 dark:text-gray-200 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}>
                  {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
