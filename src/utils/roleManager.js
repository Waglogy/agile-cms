// Role management utilities
const ROLE_KEY = 'user_role'

export const setUserRole = (role) => {
  localStorage.setItem(ROLE_KEY, role)
}

export const getUserRole = () => {
  return localStorage.getItem(ROLE_KEY) || 'content_manager' // default to content_manager if no role set
}

export const clearUserRole = () => {
  localStorage.removeItem(ROLE_KEY)
}

// Helper function to check if user has access to a specific role
export const hasRoleAccess = (requiredRole) => {
  const currentRole = getUserRole()
  return currentRole === requiredRole
}

// Helper function to check if user has admin access
export const isAdmin = () => {
  return getUserRole() === 'content_admin'
}
