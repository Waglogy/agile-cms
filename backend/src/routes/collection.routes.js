import { Router } from 'express'
import CollectionManager from '../controllers/CollectionManager.js'
import upload from '../config/multer.config.js'

const collectionRouter = Router()

/*
 **
 ** Create a new collection (table)
 **
 ** Example Request Body:
 ** {
 **   "tableName": "users",
 **   "schema": {
 **     "name": { "type": "TEXT", "constraints": "NOT NULL" },
 **     "age": { "type": "INTEGER", "constraints": "DEFAULT 18" }
 **   }
 ** }
 **
 */
collectionRouter.post('/create', CollectionManager.createTable)

/*
 **
 ** Insert data into an existing collection
 **
 ** Example Request Body:
 ** {
 **   "tableName": "test",
 **   "data": {
 **     "test_title": "this is a test title",
 **     "test_content": 1
 **   }
 ** }
 **
 */
collectionRouter.post(
  '/insert',
  upload.fields([
    {
      name: 'image',
      maxCount: 1,
    },
  ]),
  CollectionManager.insertData
)

/*
 **
 ** Update a record in a collection
 **
 ** Example Request Body:
 ** {
 **   "tableName": "test",
 **   "id": 1,
 **   "updateData": {
 **     "test_title": "this is an updated title",
 **     "test_content": 2
 **   }
 ** }
 **
 */
collectionRouter.post('/update', CollectionManager.updateData)

/*
 **
 ** Delete a record from a collection
 **
 ** Example Request Body:
 ** {
 **   "tableName": "test",
 **   "id": 1
 ** }
 **
 */
collectionRouter.post('/delete', CollectionManager.deleteData)

/**
 {
  "tableName": "blogs",
  "columnName": "likes",
  "columnType": "INTEGER",
  "constraints": "DEFAULT 0"
}
*/

collectionRouter.post('/alter', CollectionManager.alterCollection)

/**
{
    "collectionName":"blogs"
}
*/

collectionRouter.post('/delete-collection', CollectionManager.deleteCollection)

/**
 it is a GET query -  duhhh :D
*/

collectionRouter.get('/', CollectionManager.getAllCollections)

/*
 ** Get a specific collection by name
 */
collectionRouter.get('/:tableName', CollectionManager.getCollectionByName)

/*
 ** Delete an attribute (column) from a collection
 */
collectionRouter.post(
  '/attribute/delete',
  CollectionManager.deleteAttributeFromCollection
)

/*
 ** Get all data from a specific collection
 */
collectionRouter.get('/data/:tableName', CollectionManager.getCollectionData)

export default collectionRouter
