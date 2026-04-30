import { AutoGrid } from './components/AutoGrid'
import { ColumnHeader } from './components/ColumnHeader'
import type { Row } from './types'

const gridData: Row[] = [
  { id: 1, fname: 'Angad', lname: 'Salaria' },
  { id: 2, fname: 'John', lname: 'Doe' },
  { id: 3, fname: 'Sam', lname: 'Adams' },
  { id: 4, fname: 'John', lname: 'Adams' },
  { id: 5, fname: 'Edward', lname: 'Miller' },
  { id: 6, fname: 'Lawrence', lname: 'Bross' },
]

function Grid({ title }: { title: string }) {
  return (
    <AutoGrid data={gridData} title={title}>
      <ColumnHeader column="id" sortEnabled>ID</ColumnHeader>
      <ColumnHeader column="fname" sortEnabled filterEnabled>First Name</ColumnHeader>
      <ColumnHeader column="lname" sortEnabled filterEnabled>Last Name</ColumnHeader>
    </AutoGrid>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Auto Grid</h1>
          <p className="mt-1 text-sm text-gray-500">Sortable and filterable data grids</p>
        </div>
        <Grid title="Grid 1" />
        <Grid title="Grid 2" />
      </div>
    </div>
  )
}
