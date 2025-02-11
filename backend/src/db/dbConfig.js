import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()
const pool =
  process.env.NODE_ENV === 'development'
    ? new Pool({
        user: 'postgres',
        password: 'namchi123',
        host: 'localhost',
        port: 5432,
        database: 'bytesberry_hrms_db',
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
