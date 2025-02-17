import express from 'express'
import apiRouter from './routes/api.routes.js'
import AppError from './utils/AppError.js'

const app = express()

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// use app router
app.use('/api', apiRouter)

//global error handler
app.use((err, req, res, next) => {
  if (err instanceof AppError)
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.error,
    })

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  })
})

export default app
