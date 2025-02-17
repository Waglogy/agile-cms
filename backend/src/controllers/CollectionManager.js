import queryExecutor from '../services/QueryExecutorFactory.js'
import { collectionValidation } from '../validator/collection.validator.js'

class CollectionManager {
  static async createTable(req, res) {
    const { tableName, schema } = req.body

    const { error } = collectionValidation.createTable.validate({
      tableName,
      schema,
    })
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message })

    try {
      const message = await queryExecutor.createCollection(tableName, schema)
      return res.json({ success: true, message })
    } catch (err) {
      console.error('Error creating table:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
  }

  static async insertData(req, res) {
    const { tableName, data } = req.body

    const { error } = collectionValidation.insertData.validate({
      tableName,
      data,
    })
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message })

    try {
      const success = await queryExecutor.insertData(tableName, data)
      return res.json({ success })
    } catch (err) {
      console.error('Error inserting data:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
  }

  static async updateData(req, res) {
    const { tableName, id, updateData } = req.body

    const { error } = collectionValidation.updateData.validate({
      tableName,
      id,
      updateData,
    })
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message })

    try {
      const success = await queryExecutor.updateData(tableName, id, updateData)
      return res.json({ success })
    } catch (err) {
      console.error('Error updating data:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
  }

  static async deleteData(req, res) {
    const { tableName, id } = req.body

    const { error } = collectionValidation.deleteData.validate({
      tableName,
      id,
    })
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message })

    try {
      const success = await queryExecutor.deleteData(tableName, id)
      return res.json({ success })
    } catch (err) {
      console.error('Error deleting data:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
  }
}

export default CollectionManager
