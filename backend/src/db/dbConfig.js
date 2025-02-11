import pg from 'pg'
const { Pool } = pg
import dotenv from 'dotenv'
dotenv.config()
const pool =
  process.env.NODE_ENV === 'development'
    ? new Pool({
        user: 'postgres',
        password: 'mypassword',
        host: 'localhost',
        port: 5432,
        database: 'postgres',
      })
    : new Pool({
        user: process.env.REACT_APP_PG_USER,
        password: process.env.REACT_APP_PG_PASSWORD,
        host: process.env.REACT_APP_PG_HOST,
        port: process.env.REACT_APP_PG_PORT,
        database: process.env.REACT_APP_PG_DATABASE,
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      })

export default pool
