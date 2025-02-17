import queryExecutor from '../services/QueryExecutorFactory.js'
import { collectionValidation } from '../validator/collection.validator.js'
import joiValidator from '../utils/joiValidator.js'
import AppError from '../utils/AppError.js'

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
    // TODO Should be done by reesav
  }

  static async insertData(req, res, next) {
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
