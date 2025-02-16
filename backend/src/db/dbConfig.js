import pg from 'pg'
import envConfig from '../config/env.config.js'

const { Pool } = pg

const pool = new Pool({
  // users
  user: envConfig.PG_USER,
  password: envConfig.PG_PASSWORD,
  host: envConfig.PG_HOST,
  port: envConfig.PG_PORT,
  database: envConfig.PG_DATABASE,
  ...(process.env.NODE_ENV !== 'dev' && {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  }),
})

const pool2 = new Pool({
  user: envConfig.PG_USER,
  password: envConfig.PG_PASSWORD,
  host: envConfig.PG_HOST,
  port: envConfig.PG_PORT,
  database: envConfig.PG_DATABASE,
  ...(process.env.NODE_ENV !== 'dev' && {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  }),
})

export default pool
