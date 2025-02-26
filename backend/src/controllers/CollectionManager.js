import queryExecutor from '../services/QueryExecutorFactory.js'
import { collectionValidation } from '../validator/collection.validator.js'
import joiValidator from '../utils/joiValidator.js'
import AppError from '../utils/AppError.js'
import { imageUploader } from '../utils/fileHandler.util.js'

class CollectionManager {
  // Create a new table with the given schema
  static async createTable(req, res, next) {
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
        message: success
          ? 'Table created successfully'
          : 'Table creation failed',
      })
    } catch (err) {
      return next(new AppError(500, 'Failed to create table', err))
    }
  }

  // Delete a specific collection (table)
  static async deleteCollection(req, res, next) {
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
  static async getAllCollections(req, res, next) {
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
  static async getCollectionByName(req, res, next) {
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
  static async deleteAttributeFromCollection(req, res, next) {
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
  static async getCollectionData(req, res, next) {
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
  static async insertData(req, res, next) {
    try {
      if (!req.body?.collectionName) {
        return next(
          new AppError(
            400,
            'Data insert failed',
            'Please enter collection name'
          )
        )
      }

      const collection = await queryExecutor.getCollectionByName(
        req.body.collectionName
      )

      const validationResult = joiValidator(
        collectionValidation.dynamicSchema(collection),
        req
      )

      console.log(validationResult)

      if (!validationResult.success) {
        return next(
          new AppError(400, 'Validation failed', validationResult.errors)
        )
      }

      let payload = { ...req.body }
      delete payload.collectionName

      if (req.files?.image) {
        try {
          const { imageContainer } = await imageUploader(req.files)
          payload.image = imageContainer
        } catch (uploadError) {
          return next(
            new AppError(500, 'Image processing failed', uploadError.message)
          )
        }
      }

      const success = await queryExecutor.insertData(
        req.body.collectionName,
        payload
      )
      return res.json({
        status: success,
        message: success
          ? 'Data inserted successfully'
          : 'Data insertion failed',
        data: success ? payload : null,
      })
    } catch (error) {
      return next(new AppError(500, 'Internal Server Error', error.message))
    }
  }

  // Update existing data in a collection
  static async updateData(req, res, next) {
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
  static async deleteData(req, res, next) {
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
  static async alterCollection(req, res, next) {
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
}

export default CollectionManager
