import express from 'express'
import appRouter from './routes/main.routes.js'

const app = express()

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// use app router
// app.use('/api', appRouter)

export default app
