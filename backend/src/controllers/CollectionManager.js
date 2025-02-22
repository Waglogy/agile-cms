import path from 'path'
import fs from 'fs'
import queryExecutor from '../services/QueryExecutorFactory.js'
import { collectionValidation } from '../validator/collection.validator.js'
import joiValidator from '../utils/joiValidator.js'
import AppError from '../utils/AppError.js'
import { imageUploader } from '../utils/fileHandler.util.js'

class CollectionManager {
  static async createTable(req, res, next) {
    const validation = joiValidator(collectionValidation.createTable, req)

    if (!validation.success)
      return next(new AppError(400, 'Validation failed', validation.errors))

    try {
      const message = await queryExecutor.createCollection(
        validation.value.tableName,
        validation.value.schema
      )
      return res.json({ success: true, message })
    } catch (err) {
      console.error(
        `Error creating table '${validation.value.tableName}':`,
        err
      )
      return next(
        new AppError(
          500,
          `Failed to create table '${validation.value.tableName}'`,
          err
        )
      )
    }
  }

  static async deleteCollection(req, res, next) {
    const { collectionName } = req.body

    if (!collectionName) {
      return next(new AppError(400, 'Collection name is required'))
    }

    try {
      const result = await queryExecutor.deleteCollection(collectionName)

      if (!result.success) {
        return next(new AppError(404, result.message))
      }

      return res.json({ success: true, message: result.message })
    } catch (err) {
      console.error(`Error deleting table '${collectionName}':`, err)
      return next(
        new AppError(500, `Failed to delete table '${collectionName}'`, err)
      )
    }
  }

  static async getAllCollections(req, res, next) {
    try {
      const collections = await queryExecutor.getAllCollections()

      if (!collections) {
        return next(new AppError(404, 'No collections found'))
      }

      return res.json({ success: true, data: collections })
    } catch (err) {
      console.error('Error fetching collections:', err)
      return next(new AppError(500, 'Failed to fetch collections', err))
    }
  }

  static async getCollectionByName(req, res, next) {
    const { tableName } = req.params

    if (!tableName) {
      return next(new AppError(400, 'Table name is required'))
    }

    try {
      const collection = await queryExecutor.getCollectionByName(tableName)

      if (!collection) {
        return next(new AppError(404, 'Collection not found'))
      }

      return res.json({ success: true, data: collection })
    } catch (err) {
      console.error(`Error fetching collection '${tableName}':`, err)
      return next(
        new AppError(500, `Failed to fetch collection '${tableName}'`, err)
      )
    }
  }

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
      return res.json({ success })
    } catch (err) {
      console.error(
        `Error deleting attribute '${columnName}' from '${tableName}':`,
        err
      )
      return next(
        new AppError(500, `Failed to delete attribute '${columnName}'`, err)
      )
    }
  }

  static async getCollectionData(req, res, next) {
    const { tableName } = req.params

    if (!tableName) {
      return next(new AppError(400, 'Table name is required'))
    }

    try {
      const data = await queryExecutor.getCollectionData(tableName)

      if (!data) {
        return next(new AppError(404, 'No data found for the collection'))
      }

      return res.json({ success: true, data })
    } catch (err) {
      console.error(`Error fetching data for '${tableName}':`, err)
      return next(
        new AppError(500, `Failed to fetch data for '${tableName}'`, err)
      )
    }
  }

  /* static async insertData(req, res, next) {
    const validation = joiValidator(collectionValidation.insertData, req)
    if (!validation.success)
      return next(new AppError(400, 'Validation failed', validation.errors))

    try {
      const success = await queryExecutor.insertData(
        validation.value.tableName,
        validation.value.data
      )
      return res.json({ success })
    } catch (err) {
      console.error(
        `Error inserting data into '${validation.value.tableName}':`,
        err
      )
      return next(
        new AppError(
          500,
          `Failed to insert data into '${validation.value.tableName}'`,
          err
        )
      )
    }
  } */

  static async insertData(req, res, next) {
    console.log(req.body)

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

      // 🔹 Fetch collection schema dynamically
      const collection = await queryExecutor.getCollectionByName(
        req.body.collectionName
      )

      // 🔹 Validate request body using dynamically generated schema

      const validationResult = joiValidator(
        collectionValidation.dynamicSchema(collection),
        req
      )

      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.errors)
        return next(
          new AppError(400, 'Validation failed', validationResult.errors)
        )
      }

      let payload = { ...req.body }
      delete payload.collectionName

      // 🔹 Handle image uploads (if files are provided)

      console.log(req.files)

      if (req.files?.image) {
        try {
          const { imageContainer } = await imageUploader(req.files)
          payload.image = imageContainer
        } catch (uploadError) {
          console.error('Image upload error:', uploadError)
          return next(
            new AppError(500, 'Image processing failed', uploadError.message)
          )
        }
      }

      console.log('Final payload to be inserted:', payload)

      console.log(payload)

      // 🔹 Insert data into the database
      const insertResult = await queryExecutor.insertData(
        req.body.collectionName,
        payload
      )

      if (!insertResult) {
        return next(
          new AppError(
            500,
            'Database insertion failed',
            'Unknown error occurred'
          )
        )
      }

      res.status(200).json({
        success: true,
        message: 'Data inserted successfully',
        insertedData: payload,
      })
    } catch (error) {
      console.error('Error in insertData:', error)
      return next(new AppError(500, 'Internal Server Error', error.message))
    }
  }

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
      return res.json({ success })
    } catch (err) {
      console.error(
        `Error updating record ID ${validation.value.id} in '${validation.value.tableName}':`,
        err
      )
      return next(
        new AppError(
          500,
          `Failed to update record ID ${validation.value.id} in '${validation.value.tableName}'`,
          err
        )
      )
    }
  }

  static async deleteData(req, res, next) {
    const validation = joiValidator(collectionValidation.deleteData, req)
    if (!validation.success)
      return next(new AppError(400, 'Validation failed', validation.errors))

    try {
      const success = await queryExecutor.deleteData(
        validation.value.tableName,
        validation.value.id
      )
      return res.json({ success })
    } catch (err) {
      console.error(
        `Error deleting record ID ${validation.value.id} from '${validation.value.tableName}':`,
        err
      )
      return next(
        new AppError(
          500,
          `Failed to delete record ID ${validation.value.id} from '${validation.value.tableName}'`,
          err
        )
      )
    }
  }

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
      return res.json({ success })
    } catch (err) {
      console.error(
        `Error altering table '${validation.value.tableName}':`,
        err
      )
      return next(
        new AppError(
          500,
          `Failed to alter table '${validation.value.tableName}'`,
          err
        )
      )
    }
  }
}

export default CollectionManager
