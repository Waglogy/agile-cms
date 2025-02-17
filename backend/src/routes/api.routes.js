import { Router } from 'express'
import authRouter from './auth.routes.js'
import CollectionManager from '../controllers/CollectionManager.js'
const apiRouter = Router()

// use auth router

apiRouter.use('/auth', authRouter)

// apiRouter.get('/', (req, res) =>
//   res.json({ message: 'thisss isss foooorrrr testingggg huiyaahhhhh🥵' })
// )

/*
**
**
***** create new collection*****
  {
      {
    "tableName": "users",
    "schema": {
      "name": { "type": "TEXT", "constraints": "NOT NULL" },
      "age": { "type": "INTEGER", "constraints": "DEFAULT 18" }
    }
  }
********************************
**
**
**/

apiRouter.post('/collection/create-collection', CollectionManager.createTable)

/*
**
**
*****insert into collection*****
  {
    "tableName": "test",
    "data": {
      "test-title": "this is test title",
      "test-content": 1
    }
  }
********************************
**
**
**/

apiRouter.post(
  '/collection/insert-into-collection',
  CollectionManager.insertData
)

/*
**
**
*****update a given collection's data *****
  {
    "tableName": "test",
    "id": 1,
    "updateData": {
        "test-title": "this is updated title",
        "test-content": 2
    }
}
********************************
**
**
**/

apiRouter.post(
  '/collection/update-collection-data',
  CollectionManager.updateData
)

/*
**
**
*****update a given collection's data *****
 {
    "tableName": "test",
    "id": 1
  }
********************************
**
**
**/

apiRouter.post(
  '/collection/delete-colletion-data',
  CollectionManager.deleteData
)

export default apiRouter
