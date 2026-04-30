import { createContext, useContext, useState, useCallback } from 'react'
import type { Row, GridState, GridContextValue } from '../types'
import { applyGridTransform, getFilterOptions, updateSorting } from '../utils/gridTransform'

const GridContext = createContext<GridContextValue | null>(null)

export function useGrid(): GridContextValue {
  const ctx = useContext(GridContext)
  if (!ctx) throw new Error('useGrid must be used inside AutoGrid')
  return ctx
}

const INITIAL_STATE: GridState = {
  filters: {},
  sorting: { path: null, isAscending: null },
}

interface GridProviderProps {
  data: Row[]
  children: React.ReactNode
}

export function GridProvider({ data, children }: GridProviderProps) {
  const [state, setState] = useState<GridState>(INITIAL_STATE)

  const setSortColumn = useCallback((column: keyof Row) => {
    setState((prev) => ({
      ...prev,
      sorting: updateSorting(prev.sorting, column),
    }))
  }, [])

  const setFilter = useCallback((column: keyof Row, value: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [column]: value },
    }))
  }, [])

  const clearFilter = useCallback((column: keyof Row) => {
    setState((prev) => {
      const filters = { ...prev.filters }
      delete filters[column]
      return { ...prev, filters }
    })
  }, [])

  const value: GridContextValue = {
    data,
    state,
    getFilterOptions: (column) => getFilterOptions(data, column),
    getTransformedData: () => applyGridTransform(data, state),
    setSortColumn,
    setFilter,
    clearFilter,
  }

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>
}
