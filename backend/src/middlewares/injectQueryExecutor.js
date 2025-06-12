import QueryExecutorFactory from '../services/QueryExecutorFactory.js'
import AppError from '../utils/AppError.js' // ✅ Required for proper error handling

export default function injectQueryExecutor(req, res, next) {
  try {
    req.queryExecutor = QueryExecutorFactory.forSession(req.sessionID)
    next()
  } catch (err) {
    next(new AppError(400, 'No database connection found', err.message))
  }
}
