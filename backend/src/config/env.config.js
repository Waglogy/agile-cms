// eslint-disable-next-line no-undef

import dotenv from 'dotenv'

dotenv.config({
  debug: true,
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
});

const devEnv = {
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: 1234,
  PG_HOST: process.env.PG_HOST,
  PG_PORT: process.env.PG_PORT,
  PG_DATABASE: process.env.PG_DATABASE,
  JWT_SECRET: process.env.JWT_SECRET,
}

const prodEnv = {
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: process.env.PG_PASSWORD,
  PG_HOST: process.env.PG_HOST,
  PG_PORT: process.env.PG_PORT,
  PG_DATABASE: process.env.PG_DATABASE,
  JWT_SECRET: process.env.JWT_SECRET,
}

const envConfig = process.env.NODE_ENV !== 'dev' ? prodEnv : devEnv

console.log(envConfig)

export default envConfig
