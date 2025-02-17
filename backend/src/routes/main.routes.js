import express from 'express'

const appRouter = express.Router()

appRouter.get((req, res) => {
  res.sendStatus(200)
})

export default appRouter
