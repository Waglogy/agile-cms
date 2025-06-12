import { userConnections } from '../utils/userConnections.util.js'

// Middleware to check if user has selected a database
export function requireDatabaseSelection(req, res, next) {
  const userConnection = userConnections.get(req.sessionID)

  if (!userConnection) {
    return res.status(400).json({
      success: false,
      error: 'No database selected. Please select a database first.',
      hint: 'Use POST /api/select-database to select a database',
    })
  }

  req.userDb = userConnection
  next()
}
