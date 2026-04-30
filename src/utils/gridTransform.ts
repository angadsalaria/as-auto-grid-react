import _ from 'lodash'
import type { Row, GridState, Sorting } from '../types'

export function getFilterOptions(data: Row[], column: keyof Row): string[] {
  return _.sortBy(_.uniq(_.map(data, column)), (v) => v) as string[]
}

function applyFilter(data: Row[], filters: GridState['filters']): Row[] {
  const activeFilters = _.omitBy(filters, (v) => v === '')
  return _.filter(data, activeFilters) as Row[]
}

function applySort(data: Row[], sorting: Sorting): Row[] {
  if (!sorting.path) return data
  return _.orderBy(data, [sorting.path], [sorting.isAscending ? 'asc' : 'desc'])
}

export function applyGridTransform(data: Row[], state: GridState): Row[] {
  return applySort(applyFilter(data, state.filters), state.sorting)
}

export function updateSorting(current: Sorting, column: keyof Row): Sorting {
  if (current.path !== column) {
    return { path: column, isAscending: true }
  }
  if (current.isAscending === true) {
    return { path: column, isAscending: false }
  }
  return { path: null, isAscending: null }
}
