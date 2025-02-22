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
    // try {
    /* if (!req.body.tableName || typeof req.body.tableName !== 'string') {
        return next(new AppError(400, 'Invalid or missing table name'))
      }

      const files = req.files // Uploaded files
      const data = req.body
      const uploadsDir = path.resolve('../uploads') // Local storage path

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true }) // Ensure uploads directory exists
      }

      // Process each uploaded file
      if (files) {
        for (const [key, file] of Object.entries(files)) {
          const filePath = path.resolve(uploadsDir, file[0].filename)

          // Save file locally
          fs.writeFileSync(filePath, file[0].buffer)

          // Convert file to Base64 (optional)
          const base64String = fs.readFileSync(filePath).toString('base64')

          // Store file path & Base64 in data object
          data[key] = {
            path: `/uploads/${file[0].filename}`,
            base64: base64String, // Store Base64 if needed
          }
        }
      }

      const { tableName, ...rest } = data

      console.log(data)

      // Insert into database (modify queryExecutor accordingly)
      // const success = await queryExecutor.insertData(tableName, rest)
      return res.json({ success })
    } catch (err) {
      console.error(`Error inserting data into '${req.body.tableName}':`, err)
      return next(
        new AppError(
          500,
          `Failed to insert data into '${req.body.tableName}'`,
          err
        )
      )
    } */

    const { imageContainer } = await imageUploader(req.files)

    // console.log(result)

    res.status(200).json({
      success: true,
      imageContainer,
    })
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
