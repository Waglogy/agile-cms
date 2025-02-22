import express from 'express'
import apiRouter from './routes/api.routes.js'
import cors from 'cors'
import AppError from './utils/AppError.js'

const app = express()

import './utils/JwtStrategy.js'
import passport from 'passport'
import upload from './config/multer.config.js'

// middlewares
app.use(cors())
app.use(
  express.json({
    limit: '10mb',
  })
)
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())
// app.use(upload.none())

// use app router
app.use('/api', apiRouter)

//global error handler
app.use((err, req, res, _) => {
  console.log(err)

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
