import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

function getGridRows(gridTitle: string) {
  const heading = screen.getByText(gridTitle)
  const gridEl = heading.closest('div.bg-white') as HTMLElement
  return within(gridEl)
    .getAllByRole('row')
    .filter((row) => within(row).queryAllByRole('cell').length > 0)
}

function getCellText(row: HTMLElement, colIndex: number) {
  return within(row).getAllByRole('cell')[colIndex].textContent
}

describe('App – two independent grids', () => {
  it('renders Grid 1 and Grid 2 with all 6 rows each', () => {
    render(<App />)
    expect(getGridRows('Grid 1')).toHaveLength(6)
    expect(getGridRows('Grid 2')).toHaveLength(6)
  })

  it('sorting Grid 1 does not affect Grid 2', async () => {
    render(<App />)
    const [grid1FnameHeader] = screen.getAllByText('First Name')
    await userEvent.click(grid1FnameHeader)

    const grid1Rows = getGridRows('Grid 1')
    const grid2Rows = getGridRows('Grid 2')

    expect(getCellText(grid1Rows[0], 1)).toBe('Angad')
    expect(getCellText(grid2Rows[0], 1)).toBe('Angad')
    expect(getCellText(grid2Rows[1], 1)).toBe('John')
  })

  it('filtering Grid 1 does not affect Grid 2', async () => {
    render(<App />)
    const [grid1FnameFilter] = screen.getAllByLabelText('Filter by fname')
    await userEvent.selectOptions(grid1FnameFilter, 'John')

    expect(getGridRows('Grid 1')).toHaveLength(2)
    expect(getGridRows('Grid 2')).toHaveLength(6)
  })

  it('filtering Grid 2 does not affect Grid 1', async () => {
    render(<App />)
    const fnameFilters = screen.getAllByLabelText('Filter by fname')
    await userEvent.selectOptions(fnameFilters[1], 'Sam')

    expect(getGridRows('Grid 1')).toHaveLength(6)
    expect(getGridRows('Grid 2')).toHaveLength(1)
  })
})
