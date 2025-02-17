import queryExecutor from '../services/QueryExecutorFactory.js'
import { collectionValidation } from '../validator/collection.validator.js'
import joiValidator from '../utils/joiValidator.js'

class CollectionManager {
  static async createTable(req, res) {
    const validation = joiValidator(collectionValidation.createTable, req)
    if (!validation.success) return res.status(400).json(validation)

    try {
      const message = await queryExecutor.createCollection(
        validation.value.tableName,
        validation.value.schema
      )
      return res.json({ success: true, message })
    } catch (err) {
      console.error('Error creating table:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
  }

  static async insertData(req, res) {
    const validation = joiValidator(collectionValidation.insertData, req)
    if (!validation.success) return res.status(400).json(validation)

    try {
      const success = await queryExecutor.insertData(
        validation.value.tableName,
        validation.value.data
      )
      return res.json({ success })
    } catch (err) {
      console.error('Error inserting data:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
  }

  static async updateData(req, res) {
    const validation = joiValidator(collectionValidation.updateData, req)
    if (!validation.success) return res.status(400).json(validation)

    try {
      const success = await queryExecutor.updateData(
        validation.value.tableName,
        validation.value.id,
        validation.value.updateData
      )
      return res.json({ success })
    } catch (err) {
      console.error('Error updating data:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
  }

  static async deleteData(req, res) {
    const validation = joiValidator(collectionValidation.deleteData, req)
    if (!validation.success) return res.status(400).json(validation)

    try {
      const success = await queryExecutor.deleteData(
        validation.value.tableName,
        validation.value.id
      )
      return res.json({ success })
    } catch (err) {
      console.error('Error deleting data:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
  }
}

export default CollectionManager
