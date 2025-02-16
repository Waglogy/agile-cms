import dotenv from 'dotenv'

dotenv.config({
  debug: true,
  path: `.env.${process.env.NODE_ENV}`,
})

const devEnv = {
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: process.env.PG_PASSWORD,
  PG_HOST: process.env.PG_HOST,
  PG_PORT: process.env.PG_PORT,
  PG_DATABASE: process.env.PG_DATABASE,
}

const prodEnv = {
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: process.env.PG_PASSWORD,
  PG_HOST: process.env.PG_HOST,
  PG_PORT: process.env.PG_PORT,
  PG_DATABASE: process.env.PG_DATABASE,
}

const envConfig = process.env.NODE_ENV != 'dev' ? prodEnv : devEnv
// export default envConfig(process.env.NODE_ENV != 'dev') ? prodEnv : devEnv

export default envConfig
