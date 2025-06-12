import app, { defaultDbClient } from './app.js'
import envConfig from './config/env.config.js'
import http from 'http'

const PORT = envConfig.PORT ?? 8000

const server = http.createServer({ maxHeaderSize: 65536 }, app) // 64kb header size

defaultDbClient
  .connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log('App started successfully 🎉')
      console.log(`Endpoint: http://localhost:${PORT}`)
      console.log('Default database connected successfully')
    })
  })
  .catch((err) => {
    console.error('Failed to connect to DB:', err)
    process.exit(1)
  })

// Graceful shutdown on Ctrl+C or SIGTERM
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...')
  try {
    await defaultDbClient.end()
    console.log('Database connection closed')
    process.exit(0)
  } catch (err) {
    console.error('Error during shutdown:', err)
    process.exit(1)
  }
})
