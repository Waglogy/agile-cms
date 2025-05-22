// src/components/CreateTableForm.js
import React, { useState } from 'react'
import { PlusCircle, Trash2 } from 'lucide-react'
import { createCollection } from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'

const fieldTypes = ['text', 'number', 'date', 'image', 'boolean']

const CreateTableForm = () => {
const { showAppMessage } = useNotification()

  const [tableName, setTableName] = useState('')
  const [fields, setFields] = useState([
    { name: '', type: 'text', isMultiple: false },
  ])
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const addField = () => {
    setFields([...fields, { name: '', type: 'text', isMultiple: false }])
  }

  const updateField = (index, key, value) => {
    const newFields = [...fields]
    newFields[index][key] = value
    setFields(newFields)
  }

  const removeField = (index) => {
    const newFields = [...fields]
    newFields.splice(index, 1)
    setFields(newFields)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tableName.trim()) return showAppMessage('Table name is required')
    if (fields.some((field) => !field.name.trim()))
      return showAppMessage('All fields must have names')

    const schema = {}
    fields.forEach(({ name, type, isMultiple }) => {
      schema[name] = {
        type: type === 'image' ? 'JSONB' : type.toUpperCase(),
        constraints: '',
        is_multiple: isMultiple,
      }
    })

    const payload = {
      tableName,
      schema,
    }

    try {
      await createCollection(payload)
      setShowSuccessPopup(true)
      setTableName('')
      setFields([{ name: '', type: 'text', isMultiple: false }])
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to create table')
    }
  }

  return (
    <div className="relative">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-2 text-[#d90429]">
          Create New Table
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Fill out the form below to define a new content table. Each field must
          have a unique name. If the type is 'image', you can choose whether to
          allow multiple images.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Table Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g. Physics MCQs"
            />
          </div>

          {fields.map((field, index) => (
            <div
              key={index}
              className="border p-4 rounded-md bg-gray-50 relative"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Field {index + 1}</h4>
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={field.name}
                    onChange={(e) => updateField(index, 'name', e.target.value)}
                    placeholder="e.g. question"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Field Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={field.type}
                    onChange={(e) => updateField(index, 'type', e.target.value)}
                  >
                    {fieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                {field.type === 'image' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Allow Multiple
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={field.isMultiple ? 'true' : 'false'}
                      onChange={(e) =>
                        updateField(
                          index,
                          'isMultiple',
                          e.target.value === 'true'
                        )
                      }
                    >
                      <option value="false">Single</option>
                      <option value="true">Multiple</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-2 text-sm text-[#d90429] hover:text-[#a30220]"
            >
              <PlusCircle size={16} /> Add Field
            </button>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="bg-[#d90429] text-white px-4 py-2 rounded-md hover:bg-[#a30220]"
            >
              Create Table
            </button>
          </div>
        </form>
      </div>

      {showSuccessPopup && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Table Created Successfully
            </h3>
            <p className="text-sm mb-4 text-gray-600">
              You can now view or update the table from the sidebar.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="px-4 py-2 text-sm bg-[#d90429] text-white rounded-md hover:bg-[#a30220]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateTableForm
