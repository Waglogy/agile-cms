// import req.queryExecutor from '../services/req.queryExecutorFactory.js'
import { collectionValidation } from '../validator/collection.validator.js'
import joiValidator from '../utils/joiValidator.js'
import AppError from '../utils/AppError.js'
import { imageUploader } from '../utils/fileHandler.util.js'

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
        `DEFAULT ${constraints.defaultValue === 'true' || constraints.defaultValue === true ? 'TRUE' : 'FALSE'}`
      )
    } else {
      parts.push(`DEFAULT ${constraints.defaultValue}`)
    }
  }
  // Optionally, handle min/max (as CHECK constraints)
  return parts.join(' ')
}

// Create a new table with the given schema
export async function createTable(req, res, next) {
  const validation = joiValidator(collectionValidation.createTable, req)
  if (!validation.success)
    return next(new AppError(400, 'Validation failed', validation.errors))

  try {
    // 🟢 Transform constraints before saving!
    const schema = { ...validation.value.schema }
    for (const fieldName in schema) {
      const field = schema[fieldName]
      field.constraints = constraintToSql(field.constraints, field.type)
    }

    const success = await req.queryExecutor.createCollection(
      validation.value.tableName,
      schema
    )

    await req.queryExecutor.insertLogEntry(
      'create_collection',
      req.user?.email || 'system',
      validation.value.tableName,
      null,
      schema // use the schema actually created
    )

    return res.json({
      status: success,
      message: success ? 'Table created successfully' : 'Table creation failed',
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to create table', err))
  }
}

// Delete a specific collection (table)
export async function deleteCollection(req, res, next) {
  const { collectionName } = req.body

  if (!collectionName) {
    return next(new AppError(400, 'Collection name is required'))
  }

  try {
    const success = await req.queryExecutor.deleteCollection(collectionName)
    await req.queryExecutor.insertLogEntry(
      'delete_collection',
      req.user?.email || 'system',
      collectionName,
      null,
      {}
    )

    await req.queryExecutor.insertLogEntry(
      'delete_collection',
      req.user?.email || 'system',
      collectionName,
      null,
      {}
    )

    return res.json({
      status: success,
      message: success
        ? 'Collection deleted successfully'
        : 'Collection deletion failed',
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to delete collection', err))
  }
}

// Retrieve all collections (tables) in the database
export async function getAllCollections(req, res, next) {
  try {
    const collections = await req.queryExecutor.getAllCollections()
    return res.json({
      status: true,
      message: 'Collections retrieved successfully',
      data: collections,
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to fetch collections', err))
  }
}

// Retrieve a specific collection by name
export async function getCollectionByName(req, res, next) {
  const { tableName } = req.params

  if (!tableName) {
    return next(new AppError(400, 'Table name is required'))
  }

  try {
    const collection = await req.queryExecutor.getCollectionByName(tableName)
    console.log(collection)
    const meta_data = await req.queryExecutor.getTableMetadata(tableName)
    return res.json({
      status: true,
      message: 'Collection retrieved successfully',
      data: collection,
      meta_data,
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to fetch collection', err))
  }
}

// Delete a specific attribute (column) from a collection
export async function deleteAttributeFromCollection(req, res, next) {
  const { tableName, columnName } = req.body

  if (!tableName || !columnName) {
    return next(new AppError(400, 'Table name and column name are required'))
  }

  try {
    const success = await req.queryExecutor.deleteAttributeFromCollection(
      tableName,
      columnName
    )
    return res.json({
      status: success,
      message: success
        ? 'Attribute deleted successfully'
        : 'Attribute deletion failed',
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to delete attribute', err))
  }
}

// Retrieve data from a specific collection
export async function getCollectionData(req, res, next) {
  const { tableName } = req.params
  const { files, limit = 10, offset = 0 } = req.query

  if (!tableName) {
    return next(new AppError(400, 'Table name is required'))
  }

  try {
    let data

    if (files === 'true') {
      data = await req.queryExecutor.getCollectionDataWithImages(tableName)
    } else {
      data = await req.queryExecutor.getCollectionData(
        tableName,
        parseInt(limit),
        parseInt(offset)
      )
    }

    return res.json({
      status: true,
      message: 'Data retrieved successfully',
      data,
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to fetch data', err))
  }
}

// Insert new data into a collection
export async function insertData(req, res, next) {
  try {
    // 1) Required params
    const { collectionName, ...body } = req.body
    if (!collectionName) {
      return next(
        new AppError(400, 'Data insert failed', 'Please enter collection name')
      )
    }

    // 2) Ensure the collection exists
    const collection = await req.queryExecutor.getCollectionByName(
      String(collectionName)
    )
    if (!collection) {
      return next(
        new AppError(
          404,
          'Collection not found',
          `No collection named "${collectionName}"`
        )
      )
    }

    // 3) insert the row
    const payload = { ...body }
    // Sanitize string fields: remove accidental outer quotes like "\"draft\""
    for (const key in payload) {
      if (
        typeof payload[key] === 'string' &&
        payload[key].startsWith('"') &&
        payload[key].endsWith('"')
      ) {
        payload[key] = payload[key].slice(1, -1)
      }
    }

    const insertResult = await req.queryExecutor.insertData(
      collectionName,
      payload
    )

    if (!insertResult) {
      return res.status(500).json({
        status: false,
        message: 'Data insertion failed',
      })
    }
    const newRecordId = insertResult.id

    // 4) group by field name
    const filesArray = Array.isArray(req.files) ? req.files : []
    const fileMap = filesArray.reduce((map, file) => {
      map[file.fieldname] = map[file.fieldname] || []
      map[file.fieldname].push(file)
      return map
    }, {})

    // 5) for each dynamic file‐field:
    for (const [fieldName, files] of Object.entries(fileMap)) {
      // --- A) create a single metadata row for this field
      const { image_id } = await req.queryExecutor.createImage(
        `Auto for ${fieldName}`,
        `Uploaded by user`
      )

      // --- B) upload & gallery all files under that one image_id
      const uploadContainers = await imageUploader(files)
      for (const container of uploadContainers) {
        await req.queryExecutor.createImageGallery(image_id, container)
      }

      // --- C) point your test_table FK at that one image_id
      await req.queryExecutor.updateData(collectionName, newRecordId, {
        [fieldName]: image_id,
      })
    }

    await req.queryExecutor.updateData(collectionName, newRecordId, {
      [imageField]: result.image_id,
    })
    await queryExecutor.insertLogEntry(
      'insert_row',
      req.user?.email || 'system',
      collectionName,
      newRecordId,
      payload
    )
    // 7) fetch the inserted row and save snapshot
    const existing = await client.query(
      `SELECT to_jsonb(t) FROM ${collectionName} t WHERE id = $1`,
      [newRecordId]
    )

    const oldData = existing.rows[0]?.to_jsonb

    if (oldData) {
      await client.query(
        'SELECT agile_cms.save_content_version($1, $2, $3, $4)',
        [collectionName, newRecordId, oldData, oldData.version || 1]
      )
    }

    /* await queryExecutor.updateData(
      collectionName,
      newRecordId,
      { images: uploadResults[0] } // first (and only) container
    ) */

    return res.json({
      status: true,
      message: 'Data inserted successfully',
      data: { id: newRecordId, ...body },
    })
  } catch (error) {
    console.error(error)
    return next(new AppError(500, 'Internal Server Error', error.message))
  }
}
export async function rollbackData(req, res, next) {
  const { tableName, id, version } = req.body
  if (!tableName || !id || !version) {
    return next(new AppError(400, 'Missing rollback parameters'))
  }

  try {
    const success = await queryExecutor.rollbackRow(tableName, id, version)
    await queryExecutor.insertLogEntry(
      'rollback_row',
      req.user?.email || 'system',
      tableName,
      id,
      { version }
    )

    return res.json({
      status: success,
      message: success ? 'Rollback successful' : 'Rollback failed',
    })
  } catch (err) {
    return next(new AppError(500, 'Rollback failed', err))
  }
}
export async function getArchivedContent(req, res, next) {
  const { tableName } = req.params
  if (!tableName) return next(new AppError(400, 'Table name is required'))

  try {
    const data = await queryExecutor.getPublishedData(tableName, 'archived') // reuse the existing function
    return res.json({
      status: true,
      message: 'Archived content retrieved',
      data,
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to fetch archived data', err))
  }
}

export async function archiveData(req, res, next) {
  const { tableName, id } = req.body

  if (!tableName || !id) {
    return next(new AppError(400, 'Missing tableName or id'))
  }

  try {
    const success = await queryExecutor.archiveRow(tableName, id)
    await queryExecutor.insertLogEntry(
      'archive_row',
      req.user?.email || 'system',
      tableName,
      id,
      {}
    )

    return res.json({
      status: success,
      message: success
        ? 'Row archived successfully'
        : 'Archiving failed or no update made',
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to archive row', err))
  }
}

// Update existing data in a collection
export async function updateData(req, res, next) {
  const validation = joiValidator(collectionValidation.updateData, req)
  if (!validation.success)
    return next(new AppError(400, 'Validation failed', validation.errors))

  try {
    const success = await req.queryExecutor.updateData(
      validation.value.tableName,
      validation.value.id,
      validation.value.updateData
    )
    await req.queryExecutor.insertLogEntry(
      'update_row',
      req.user?.email || 'system',
      validation.value.tableName,
      validation.value.id,
      validation.value.updateData
    )

    return res.json({
      status: success,
      message: success ? 'Data updated successfully' : 'Data update failed',
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to update data', err))
  }
}

// Delete a specific data entry from a collection
export async function deleteData(req, res, next) {
  const validation = joiValidator(collectionValidation.deleteData, req)
  if (!validation.success)
    return next(new AppError(400, 'Validation failed', validation.errors))

  try {
    const success = await req.queryExecutor.deleteData(
      validation.value.tableName,
      validation.value.id
    )
    await req.queryExecutor.insertLogEntry(
      'delete_row',
      req.user?.email || 'system',
      validation.value.tableName,
      validation.value.id,
      {}
    )

    return res.json({
      status: success,
      message: success ? 'Data deleted successfully' : 'Data deletion failed',
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to delete data', err))
  }
}

// Alter a collection by modifying its schema
export async function alterCollection(req, res, next) {
  const validation = joiValidator(collectionValidation.alterCollection, req)

  if (!validation.success) {
    return next(new AppError(400, 'Validation failed', validation.errors))
  }

  const {
    action,
    tableName,
    columnName,
    columnType,
    constraints,
    newName,
    comment,
  } = validation.value

  try {
    const result = await req.queryExecutor.alterCollectionSmart({
      action,
      tableName,
      columnName,
      columnType,
      constraints,
      newName,
      comment,
    })

    await req.queryExecutor.insertLogEntry(
      'alter_collection',
      req.user?.email || 'system',
      tableName,
      null,
      {
        action,
        columnName,
        columnType,
        constraints,
        newName,
        comment,
      }
    )

    return res.json({
      status: true,
      message: result.message,
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to alter table', err))
  }
}

export async function publishData(req, res, next) {
  const { tableName, id } = req.body

  if (!tableName || !id) {
    return next(new AppError(400, 'Missing tableName or id'))
  }

  try {
    const success = await req.queryExecutor.publishRow(tableName, id)
    await req.queryExecutor.insertLogEntry(
      'publish_row',
      req.user?.email || 'system',
      tableName,
      id,
      {}
    )

    return res.json({
      status: success,
      message: success
        ? 'Row published successfully'
        : 'Publishing failed or no update made',
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to publish data', err))
  }
}

export async function getPublishedContent(req, res, next) {
  const { tableName } = req.params
  if (!tableName) return next(new AppError(400, 'Table name is required'))

  try {
    const data = await req.queryExecutor.getPublishedData(tableName)
    return res.json({
      status: true,
      message: 'Published content retrieved',
      data,
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to fetch published data', err))
  }
}

export async function getSystemLogs(req, res, next) {
  try {
    const logs = await req.queryExecutor.getSystemLogs()
    return res.json({
      status: true,
      message: 'Logs retrieved successfully',
      data: logs,
    })
  } catch (err) {
    console.error(err)
    return next(new AppError(500, 'Failed to fetch logs', err))
  }
}
