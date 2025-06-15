import { userConnections } from '../utils/userConnections.util.js'

class QueryExecutor {
  constructor(client) {
    this.client = client
  }

  async createCollection(tableName, schema) {
    const result = await this.client.query(
      'SELECT agile_cms.create_content_type($1, $2)',
      [tableName, schema]
    )
    await this.insertLogEntry('create_table', 'system', tableName, null, {
      schema,
    })
    return result.rows[0].create_content_type
  }

  async insertData(tableName, data) {
    const result = await this.client.query(
      'SELECT agile_cms.insert_into_content_type($1, $2)',
      [String(tableName).toString(), data]
    )
    const inserted = result.rows[0].insert_into_content_type
    await this.insertLogEntry('create_row', 'system', tableName, inserted.id, {
      data,
    })
    return inserted
  }

  async updateData(tableName, id, updateData) {
    const result = await this.client.query(
      'SELECT agile_cms.update_content_type_data($1, $2, $3)',
      [tableName, id, updateData]
    )
    await this.insertLogEntry('update_row', 'system', tableName, id, {
      updateData,
    })
    return result.rows[0].update_content_type_data
  }

  async deleteData(tableName, id) {
    const result = await this.client.query(
      'SELECT agile_cms.delete_content_type_data($1, $2)',
      [tableName, id]
    )
    await this.insertLogEntry('delete_row', 'system', tableName, id)
    return result.rows[0].delete_content_type_data
  }

  async deleteCollection(tableName) {
    const result = await this.client.query(
      'SELECT * FROM agile_cms.delete_collection($1)',
      [tableName]
    )
    const { success, message } = result.rows[0]
    if (success) {
      await this.insertLogEntry('delete_table', 'system', tableName, null, {
        message,
      })
    }
    return { success, message }
  }

  async getAllCollections() {
    const result = await this.client.query(
      'SELECT * from agile_cms.get_all_collections()'
    )
    return result.rows[0]
  }

  async alterCollectionSmart(payload) {
    const {
      action,
      tableName,
      columnName,
      columnType,
      constraints,
      newName,
      comment,
    } = payload

    const result = await this.client.query(
      `SELECT agile_cms.alter_content_type(
      $1::text, $2::text, $3::text, $4::text,
      $5::text, $6::text, $7::text
    ) AS message`,
      [action, tableName, columnName, columnType, constraints, newName, comment]
    )

    return { message: result.rows[0].message }
  }

  async registerSuperAdmin(first_name, last_name, email, password) {
    const result = await this.client.query(
      'SELECT register_super_admin($1, $2, $3, $4)',
      [first_name, last_name, email, password]
    )

    return result.rows[0].register_super_admin

    /* SELECT register_super_admin(
      'admin@example.com',
      'SuperSecurePassword',
      'John',
      'Doe'
  ); */
  }

  async getCollectionByName(tableName) {
    const result = await this.client.query(
      'SELECT agile_cms.get_collection_by_name($1)',
      [tableName]
    )

    return result.rows[0].get_collection_by_name
  }

  async deleteAttributeFromCollection(tableName, columnName) {
    const result = await this.client.query(
      'SELECT agile_cms.delete_attribute_from_collection($1, $2)',
      [tableName, columnName]
    )
    return result.rows[0].delete_attribute_from_collection
  }

  async getCollectionData(tableName) {
    const result = await this.client.query('SELECT agile_cms.get_collection_data($1)', [
      tableName,
    ])
    return result.rows[0].get_collection_data
  }

  async getCollectionDataWithImages(tableName) {
    const result = await this.client.query(`
    SELECT 
      test.*,
      img.*,
      json_agg(img_gal.*) AS image_galleries
    FROM agile_cms.${tableName} AS test
    JOIN agile_cms.images AS img ON test.id = img.image_id
    JOIN agile_cms.image_galleries AS img_gal ON img.image_id = img_gal.image_id
    GROUP BY test.id, img.image_id
  `)

    return result.rows
  }

  // ***********************USEERRRRR METHODS*****************************
  // *********************************************************************
  // *********************************************************************
  // *********************************************************************
  // *********************************************************************

  async insertLogEntry(
    actionType,
    userEmail,
    tableName,
    recordId,
    details = {}
  ) {
    await this.client.query(
      'SELECT agile_cms.insert_log_entry($1, $2, $3, $4, $5)',
      [actionType, userEmail, tableName, recordId, details]
    )
  }

  async registerUser(email, password, role) {
    const result = await this.client.query('SELECT register_user($1, $2, $3)', [
      email,
      password,
      role,
    ])
    return result.rows[0].register_user
  }

  async assignRoleToUser(email, role) {
    const result = await this.client.query(
      'SELECT assign_role_to_user($1, $2)',
      [email, role]
    )
    return result.rows[0].assign_role_to_user
  }

  async getUserRole(email) {
    const result = await this.client.query('SELECT get_user_role($1)', [email])
    return result.rows[0].get_user_role
  }

  async getAllUsers() {
    const result = await this.client.query(`SELECT * FROM get_all_users()`)
    return result.rows
  }

  async authenticateUser(email, password) {
    const result = await this.client.query('SELECT authenticate_user($1, $2)', [
      email,
      password,
    ])
    return result.rows[0].authenticate_user
  }

  async findUser(email) {
    const result = await this.client.query('SELECT find_user($1)', [email])
    return result.rows[0].find_user
  }

  async getAllDatabases() {
    const query = `SELECT datname FROM pg_database;`
    const result = await this.client.query(query)
    return result.rows // Extract actual database names
  }

  async getColumnMetadata(tableName, columnName) {
    const sql = `
      SELECT col_description(
        $1::regclass,
        attnum
      ) AS meta
      FROM pg_attribute
      WHERE
        attrelid = $1::regclass
        AND attname = $2
        AND attnum > 0
        AND NOT attisdropped
    `

    const { rows } = await this.client.query(sql, [tableName, columnName])
    return rows[0]?.meta // e.g. 'is_multiple=true' or null
  }

  async getTableMetadata(tableName) {
    // This will return one row per column, with its raw comment (e.g. "is_multiple=true")
    const sql = `
      SELECT
        a.attname AS column_name,
        col_description(a.attrelid, a.attnum) AS meta
      FROM pg_attribute a
      WHERE
        a.attrelid = $1::regclass
        AND a.attnum > 0
        AND NOT a.attisdropped
    `

    const { rows } = await this.client.query(sql, [tableName])

    // Build a JS object: { column_name: meta, … }
    return rows.reduce((acc, { column_name, meta }) => {
      acc[column_name] = meta
      return acc
    }, {})
  }

  // **************** Image & Gallery CREATE methods ****************

  /**
   * Create a new image record
   */
  async createImage(title, description) {
    const result = await this.client.query(
      'SELECT * FROM agile_cms.create_image($1, $2)',
      [title, description]
    )
    return result.rows[0]
  }

  /**
   * Create a new gallery entry for an image
   */
  async createImageGallery(imageId, urlJson) {
    const result = await this.client.query(
      'SELECT * FROM agile_cms.create_image_gallery($1, $2)',
      [imageId, urlJson]
    )
    return result.rows[0]
  }

  // **************** Image & Gallery GET methods ****************

  /**
   * Fetch a single image by ID
   */
  async getImage(imageId) {
    const result = await this.client.query(
      'SELECT * FROM agile_cms.get_image($1)',
      [imageId]
    )
    return result.rows[0]
  }

  /**
   * Fetch all images
   */
  async listImages() {
    const result = await this.client.query(
      'SELECT * FROM agile_cms.list_images()'
    )
    return result.rows
  }

  /**
   * Fetch a single gallery entry by its gallery ID
   */
  async getImageGallery(galleryId) {
    const result = await this.client.query(
      'SELECT * FROM agile_cms.get_image_gallery($1)',
      [galleryId]
    )
    return result.rows[0]
  }

  /**
   * Fetch all gallery entries
   */
  async listImageGalleries() {
    const result = await this.client.query(
      'SELECT * FROM agile_cms.list_image_galleries()'
    )
    return result.rows
  }

  /**
   * Fetch all gallery entries for a given image ID
   */
  async listImageGalleriesByImage(imageId) {
    const result = await this.client.query(
      'SELECT * FROM agile_cms.list_image_galleries_by_image($1)',
      [imageId]
    )
    return result.rows
  }

  /**
   * Fetch every image joined with its gallery rows
   */
  async listImagesWithGalleries() {
    const result = await this.client.query(
      'SELECT * FROM agile_cms.list_images_with_galleries()'
    )
    return result.rows
  }

  async publishRow(tableName, id) {
    const result = await this.client.query(
      'SELECT agile_cms.publish_content_type_row($1, $2)',
      [tableName, id]
    )
    return result.rows[0]?.publish_content_type_row === true
  }

  async getPublishedData(tableName) {
    const result = await this.client.query(
      'SELECT agile_cms.get_collection_by_status($1, $2)',
      [tableName, 'published']
    )
    return result.rows[0].get_collection_by_status
  }

  async getSystemLogs() {
    const result = await this.client.query(`
    SELECT * FROM agile_cms.logs ORDER BY created_at DESC
  `)
    return result.rows
  }
}

// Export a single instance

class QueryExecutorFactory {
  static forSession(sessionID) {
    const session = userConnections.get(sessionID)
    console.log(session)
    if (!session?.client) throw new Error('No DB client found for session')
    return new QueryExecutor(session.client)
  }
}

export default QueryExecutorFactory

// export default QueryExecutorFactory
