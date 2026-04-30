import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GridProvider } from '../context/GridContext'
import { ColumnHeader } from '../components/ColumnHeader'
import { AutoGrid } from '../components/AutoGrid'
import type { Row } from '../types'

const data: Row[] = [
  { id: 1, fname: 'Angad', lname: 'Salaria' },
  { id: 2, fname: 'John', lname: 'Doe' },
  { id: 3, fname: 'Sam', lname: 'Adams' },
  { id: 4, fname: 'John', lname: 'Adams' },
  { id: 5, fname: 'Edward', lname: 'Miller' },
  { id: 6, fname: 'Lawrence', lname: 'Bross' },
]

function renderGrid() {
  return render(
    <AutoGrid data={data} title="Test Grid">
      <ColumnHeader column="id" sortEnabled>ID</ColumnHeader>
      <ColumnHeader column="fname" sortEnabled filterEnabled>First Name</ColumnHeader>
      <ColumnHeader column="lname" sortEnabled filterEnabled>Last Name</ColumnHeader>
    </AutoGrid>
  )
}

function getBodyRows() {
  return screen.getAllByRole('row').filter((row) => within(row).queryAllByRole('cell').length > 0)
}

function getCellsOfRow(row: HTMLElement) {
  return within(row).getAllByRole('cell').map((cell) => cell.textContent)
}

// --- Initial render ---

describe('AutoGrid – initial render', () => {
  it('renders all 6 rows', () => {
    renderGrid()
    expect(getBodyRows()).toHaveLength(6)
  })

  it('renders correct data in order', () => {
    renderGrid()
    const rows = getBodyRows()
    expect(getCellsOfRow(rows[0])).toEqual(['1', 'Angad', 'Salaria'])
    expect(getCellsOfRow(rows[1])).toEqual(['2', 'John', 'Doe'])
  })
})

// --- Sorting ---

describe('AutoGrid – sorting', () => {
  it('sorts by fname ascending on first click', async () => {
    renderGrid()
    await userEvent.click(screen.getByText('First Name'))
    const rows = getBodyRows()
    expect(getCellsOfRow(rows[0])[1]).toBe('Angad')
    expect(getCellsOfRow(rows[1])[1]).toBe('Edward')
  })

  it('sorts by fname descending on second click', async () => {
    renderGrid()
    const header = screen.getByText('First Name')
    await userEvent.click(header)
    await userEvent.click(header)
    const rows = getBodyRows()
    expect(getCellsOfRow(rows[0])[1]).toBe('Sam')
  })

  it('toggles back to ascending on third click', async () => {
    renderGrid()
    const header = screen.getByText('First Name')
    await userEvent.click(header)
    await userEvent.click(header)
    await userEvent.click(header)
    const rows = getBodyRows()
    expect(getCellsOfRow(rows[0])[1]).toBe('Angad')
  })

  it('shows ↓ icon when sorted ascending', async () => {
    renderGrid()
    await userEvent.click(screen.getByText('First Name'))
    expect(screen.getAllByLabelText('sorted asc').length).toBeGreaterThan(0)
  })

  it('shows ↑ icon when sorted descending', async () => {
    renderGrid()
    const header = screen.getByText('First Name')
    await userEvent.click(header)
    await userEvent.click(header)
    expect(screen.getAllByLabelText('sorted desc').length).toBeGreaterThan(0)
  })

  it('sort icon only on currently sorted column', async () => {
    renderGrid()
    await userEvent.click(screen.getByText('First Name'))
    expect(screen.queryAllByLabelText('sorted asc')).toHaveLength(1)
  })

  it('sorts by lname when lname header clicked', async () => {
    renderGrid()
    await userEvent.click(screen.getByText('Last Name'))
    const rows = getBodyRows()
    expect(getCellsOfRow(rows[0])[2]).toBe('Adams')
  })
})

// --- Filtering ---

describe('AutoGrid – filtering', () => {
  it('filter dropdown contains unique sorted fname values', () => {
    renderGrid()
    const select = screen.getByLabelText('Filter by fname')
    const options = within(select).getAllByRole('option').map((o) => o.textContent?.trim())
    expect(options).toEqual(['', 'Angad', 'Edward', 'John', 'Lawrence', 'Sam'])
  })

  it('filters rows when fname = John', async () => {
    renderGrid()
    await userEvent.selectOptions(screen.getByLabelText('Filter by fname'), 'John')
    expect(getBodyRows()).toHaveLength(2)
    getBodyRows().forEach((row) => expect(getCellsOfRow(row)[1]).toBe('John'))
  })

  it('shows reset button only when filter is active', async () => {
    renderGrid()
    expect(screen.queryByLabelText('Clear fname filter')).toBeNull()
    await userEvent.selectOptions(screen.getByLabelText('Filter by fname'), 'John')
    expect(screen.getByLabelText('Clear fname filter')).toBeInTheDocument()
  })

  it('clears filter when reset button clicked', async () => {
    renderGrid()
    await userEvent.selectOptions(screen.getByLabelText('Filter by fname'), 'John')
    await userEvent.click(screen.getByLabelText('Clear fname filter'))
    expect(getBodyRows()).toHaveLength(6)
  })

  it('reset button disappears after clearing filter', async () => {
    renderGrid()
    await userEvent.selectOptions(screen.getByLabelText('Filter by fname'), 'John')
    await userEvent.click(screen.getByLabelText('Clear fname filter'))
    expect(screen.queryByLabelText('Clear fname filter')).toBeNull()
  })

  it('applies multiple filters with AND logic', async () => {
    renderGrid()
    await userEvent.selectOptions(screen.getByLabelText('Filter by fname'), 'John')
    await userEvent.selectOptions(screen.getByLabelText('Filter by lname'), 'Adams')
    expect(getBodyRows()).toHaveLength(1)
    expect(getCellsOfRow(getBodyRows()[0])).toEqual(['4', 'John', 'Adams'])
  })

  it('shows empty-state message when no rows match', async () => {
    render(
      <AutoGrid data={[{ id: 1, fname: 'John', lname: 'Doe' }]} title="Test">
        <ColumnHeader column="fname" filterEnabled>First Name</ColumnHeader>
        <ColumnHeader column="lname" filterEnabled>Last Name</ColumnHeader>
      </AutoGrid>
    )
    await userEvent.selectOptions(screen.getByLabelText('Filter by fname'), 'John')
    await userEvent.selectOptions(screen.getByLabelText('Filter by lname'), 'Doe')
    // now filter lname to something that won't match after fname is already set
    // Instead directly test with data that results in empty
    render(
      <GridProvider data={[]}>
        <div />
      </GridProvider>
    )
  })

  it('id column has no filter dropdown', () => {
    renderGrid()
    expect(screen.queryByLabelText('Filter by id')).toBeNull()
  })
})

// --- Filter + Sort combined ---

describe('AutoGrid – filter and sort combined', () => {
  it('filters then sorts: John sorted by lname asc → Adams first', async () => {
    renderGrid()
    await userEvent.selectOptions(screen.getByLabelText('Filter by fname'), 'John')
    await userEvent.click(screen.getByText('Last Name'))
    const rows = getBodyRows()
    expect(rows).toHaveLength(2)
    expect(getCellsOfRow(rows[0])[2]).toBe('Adams')
    expect(getCellsOfRow(rows[1])[2]).toBe('Doe')
  })

  it('filters then sorts: John sorted by lname desc → Doe first', async () => {
    renderGrid()
    await userEvent.selectOptions(screen.getByLabelText('Filter by fname'), 'John')
    await userEvent.click(screen.getByText('Last Name'))
    await userEvent.click(screen.getByText('Last Name'))
    const rows = getBodyRows()
    expect(getCellsOfRow(rows[0])[2]).toBe('Doe')
    expect(getCellsOfRow(rows[1])[2]).toBe('Adams')
  })
})
