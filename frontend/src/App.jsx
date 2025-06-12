import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './areas/common/DashboardLayout'
import AdminDashboard from './areas/content-admin/Dashboard'
import CreateTable from './areas/content-admin/CreateTable'
import TableManager from './areas/content-admin/TableManager'
import ActivityLogs from './areas/content-admin/SystemLogs'
import InsertRecordForm from './areas/common/InsertRecordForm'
import CollectionViewer from './areas/common/CollectionViewer'
import YourAPIs from './areas/content-admin/YourAPIs'
import EditData from './areas/content-admin/EditData'
import WelcomeLogin from './areas/common/login'
import SelectDb from './areas/common/SelectDb'
import ContentManagerDashboard from './areas/content-manager/Dashboard'
import AddDataToTable from './areas/content-manager/AddData-To-Table'

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
        <Route path="/login" element={<WelcomeLogin />} />
        <Route path="/select-db" element={<SelectDb />} />
        <Route
          path="/content-manager/dashboard"
          element={<ContentManagerDashboard />}
        />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/login" />} />

          <Route path="content-admin/dashboard" element={<AdminDashboard />} />
          <Route path="content-admin/create-table" element={<CreateTable />} />
          <Route
            path="content-admin/activity-logs"
            element={<ActivityLogs />}
          />
          <Route
            path="content-admin/insert-data"
            element={<InsertRecordForm />}
          />
          <Route
            path="content-admin/collection-view"
            element={<CollectionViewer />}
          />
          <Route path="content-admin/your-apis" element={<YourAPIs />} />
          <Route path="content-admin/update-data" element={<EditData />} />
          <Route path="content-manager/update-data" element={<EditData />} />
          <Route
            path="content-manager/dashboard"
            element={<ContentManagerDashboard />}
          />
          <Route
            path="content-manager/insert-data"
            element={<AddDataToTable />}
          />
          <Route
            path="content-manager/collection-view"
            element={<CollectionViewer />}
          />
          <Route path="content-manager/your-apis" element={<YourAPIs />} />
          <Route
            path="content-manager/activity-logs"
            element={<ActivityLogs />}
          />
          
          <Route
            path="content-admin/manage-tables"
            element={
              <TableManager
                tables={mockTables}
                onUpdate={(updatedTable) => {
                  console.log('Updated table:', updatedTable)
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
