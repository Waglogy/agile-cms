import client from '../config/db.config.js'
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
      const result = await client.query('SELECT create_content_type($1, $2)', [
        tableName,
        schema,
      ])
      return res.json({
        success: true,
        message: result.rows[0].create_content_type,
      })
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
      const result = await client.query(
        'SELECT insert_into_content_type($1, $2)',
        [tableName, data]
      )
      return res.json({ success: result.rows[0].insert_into_content_type })
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
      const result = await client.query(
        'SELECT update_content_type_data($1, $2, $3)',
        [tableName, id, updateData]
      )
      return res.json({ success: result.rows[0].update_content_type_data })
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
      const result = await client.query(
        'SELECT delete_content_type_data($1, $2)',
        [tableName, id]
      )
      return res.json({ success: result.rows[0].delete_content_type_data })
    } catch (err) {
      console.error('Error deleting data:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
  }
}

export default CollectionManager
