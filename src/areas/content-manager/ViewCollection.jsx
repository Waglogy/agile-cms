import { useEffect, useState } from 'react'
import axios from 'axios'
import { getAllCollections } from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'
import { Eye } from 'lucide-react'
import TableDetailView from '../common/TableDetailView'

const EXCLUDED_TABLES = [
    'content_versions',
    'logs',
    'roles',
    'settings',
    'user_roles',
    'users',
]

/**
 * Renders one collection's data: search + paginated table + CSV export.
 */
const CollectionTable = ({ name, records, onViewDetails, isContentManager }) => {
    const { showAppMessage } = useNotification()
    const [isLoading, setIsLoading] = useState(false)
    const ITEMS_PER_PAGE = 5
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Show simple guide for content managers
    const renderGuide = () => (
        <div className="bg-blue-50 text-blue-800 p-3 rounded mb-4">
            <p className="text-sm">Tip: Use the search box to filter records. Click the eye icon to view details, and use buttons to manage status.</p>
        </div>
    )

    // Action handlers (publish, rollback, archive) omitted for brevity; same as before
    const handlePublish = async (rowId) => { /* unchanged */ }
    const handleRollback = async (rowId, currentVersion) => { /* unchanged */ }
    const handleArchive = async (rowId) => { /* unchanged */ }

    // Utility functions cleanValue, isImageUrl, getImageSrc (unchanged)
    const cleanValue = (value) => { /* unchanged */ }
    const isImageUrl = (value) => { /* unchanged */ }
    const getImageSrc = (value) => { /* unchanged */ }

    const filteredRecords = records.filter((row) =>
        Object.values(row)
            .map((v) => cleanValue(v))
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    )
    const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    const columns = records.length > 0 ? Object.keys(records[0]) : []

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            {isContentManager && renderGuide()}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#e75024]">{name}</h2>
                <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {col}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedRecords.map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col) => (
                                    <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {isImageUrl(row[col]) ? (
                                            <img src={getImageSrc(row[col])} alt="img" className="max-h-16 max-w-32 rounded border" style={{ objectFit: 'contain' }} />
                                        ) : (
                                            cleanValue(row[col])
                                        )}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                                    <button onClick={() => onViewDetails({ name, records: [row] })} title="View">
                                        <Eye size={18} />
                                    </button>
                                    {/* Publish / Rollback / Archive buttons same as before */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination controls unchanged */}
        </div>
    )
}

/**
 * Main viewer component, with role-based UI.
 */
const CollectionViewer = () => {
    const { showAppMessage } = useNotification()
    const [collections, setCollections] = useState([])
    const [recordsMap, setRecordsMap] = useState({})
    const [loading, setLoading] = useState(true)
    const [collectionSearch, setCollectionSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedTable, setSelectedTable] = useState(null)
    const ITEMS_PER_PAGE = 5

    // Determine user role from localStorage
    const userRole = localStorage.getItem('user_role')
    const isContentManager = userRole === 'content_manager'

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await getAllCollections()
                const names = res.data.data.get_all_collections
                    .map((c) => c.collection_name)
                    .filter((n) => !EXCLUDED_TABLES.includes(n))
                setCollections(names)
                const fetches = names.map(async (name) => {
                    const r = await axios.get(`http://localhost:8000/api/collection/data/${name}?files=false`, {
                        headers: { 'auth-token': localStorage.getItem('token') }
                    })
                    return { name, rows: r.data.data }
                })
                const results = await Promise.all(fetches)
                const map = {}
                results.forEach(({ name, rows }) => { map[name] = rows })
                setRecordsMap(map)
            } catch (err) {
                console.error(err)
                showAppMessage('Failed to load collections', 'error')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    if (loading) {
        return <div className="p-4">Loading collections...</div>
    }

    // Filter and paginate collections
    const filtered = collections.filter((n) => n.toLowerCase().includes(collectionSearch.toLowerCase()))
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE)

    return (
        <div className="p-4">
            {/* Guide for content managers */}
            {isContentManager && (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded mb-4">
                    <h3 className="font-semibold mb-2">Welcome, Content Manager!</h3>
                    <ol className="list-decimal list-inside text-sm">
                        <li>Use the search box below to quickly find a collection.</li>
                        <li>Click on a collection name to view its records.</li>
                        <li>Use action buttons on each record to publish, rollback, or archive.</li>
                        <li>Need help? Hover over icons to see descriptions.</li>
                    </ol>
                </div>
            )}

            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search collections..."
                    value={collectionSearch}
                    onChange={(e) => setCollectionSearch(e.target.value)}
                    className="border px-2 py-1 rounded w-full max-w-md"
                />
            </div>

            {paginated.map((name) => (
                <CollectionTable
                    key={name}
                    name={name}
                    records={recordsMap[name] || []}
                    onViewDetails={setSelectedTable}
                    isContentManager={isContentManager}
                />
            ))}

            {/* Collections pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-l disabled:opacity-50">Previous</button>
                    <span className="px-3 py-1 border-t border-b">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-r disabled:opacity-50">Next</button>
                </div>
            )}

            {/* Detail view modal */}
            {selectedTable && (
                <TableDetailView
                    tableName={selectedTable.name}
                    records={selectedTable.records}
                    onClose={() => setSelectedTable(null)}
                />
            )}
        </div>
    )
}

export default CollectionViewer
