import { app } from './index.js'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

app.use(express.json())
app.use(
  cors({
    origin: '*',
  })
)
