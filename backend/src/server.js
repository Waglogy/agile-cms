import app from './app.js'
import envConfig from './config/env.config.js'
import initializeDatabase from './services/initializeDatabase.js'
import http from 'http'

const PORT = envConfig.PORT ?? 3000

initializeDatabase('music')
  .then(() => {
    const server = http.createServer({ maxHeaderSize: 65536 }, app) // 64kb header size
    server.listen(PORT, () => {
      console.log('App started successfully 🎉')
      console.log(`Endpoint: http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Database initialization error:', err)
    process.exit(1)
  })
