import app from './app.js'
import envConfig from './config/env.config.js'
import initializeDatabase from './services/initializeDatabase.js'

initializeDatabase()
  .then(() => {
    console.log('Everything Is running as aspected')
    app.listen(envConfig.PORT ?? 3000, () => {
      console.log('App Sterted Successfully')
      console.log(`End Point: http://localhost:${envConfig.PORT ?? 3000}`)
    })
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
