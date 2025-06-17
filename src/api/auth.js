import { Roles } from '../store/roles'

export async function login(email, password) {
  await new Promise((r) => setTimeout(r, 500))

  // for demo: if email contains “admin” give you both roles
  const isAdmin = email.includes('admin')
  return {
    token: 'FAKE_JWT_TOKEN',
    user: {
      id: '123',
      name: isAdmin ? 'Alice Admin' : 'Bob Manager',
      roles: isAdmin
        ? [Roles.CONTENT_ADMIN, Roles.CONTENT_MANAGER]
        : [Roles.CONTENT_MANAGER],
    },
  }
}
