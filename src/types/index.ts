export interface Row {
  id: number
  fname: string
  lname: string
}

export interface Sorting {
  path: keyof Row | null
  isAscending: boolean | null
}

export interface GridState {
  filters: Partial<Record<keyof Row, string>>
  sorting: Sorting
}

export interface GridContextValue {
  data: Row[]
  state: GridState
  getFilterOptions: (column: keyof Row) => string[]
  getTransformedData: () => Row[]
  setSortColumn: (column: keyof Row) => void
  setFilter: (column: keyof Row, value: string) => void
  clearFilter: (column: keyof Row) => void
}
