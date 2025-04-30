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
export async function insertData(req, res, next) {
  try {
    // 1) fetch collection‐level settings from DB
    const { collectionName, ...body } = req.body

    const MULTIPLE = true

    if (!collectionName) {
      return next(
        new AppError(400, 'Data insert failed', 'Please enter collection name')
      )
    }
    const collection = await queryExecutor.getCollectionByName(collectionName)
    if (!collection) {
      return next(
        new AppError(
          404,
          'Collection not found',
          `No collection named "${collectionName}"`
        )
      )
    }

    // 2) validate against collection‐specific schema
    const validationResult = joiValidator(
      collectionValidation.dynamicSchema(collection),
      req
    )
    if (!validationResult.success) {
      return next(
        new AppError(400, 'Validation failed', validationResult.errors)
      )
    }

    // 3) build payload (drop collectionName and MULTIPLE flag)
    const payload = { ...body }

    // 4) insert the main record and get its new ID
    const insertResult = await queryExecutor.insertData(collectionName, payload)
    if (!insertResult) {
      return res.status(500).json({
        status: false,
        message: 'Data insertion failed',
      })
    }
    // assume insertResult contains the new record's ID:

    console.log('INSERT_RESULT', insertResult)

    const newRecordId = insertResult.id

    // 5) figure out uploaded files
    // multer might give you either `req.files.image` (single) or an array
    const rawImages = req.files?.image
    const images = Array.isArray(rawImages)
      ? rawImages
      : rawImages
        ? [rawImages]
        : []

    console.log(images)

    // 6) if this collection allows multiple images AND we actually got >1 file
    if (MULTIPLE && images.length > 0) {
      try {
        // upload them all in parallel
        const uploadResults = await imageUploader(req.files)

        console.log(uploadResults)

        // flatten out all URLs (assuming each result.imageContainer is an array or string)
        // const allUrls = uploadResults.flatMap((r) => r.imageContainer)

        // insert into your image‐gallery table
        for (let i = 0; i < images.length; i++) {
          await queryExecutor.addImage({
            parentTable: collectionName,
            parentId: newRecordId,
            // urls: uploadResults,
            url: 'https://example.com',
          })
        }
      } catch (uploadError) {
        return next(
          new AppError(
            500,
            'Image gallery processing failed',
            uploadError.message
          )
        )
      }
    }

    // 7) otherwise, if there’s exactly one image, fall back to the old behavior
    else if (images.length === 1) {
      try {
        const { imageContainer } = await imageUploader({ image: images[0] })
        // update the main record with its single `image` field
        await queryExecutor.updateData(collectionName, newRecordId, {
          image: imageContainer,
        })
      } catch (uploadError) {
        return next(
          new AppError(
            500,
            'Single image processing failed',
            uploadError.message
          )
        )
      }
    }

    // 8) respond
    return res.json({
      status: true,
      message: 'Data inserted successfully',
      data: {
        id: newRecordId,
        ...payload,
      },
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
