// src/components/CreateTableForm.js
import React, { useState } from 'react'
import { PlusCircle, Trash2 } from 'lucide-react'
import { createCollection } from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'

const fieldTypes = ['text', 'number', 'date', 'image', 'boolean', 'richtext']

const getPostgresType = (type) => {
  switch (type) {
    case 'text':
      return 'TEXT'
    case 'number':
      return 'INTEGER'
    case 'date':
      return 'DATE'
    case 'image':
      return 'JSONB'
    case 'boolean':
      return 'BOOLEAN'
    case 'richtext':
      return 'TEXT'
    default:
      return 'TEXT'
  }
}
function constraintToSql(constraints, type) {
  let parts = []
  if (!constraints) return ''
  if (constraints.notNull) parts.push('NOT NULL')
  if (constraints.unique) parts.push('UNIQUE')
  if (
    constraints.defaultValue !== '' &&
    constraints.defaultValue !== undefined
  ) {
    if (type === 'TEXT' || type === 'DATE') {
      parts.push(`DEFAULT '${constraints.defaultValue}'`)
    } else if (type === 'BOOLEAN') {
      parts.push(
        `DEFAULT ${
          constraints.defaultValue === 'true' ||
          constraints.defaultValue === true
            ? 'TRUE'
            : 'FALSE'
        }`
      )
    } else {
      parts.push(`DEFAULT ${constraints.defaultValue}`)
    }
  }
  // You could add min/max CHECK constraint logic here
  return parts.join(' ')
}

const defaultConstraints = {
  notNull: false,
  unique: false,
  defaultValue: '',
  min: '',
  max: '',
}

const CreateTableForm = () => {
  const { showAppMessage } = useNotification()
  const [tableName, setTableName] = useState('')
  const [fields, setFields] = useState([
    {
      name: '',
      type: 'text',
      isMultiple: false,
      constraints: {
        notNull: true,
        unique: false,
        defaultValue: '',
        min: '',
        max: '',
      },
    },
  ])
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const addField = () => {
    setFields([
      ...fields,
      {
        name: '',
        type: 'text',
        isMultiple: false,
        constraints: { ...defaultConstraints },
      },
    ])
  }

  const updateField = (index, key, value) => {
    const newFields = [...fields]
    if (key === 'type') {
      // Reset constraints if type changes
      newFields[index][key] = value
      newFields[index].constraints = { ...defaultConstraints }
      // isMultiple only for images
      if (value !== 'image') newFields[index].isMultiple = false
    } else {
      newFields[index][key] = value
    }
    setFields(newFields)
  }

  const updateConstraint = (fieldIdx, constraintKey, value) => {
    const newFields = [...fields]
    if (constraintKey === 'notNull' || constraintKey === 'unique') {
      newFields[fieldIdx].constraints[constraintKey] =
        value === true || value === 'true'
    } else {
      newFields[fieldIdx].constraints[constraintKey] = value
    }
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
    if (new Set(fields.map((f) => f.name)).size !== fields.length)
      return showAppMessage('Field names must be unique')

    const schema = {}
    fields.forEach(({ name, type, isMultiple, constraints }) => {
      // Clean and stringify constraints
      const c = { ...constraints }
      if (type !== 'number' && type !== 'text') {
        delete c.min
        delete c.max
      }
      if (
        type === 'boolean' &&
        c.defaultValue !== '' &&
        c.defaultValue !== 'true' &&
        c.defaultValue !== 'false'
      ) {
        c.defaultValue = ''
      }
      if (c.defaultValue === '') delete c.defaultValue
      if (c.min === '') delete c.min
      if (c.max === '') delete c.max

      schema[name] = {
        type: getPostgresType(type),
        constraints: constraintToSql(c, getPostgresType(type)), // <-- MAKE IT A STRING HERE
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
      setFields([
        {
          name: '',
          type: 'text',
          isMultiple: false,
          constraints: { ...defaultConstraints },
        },
      ])
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to create table')
    }
  }

  return (
    <div className="relative">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-2 text-[#e75024]">
          Create New Table
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Fill out the form below to define a new content table. Each field must
          have a unique name. If the type is 'image', you can choose whether to
          allow multiple images.
          <br />
          <b>
            You can also set constraints per field (like NOT NULL, UNIQUE, etc).
          </b>
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
              className="border p-4 rounded-md bg-gray-50 relative mb-2"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
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
                    onChange={(e) => {
                      const newType = e.target.value
                      // Reset constraints when switching to image type
                      if (newType === 'image') {
                        const newConstraints = {
                          ...field.constraints,
                          min: '',
                          max: '',
                          defaultValue: '',
                        }
                        updateField(index, 'constraints', newConstraints)
                      }
                      updateField(index, 'type', newType)
                    }}
                  >
                    {fieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {field.type === 'image' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Allow Multiple Images
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
                      <option value="false">Single Image</option>
                      <option value="true">Multiple Images</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Constraints Section */}
              <div className="mt-2 border-t pt-3">
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  Constraints
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={field.constraints.notNull}
                      onChange={(e) => {
                        const newConstraints = {
                          ...field.constraints,
                          notNull: e.target.checked,
                        }
                        updateField(index, 'constraints', newConstraints)
                      }}
                      className="rounded border-gray-300"
                    />
                    Required
                  </label>

                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={field.constraints.unique}
                      onChange={(e) => {
                        const newConstraints = {
                          ...field.constraints,
                          unique: e.target.checked,
                        }
                        updateField(index, 'constraints', newConstraints)
                      }}
                      className="rounded border-gray-300"
                    />
                    Unique
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-sm">Default:</span>
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={field.constraints.defaultValue}
                      onChange={(e) => {
                        const newConstraints = {
                          ...field.constraints,
                          defaultValue: e.target.value,
                        }
                        updateField(index, 'constraints', newConstraints)
                      }}
                      placeholder="Default value"
                      className="px-2 py-1 border rounded-md text-sm w-32"
                    />
                  </div>

                  {(field.type === 'number' || field.type === 'text') && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Min:</span>
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={field.constraints.min}
                          onChange={(e) => {
                            const newConstraints = {
                              ...field.constraints,
                              min: e.target.value,
                            }
                            updateField(index, 'constraints', newConstraints)
                          }}
                          placeholder="Min"
                          className="px-2 py-1 border rounded-md text-sm w-24"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Max:</span>
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={field.constraints.max}
                          onChange={(e) => {
                            const newConstraints = {
                              ...field.constraints,
                              max: e.target.value,
                            }
                            updateField(index, 'constraints', newConstraints)
                          }}
                          placeholder="Max"
                          className="px-2 py-1 border rounded-md text-sm w-24"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-2 text-sm text-[#e75024] hover:text-[#a30220]"
            >
              <PlusCircle size={16} /> Add Field
            </button>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="bg-[#e75024] text-white px-4 py-2 rounded-md hover:bg-[#a30220]"
            >
              Create Table
            </button>
          </div>
        </form>
      </div>

      {showSuccessPopup && (
        <div className="absolute inset-0 bg-[#fefce8] bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Table Created Successfully
            </h3>
            <p className="text-sm mb-4 text-gray-600">
              You can now view or update the table from the sidebar.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="px-4 py-2 text-sm bg-[#e75024] text-white rounded-md hover:bg-[#a30220]"
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
