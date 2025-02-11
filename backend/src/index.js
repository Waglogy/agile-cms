import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import pool from './db/dbConfig.js'

export const app = express()
const port = process.env.PORT

try {
  pool
    .connect()
    .then(() => {
      console.log('🎉Connected to the database ')
    })
    .catch((err) => {
      console.error('😭something went wrong while db connection : ', err)
    })
} catch (error) {
  console.error('😥 went wrong while db connection : ', error)
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port} 🚀`)
})
