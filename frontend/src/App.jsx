import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './areas/common/DashboardLayout'
import AdminDashboard from './areas/content-admin/Dashboard'
import CreateTable from './areas/content-admin/CreateTable'
import TableManager from './areas/content-admin/TableManager'
import ActivityLogs from './areas/content-admin/SystemLogs'
import InsertRecordForm from './areas/common/InsertRecordForm'
import CollectionViewer from './areas/common/CollectionViewer'
import YourAPIs from './areas/content-admin/YourAPIs'
// ✅ Mock table data for TableManager
const mockTables = [
  {
    name: 'Physics MCQs',
    fields: [
      { name: 'question', type: 'text' },
      { name: 'difficulty', type: 'number' },
    ],
  },
  {
    name: 'History Archive',
    fields: [
      { name: 'image', type: 'image' },
      { name: 'description', type: 'text' },
    ],
  },
]

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="create-table" element={<CreateTable  />} />
          <Route path="activity-logs" element={<ActivityLogs/>} />
          <Route path="insert-data" element={<InsertRecordForm/>}/>
          <Route path="collection-view" element={<CollectionViewer/>}/>
          <Route path="your-apis" element={<YourAPIs/>}/>
          <Route
            path="manage-tables"
            element={
              <TableManager
                tables={mockTables}
                onUpdate={(updatedTable) => {
                  console.log('Updated table:', updatedTable)
                  // Here you'd call your update API
                }}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
