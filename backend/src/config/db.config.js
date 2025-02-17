import pg from 'pg'
import envConfig from './env.config.js'

const { Client } = pg

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  password: 'root',
  port: 5432,
  database: envConfig.PG_DATABASE,
})

export default client
