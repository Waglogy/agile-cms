import {Router} from 'express'
import {
  alterCollection,
  createTable,
  deleteAttributeFromCollection,
  deleteCollection,
  deleteData,
  getAllCollections,
  getCollectionByName,
  getCollectionData,
  insertData,
  updateData,
  publishData,
  getPublishedContent,
  getSystemLogs,
  rollbackData,
  getArchivedContent,
  archiveData,
} from '../controllers/collection.controllers.js'
import upload from '../config/multer.config.js'
import injectQueryExecutor from '../middlewares/injectQueryExecutor.js'
import {requireDatabaseSelection} from "../middlewares/databaseSelection.middleware.js";
// import injectQueryExecutor from '../middlewares/injectQueryExecutor'

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
collectionRouter.post('/create', requireDatabaseSelection, injectQueryExecutor, createTable)

collectionRouter.post('/rollback', rollbackData)
collectionRouter.get('/archived/:tableName', getArchivedContent)
collectionRouter.post('/collection/archive', archiveData)

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
 
    
    upload.any(),
    injectQueryExecutor,
    insertData
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
collectionRouter.post('/update', injectQueryExecutor, updateData)

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
collectionRouter.post('/delete', injectQueryExecutor, deleteData)

/**
 {
 "tableName": "blogs",
 "columnName": "likes",
 "columnType": "INTEGER",
 "constraints": "DEFAULT 0"
 }
 */

collectionRouter.post('/alter/column', injectQueryExecutor, alterCollection)

/**
 {
 "collectionName":"blogs"
 }
 */

collectionRouter.post(
    '/delete-collection',
    injectQueryExecutor,
    deleteCollection
)

/**
 it is a GET query -  duhhh :D
 */

collectionRouter.get(
    '/',
    injectQueryExecutor,
    getAllCollections
)

/*
 ** Get a specific collection by name
 */
collectionRouter.get('/:tableName', injectQueryExecutor, getCollectionByName)

/*
 ** Delete an attribute (column) from a collection
 */
collectionRouter.post(
    '/attribute/delete',
    injectQueryExecutor,
    deleteAttributeFromCollection
)

/*
 ** Get all data from a specific collection
 */
collectionRouter.get('/data/:tableName', injectQueryExecutor, getCollectionData)

collectionRouter.post('/publish', injectQueryExecutor, publishData)
collectionRouter.get(
    '/published/:tableName',
    injectQueryExecutor,
    getPublishedContent
)
collectionRouter.get('/logs/system-logs', injectQueryExecutor, getSystemLogs)

export default collectionRouter
