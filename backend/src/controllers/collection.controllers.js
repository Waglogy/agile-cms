import queryExecutor from '../services/QueryExecutorFactory.js'
import { collectionValidation } from '../validator/collection.validator.js'
import joiValidator from '../utils/joiValidator.js'
import AppError from '../utils/AppError.js'
import { imageUploader } from '../utils/fileHandler.util.js'

// Create a new table with the given schema
export async function createTable(req, res, next) {
  const validation = joiValidator(collectionValidation.createTable, req)

  if (!validation.success)
    return next(new AppError(400, 'Validation failed', validation.errors))

  try {
    const success = await queryExecutor.createCollection(
      validation.value.tableName,
      validation.value.schema
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
    const success = await queryExecutor.deleteCollection(collectionName)
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
    const collections = await queryExecutor.getAllCollections()
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
    const collection = await queryExecutor.getCollectionByName(tableName)
    return res.json({
      status: true,
      message: 'Collection retrieved successfully',
      data: collection,
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
    const success = await queryExecutor.deleteAttributeFromCollection(
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

  if (!tableName) {
    return next(new AppError(400, 'Table name is required'))
  }

  try {
    const data = await queryExecutor.getCollectionData(tableName)
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
// Insert new data into a collection
export async function insertData(req, res, next) {
  try {
    const { collectionName, ...body } = req.body
    if (!collectionName) {
      return next(
        new AppError(400, 'Data insert failed', 'Please enter collection name')
      )
    }

    console.log(collectionName)

    // 1) make sure the collection exists
    const collection = await queryExecutor.getCollectionByName(
      String(collectionName).toString()
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

    // 2) fetch your metadata comments
    const meta = await queryExecutor.getTableMetadata(collectionName)

    console.log(meta)

    // suppose your image field is named "avatar"
    const rawComment = meta['avatar'] // e.g. "is_multiple=true"
    const ALLOW_MULTIPLE = rawComment?.split('=')[1] === 't'

    console.log('ALLOW_MULTIPLE', ALLOW_MULTIPLE)

    // 3) insert the row
    const payload = { ...body }
    const insertResult = await queryExecutor.insertData(collectionName, payload)
    if (!insertResult) {
      return res
        .status(500)
        .json({ status: false, message: 'Data insertion failed' })
    }
    const newRecordId = insertResult.id

    console.log(insertResult)

    const rawFiles = req.files?.image || []
    const files = Array.isArray(rawFiles) ? rawFiles : [rawFiles]

    // now call the uploader with that array:
    const uploadResults = files.length ? await imageUploader(files) : []

    // 5) process uploads (returns an array of image‐container objects)
    // const uploadResults = files.length ? await imageUploader(files) : []

    console.log(uploadResults)

    // 6) multiple images → gallery table
    if (ALLOW_MULTIPLE && uploadResults.length > 1) {
      for (const container of uploadResults) {
        await queryExecutor.addImage({
          parentTable: collectionName,
          parentId: newRecordId,
          url: container, // container is your JSONB object
        })
      }
    }
    // 7) single‐file → JSONB column
    else if (uploadResults.length === 1) {
      await queryExecutor.updateData(
        collectionName,
        newRecordId,
        { avatar: uploadResults[0] } // first (and only) container
      )
    }

    // 8) respond
    return res.json({
      status: true,
      message: 'Data inserted successfully',
      data: { id: newRecordId, ...payload },
    })
  } catch (error) {
    console.error(error)
    return next(new AppError(500, 'Internal Server Error', error.message))
  }
}

// Update existing data in a collection
export async function updateData(req, res, next) {
  const validation = joiValidator(collectionValidation.updateData, req)
  if (!validation.success)
    return next(new AppError(400, 'Validation failed', validation.errors))

  try {
    const success = await queryExecutor.updateData(
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
    const success = await queryExecutor.deleteData(
      validation.value.tableName,
      validation.value.id
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

  if (!validation.success)
    return next(new AppError(400, 'Validation failed', validation.errors))

  try {
    const success = await queryExecutor.alterCollection(
      validation.value.tableName,
      validation.value.columnName,
      validation.value.columnType,
      validation.value.constraints || ''
    )
    return res.json({
      status: success,
      message: success
        ? 'Table altered successfully'
        : 'Table alteration failed',
    })
  } catch (err) {
    return next(new AppError(500, 'Failed to alter table', err))
  }
}
