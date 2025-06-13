import express from 'express'
import cors from 'cors'
// import passport from 'passport'
// import helmet from 'helmet'
import expressSession from 'express-session'
import path from 'path'
import pg from 'pg'

// costum packages
import apiRouter from './routes/api.routes.js'
import AppError from './utils/AppError.js'

// import './utils/JwtStrategy.js'

const app = express()

// Helmet Security Headers (adjust CSP as needed)
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         imgSrc: ["'self'", 'data:'],
//       },
//     },
//   })
// )

// CORS Setup
app.use(
  cors({
    credentials: true,
    methods: ['GET', 'POST'],
    origin: 'http://localhost:5173',
  })
)

// Express Built-in JSON and URL-encoded Parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// expres-sessions config-setup
app.use(
  expressSession({
    secret: 'RONALDO7SIUUUUUUUUU',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
    },
  })
)
// Serve static files from 'uploads'
app.use('/uploads', express.static(path.resolve('uploads')))

// Passport Initialization
// app.use(passport.initialize())

// Mount API Router
app.use('/api', apiRouter)

app.use((req, res, next) => {
  console.log(req.sessionID)
  next()
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.error,
    })
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  })
})

export default app
