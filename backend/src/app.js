import { app } from '.'
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
