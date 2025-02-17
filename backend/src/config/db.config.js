import pg from 'pg'
import envConfig from './env.config.js'

const { Client } = pg

const client = new Client({
  host: envConfig.PG_HOST,
  user: envConfig.PG_USER,
  password: envConfig.PG_PASSWORD,
  port: envConfig.PG_PORT,
  database: String(envConfig.PG_DATABASE).toLowerCase(),
})

export default client
