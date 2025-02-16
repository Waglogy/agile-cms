import { app } from './index.js'
import express from 'express'
import cors from 'cors'

app.use(express.json())
app.use(
  cors({
    origin: '*',
  })
)
