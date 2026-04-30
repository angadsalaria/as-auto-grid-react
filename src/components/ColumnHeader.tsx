import { useState } from 'react'
import { useGrid } from '../context/GridContext'
import type { Row } from '../types'

interface ColumnHeaderProps {
  column: keyof Row
  sortEnabled?: boolean
  filterEnabled?: boolean
  children: React.ReactNode
}

export function ColumnHeader({ column, sortEnabled, filterEnabled, children }: ColumnHeaderProps) {
  const { state, setSortColumn, setFilter, clearFilter, getFilterOptions } = useGrid()
  const [filterValue, setFilterValue] = useState('')

  const { sorting } = state
  const isCurrentSortColumn = sorting.path === column
  const sortDirection = isCurrentSortColumn ? (sorting.isAscending ? 'asc' : 'desc') : null

  function handleSortClick() {
    if (sortEnabled) setSortColumn(column)
  }

  function handleFilterChange(value: string) {
    setFilterValue(value)
    setFilter(column, value)
  }

  function handleResetFilter() {
    setFilterValue('')
    clearFilter(column)
  }

  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      <div
        className={sortEnabled ? 'flex items-center gap-1 cursor-pointer select-none' : 'flex items-center gap-1'}
        onClick={handleSortClick}
      >
        <span>{children}</span>
        {sortEnabled && (
          <span className="text-gray-400" aria-label={sortDirection ? `sorted ${sortDirection}` : 'sortable'}>
            {sortDirection === 'asc' ? '↓' : sortDirection === 'desc' ? '↑' : '↕'}
          </span>
        )}
      </div>

      {filterEnabled && (
        <div className="flex items-center gap-1 mt-1">
          <select
            className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={filterValue}
            onChange={(e) => handleFilterChange(e.target.value)}
            aria-label={`Filter by ${String(column)}`}
          >
            <option value=""> </option>
            {getFilterOptions(column).map((opt) => (
              <option key={opt} value={String(opt)}>
                {opt}
              </option>
            ))}
          </select>
          {filterValue && (
            <button
              onClick={handleResetFilter}
              className="text-gray-400 hover:text-red-400 transition-colors"
              aria-label={`Clear ${String(column)} filter`}
              title="Clear filter"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </th>
  )
}
