import express from 'express'
import apiRouter from './routes/api.routes.js'
import cors from 'cors'
import passport from 'passport'
import helmet from 'helmet'
import AppError from './utils/AppError.js'

const app = express()

import './utils/JwtStrategy.js'
import path from 'path'

// middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
)
app.use(
  cors({
    origin: ['http://localhost:5173'],
  })
)

app.use(
  express.json({
    limit: '10mb',
  })
)

app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.resolve('uploads')))
app.use(passport.initialize())
// app.use(upload.none())

// use app router
app.use('/api', apiRouter)

//global error handler
// eslint-disable-next-line no-unused-vars
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
