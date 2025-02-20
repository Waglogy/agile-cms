import client from '../config/db.config.js'

class QueryExecutorFactory {
  constructor() {
    if (!QueryExecutorFactory.instance) {
      QueryExecutorFactory.instance = this
    }
    return QueryExecutorFactory.instance
  }

  async createCollection(tableName, schema) {
    const result = await client.query('SELECT create_content_type($1, $2)', [
      tableName,
      schema,
    ])
    return result.rows[0].create_content_type
  }

  async insertData(tableName, data) {
    const result = await client.query(
      'SELECT insert_into_content_type($1, $2)',
      [tableName, data]
    )
    return result.rows[0].insert_into_content_type
  }

  async updateData(tableName, id, updateData) {
    const result = await client.query(
      'SELECT update_content_type_data($1, $2, $3)',
      [tableName, id, updateData]
    )
    return result.rows[0].update_content_type_data
  }

  async deleteData(tableName, id) {
    const result = await client.query(
      'SELECT delete_content_type_data($1, $2)',
      [tableName, id]
    )
    return result.rows[0].delete_content_type_data
  }

  async deleteCollection(tableName) {
    const result = await client.query('SELECT * FROM delete_collection($1)', [
      tableName,
    ])

    const { success, message } = result.rows[0]

    return { success, message }
  }

  async getAllCollections() {
    const result = await client.query('SELECT * FROM get_all_collections()')

    return result.rows[0].json_agg
  }

  async alterCollection(tableName, columnName, columnType, constraints = '') {
    const result = await client.query(
      'SELECT alter_content_type($1, $2, $3, $4)',
      [tableName, columnName, columnType, constraints]
    )
    return result.rows[0].alter_content_type
  }

  async registerSuperAdmin(email, password, first_name, last_name) {
    const result = await client.query(
      'SELECT register_super_admin($1, $2, $3, $4)',
      [email, password, first_name, last_name]
    )

    console.log(result)

    return result.rows[0].register_super_admin

    /* SELECT register_super_admin(
      'admin@example.com',
      'SuperSecurePassword',
      'John',
      'Doe'
  ); */
  }

  async registerUser(email, password, role) {
    const result = await client.query('SELECT register_user($1, $2, $3)', [
      email,
      password,
      role,
    ])
    return result.rows[0].register_user
  }

  async assignRoleToUser(email, role) {
    const result = await client.query('SELECT assign_role_to_user($1, $2)', [
      email,
      role,
    ])
    return result.rows[0].assign_role_to_user
  }

  async getUserRole(email) {
    const result = await client.query('SELECT get_user_role($1)', [email])
    return result.rows.map((row) => row.role_name)
  }

  async authenticateUser(email, password) {
    const result = await client.query('SELECT authenticate_user($1, $2)', [
      email,
      password,
    ])
    return result.rows[0].authenticate_user
  }

  async findUser(email) {
    const result = await client.query('SELECT find_user($1)', [email])
    return result.rows[0].find_user
  }
}

// Export a single instance
const queryExecutor = new QueryExecutorFactory()
Object.freeze(queryExecutor) // Prevent modifications to the instance
export default queryExecutor
