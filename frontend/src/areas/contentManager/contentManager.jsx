import React, { useState, useEffect } from 'react'
import Header from '../../components/Header'
import MenuBar from '../../components/MenuBar'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import {
  fetchCollections,
  fetchCollectionData,
  insertData,
  updateData,
  deleteData,
} from '../../api/content-manager/collectionApi'

const ContentManager = () => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  }
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [attributes, setAttributes] = useState([])
  const [formData, setFormData] = useState({})
  const [collectionData, setCollectionData] = useState([])
  const [editData, setEditData] = useState(null)

  useEffect(() => {
    fetchCollectionsData()
  }, [])

  const fetchCollectionsData = async () => {
    try {
      const collectionsData = await fetchCollections()
      setCollections(collectionsData)
    } catch (err) {
      console.error('Error fetching collections:', err)
    }
  }

  const handleCollectionSelect = async (collectionName) => {
    const collection = collections.find(
      (col) => col.collection_name === collectionName
    )
    if (!collection) return

    setSelectedCollection(collection)
    setAttributes(collection.columns.map((col) => col.column_name) || [])

    const initialFormData = {}
    collection.columns.forEach((col) => {
      if (col.column_name !== 'id') {
        initialFormData[col.column_name] = ''
      }
    })
    setFormData(initialFormData)

    try {
      const data = await fetchCollectionData(collectionName)
      setCollectionData(data)
    } catch (error) {
      setCollectionData([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCollection) {
      alert('Please select a collection first.')
      return
    }

    try {
      const cleanedFormData = {}
      Object.keys(formData).forEach((key) => {
        cleanedFormData[key] = formData[key]
          .replace(/<span class="ql-cursor">.*?<\/span>/g, '')
          .replace(/^"(.*)"$/, '$1')
          .trim()
      })

      await insertData({
        ...cleanedFormData,
        collectionName: selectedCollection.collection_name,
      })
      alert('Data inserted successfully!')
      handleCollectionSelect(selectedCollection.collection_name)
    } catch (err) {
      alert('Failed to insert data.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteData({
        tableName: selectedCollection.collection_name,
        id: id,
      })
      alert('Data deleted successfully!')
      handleCollectionSelect(selectedCollection.collection_name)
    } catch (err) {
      alert('Failed to delete data.')
    }
  }

  const handleEdit = (record) => {
    console.log('Editing record:', record)
    if (!record || typeof record.id === 'undefined') {
      alert('Invalid record selected')
      return
    }

    // Ensure ID is stored as a number
    const editingData = {
      id: Number(record.id), // Convert to number here
      ...Object.keys(record).reduce((acc, key) => {
        if (key !== 'id') {
          acc[key] = record[key] || ''
        }
        return acc
      }, {}),
    }

    console.log('Setting form data:', editingData) // Debug log
    setEditData(record)
    setFormData(editingData)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      console.log('Current formData:', formData) // Debug log
      const dataToUpdate = { ...formData }
      console.log('Form data before update:', dataToUpdate)

      // Ensure ID exists and is a valid number
      if (typeof dataToUpdate.id === 'undefined' || dataToUpdate.id === null) {
        throw new Error('ID is required')
      }

      const recordId = parseInt(dataToUpdate.id, 10)
      console.log('ID after conversion:', recordId, typeof recordId)

      if (isNaN(recordId)) {
        throw new Error('Invalid ID: must be a number')
      }

      delete dataToUpdate.id

      // Clean the HTML content from ReactQuill
      Object.keys(dataToUpdate).forEach((key) => {
        if (typeof dataToUpdate[key] === 'string') {
          dataToUpdate[key] = dataToUpdate[key]
            .replace(/<span class="ql-cursor">.*?<\/span>/g, '')
            .replace(/^"(.*)"$/, '$1')
            .trim()
        }
      })

      const requestData = {
        tableName: selectedCollection.collection_name,
        id: recordId,
        updateData: dataToUpdate,
      }

      console.log('Update request data:', requestData)
      await updateData(requestData)

      alert('Data updated successfully!')
      setEditData(null)
      handleCollectionSelect(selectedCollection.collection_name)
    } catch (err) {
      console.error('Error updating data:', err)
      alert('Failed to update data: ' + err.message)
    }
  }

  return (
    <>
      <Header title="Content Manager" />
      <div className="flex">
        <MenuBar />
        <div className="p-4 mt-20 mx-auto bg-white w-full h-screen">
          <h2 className="text-2xl mb-4 text-gray-800">Content Manager</h2>
          <select
            className="w-full p-2 mb-4 border border-gray-300 text-black rounded"
            onChange={(e) => handleCollectionSelect(e.target.value)}
          >
            <option value="">Select a collection</option>
            {collections.map((col) => (
              <option key={col.collection_name} value={col.collection_name}>
                {col.collection_name}
              </option>
            ))}
          </select>
          // Fix the form section
          {selectedCollection && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="text-lg mb-3 text-black">
                {editData
                  ? 'Edit Record'
                  : `Add to ${selectedCollection.collection_name}`}
              </h3>
              <form onSubmit={editData ? handleUpdate : handleSubmit}>
                {attributes.map((attr) =>
                  attr !== 'id' ? (
                    <div key={attr} className="mb-3">
                      <label className="block mb-1 text-black">{attr}</label>
                      <div style={{ height: '300px', marginBottom: '2rem' }}>
                        <ReactQuill
                          theme="snow"
                          value={formData[attr] || ''}
                          onChange={(value) =>
                            setFormData({ ...formData, [attr]: value })
                          }
                          modules={modules}
                          className="h-[250px]"
                          placeholder={`Enter ${attr}...`}
                        />
                      </div>
                    </div>
                  ) : null
                )}
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded mr-2"
                >
                  {editData ? 'Update' : 'Save'}
                </button>
                {editData && (
                  <button
                    type="button"
                    onClick={() => setEditData(null)}
                    className="bg-gray-500 text-white p-2 rounded"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          )}
          {collectionData.length > 0 && (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr>
                    {attributes.map((attr) => (
                      <th
                        key={attr}
                        className="bg-zinc-100 p-4 border-b border-zinc-200 text-left text-zinc-700 font-semibold"
                      >
                        {attr}
                      </th>
                    ))}
                    <th className="bg-zinc-100 p-4 border-b border-zinc-200 text-left text-zinc-700 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {collectionData.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-50">
                      {attributes.map((attr) => (
                        <td
                          key={attr}
                          className="p-4 border-b border-zinc-200 text-zinc-600 ql-editor"
                          dangerouslySetInnerHTML={{
                            __html:
                              typeof row[attr] === 'string'
                                ? row[attr]
                                    .replace(/^"(.*)"$/, '$1')
                                    .replace(
                                      /<span class="ql-cursor">.*?<\/span>/g,
                                      ''
                                    )
                                : row[attr],
                          }}
                        />
                      ))}
                      <td className="p-4 border-b border-zinc-200">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="bg-zinc-700 hover:bg-zinc-800 text-white px-4 py-2 rounded-md transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ContentManager
