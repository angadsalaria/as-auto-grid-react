import { GridProvider, useGrid } from '../context/GridContext'
import type { Row } from '../types'

interface AutoGridProps {
  data: Row[]
  title: string
}

function GridTable() {
  const { getTransformedData } = useGrid()
  const rows = getTransformedData()

  return (
    <tbody className="divide-y divide-gray-100">
      {rows.length === 0 ? (
        <tr>
          <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">
            No results match the current filters.
          </td>
        </tr>
      ) : (
        rows.map((row) => (
          <tr key={row.id} className="hover:bg-blue-50">
            <td className="px-4 py-3 text-sm text-gray-700">{row.id}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{row.fname}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{row.lname}</td>
          </tr>
        ))
      )}
    </tbody>
  )
}

export function AutoGrid({ data, title, children }: AutoGridProps & { children: React.ReactNode }) {
  return (
    <GridProvider data={data}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{children}</tr>
            </thead>
            <GridTable />
          </table>
        </div>
      </div>
    </GridProvider>
  )
}
