import { describe, it, expect } from 'vitest'
import { applyGridTransform, getFilterOptions, updateSorting } from '../utils/gridTransform'
import type { Row, GridState } from '../types'

const data: Row[] = [
  { id: 1, fname: 'Angad', lname: 'Salaria' },
  { id: 2, fname: 'John', lname: 'Doe' },
  { id: 3, fname: 'Sam', lname: 'Adams' },
  { id: 4, fname: 'John', lname: 'Adams' },
  { id: 5, fname: 'Edward', lname: 'Miller' },
  { id: 6, fname: 'Lawrence', lname: 'Bross' },
]

const noOp: GridState = {
  filters: {},
  sorting: { path: null, isAscending: null },
}

// --- getFilterOptions ---

describe('getFilterOptions', () => {
  it('returns unique sorted values for a column', () => {
    expect(getFilterOptions(data, 'fname')).toEqual(['Angad', 'Edward', 'John', 'Lawrence', 'Sam'])
  })

  it('deduplicates values', () => {
    const options = getFilterOptions(data, 'fname')
    expect(options.filter((v) => v === 'John').length).toBe(1)
  })

  it('sorts numeric columns correctly', () => {
    expect(getFilterOptions(data, 'id')).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('returns values for lname column', () => {
    expect(getFilterOptions(data, 'lname')).toEqual(['Adams', 'Bross', 'Doe', 'Miller', 'Salaria'])
  })
})

// --- applyGridTransform: filtering ---

describe('applyGridTransform – filtering', () => {
  it('returns all rows when no filters set', () => {
    expect(applyGridTransform(data, noOp)).toHaveLength(6)
  })

  it('filters by a single fname value', () => {
    const state: GridState = { ...noOp, filters: { fname: 'John' } }
    const result = applyGridTransform(data, state)
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.fname === 'John')).toBe(true)
  })

  it('filters by lname', () => {
    const state: GridState = { ...noOp, filters: { lname: 'Adams' } }
    const result = applyGridTransform(data, state)
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.lname === 'Adams')).toBe(true)
  })

  it('applies multiple filters (AND logic)', () => {
    const state: GridState = { ...noOp, filters: { fname: 'John', lname: 'Adams' } }
    const result = applyGridTransform(data, state)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: 4, fname: 'John', lname: 'Adams' })
  })

  it('returns empty array when no rows match', () => {
    const state: GridState = { ...noOp, filters: { fname: 'Nobody' } }
    expect(applyGridTransform(data, state)).toHaveLength(0)
  })

  it('ignores filters with empty string value', () => {
    const state: GridState = { ...noOp, filters: { fname: '' } }
    expect(applyGridTransform(data, state)).toHaveLength(6)
  })
})

// --- applyGridTransform: sorting ---

describe('applyGridTransform – sorting', () => {
  it('returns data in original order when path is null', () => {
    const result = applyGridTransform(data, noOp)
    expect(result.map((r) => r.id)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('sorts by fname ascending', () => {
    const state: GridState = { ...noOp, sorting: { path: 'fname', isAscending: true } }
    const result = applyGridTransform(data, state)
    expect(result.map((r) => r.fname)).toEqual(['Angad', 'Edward', 'John', 'John', 'Lawrence', 'Sam'])
  })

  it('sorts by fname descending', () => {
    const state: GridState = { ...noOp, sorting: { path: 'fname', isAscending: false } }
    const result = applyGridTransform(data, state)
    expect(result.map((r) => r.fname)).toEqual(['Sam', 'Lawrence', 'John', 'John', 'Edward', 'Angad'])
  })

  it('sorts by id ascending', () => {
    const state: GridState = { ...noOp, sorting: { path: 'id', isAscending: true } }
    const result = applyGridTransform(data, state)
    expect(result.map((r) => r.id)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('sorts by id descending', () => {
    const state: GridState = { ...noOp, sorting: { path: 'id', isAscending: false } }
    const result = applyGridTransform(data, state)
    expect(result.map((r) => r.id)).toEqual([6, 5, 4, 3, 2, 1])
  })
})

// --- applyGridTransform: filter + sort combined ---

describe('applyGridTransform – filter + sort combined', () => {
  it('filters then sorts (John sorted by lname asc → Adams before Doe)', () => {
    const state: GridState = {
      filters: { fname: 'John' },
      sorting: { path: 'lname', isAscending: true },
    }
    const result = applyGridTransform(data, state)
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.lname)).toEqual(['Adams', 'Doe'])
  })

  it('filters then sorts descending', () => {
    const state: GridState = {
      filters: { fname: 'John' },
      sorting: { path: 'lname', isAscending: false },
    }
    const result = applyGridTransform(data, state)
    expect(result.map((r) => r.lname)).toEqual(['Doe', 'Adams'])
  })
})

// --- updateSorting ---

describe('updateSorting', () => {
  it('first click on any column sets ascending (toggles null → true)', () => {
    const result = updateSorting({ path: null, isAscending: null }, 'fname')
    expect(result).toEqual({ path: 'fname', isAscending: true })
  })

  it('second click on same column sets descending', () => {
    const result = updateSorting({ path: 'fname', isAscending: true }, 'fname')
    expect(result).toEqual({ path: 'fname', isAscending: false })
  })

  it('third click on same column sets ascending again', () => {
    const result = updateSorting({ path: 'fname', isAscending: false }, 'fname')
    expect(result).toEqual({ path: 'fname', isAscending: true })
  })

  it('clicking a different column toggles direction and switches path', () => {
    const result = updateSorting({ path: 'fname', isAscending: true }, 'lname')
    expect(result).toEqual({ path: 'lname', isAscending: false })
  })
})
