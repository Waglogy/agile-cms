import { Router } from 'express'

import CollectionManager from '../controllers/CollectionManager.js'

const collectionRouter = Router()

// collectionRouter.get('/', (req, res) =>
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

collectionRouter.post('/create-collection', CollectionManager.createTable)

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

collectionRouter.post('/insert-into-collection', CollectionManager.insertData)

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

collectionRouter.post('/update-collection-data', CollectionManager.updateData)

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

collectionRouter.post('/delete-colletion-data', CollectionManager.deleteData)

export default collectionRouter
