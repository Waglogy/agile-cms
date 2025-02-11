import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import pool from './db/dbConfig'

export const app = express()
const port = process.env.PORT

try {
  pool
    .connect()
    .then(() => {
      console.log('Connected to the database')
    })
    .catch((err) => {
      console.error(err)
    })
} catch (error) {
  console.error(error)
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
