import { userConnections } from '../utils/userConnections.util.js'
import jwt from "jsonwebtoken";

// Middleware to check if user has selected a database
export function requireDatabaseSelection(req, res, next) {
  const token = req.headers['auth-token'] || req.headers['authorization'];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Missing auth token',
    });
  }

  let payload;
  try {
    payload = jwt.verify(token, "TOP_SECRET_KEY");
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }


  // Extract connection ID
  const connectionId = payload.connectionId; // backward compatibility

  console.log(connectionId);

  if (!connectionId) {
    return res.status(400).json({
      success: false,
      error: 'Token does not contain a valid connection/session ID',
    });
  }

  const userConnection = userConnections.get(connectionId);

  if (!userConnection) {
    return res.status(400).json({
      success: false,
      error: 'No database selected. Please connect first.',
      hint: 'Use POST /api/init to select a database',
    });
  }

  // Store for use in other middleware
  req.connectionId = connectionId;
  req.userDb = userConnection;
  next();
}
