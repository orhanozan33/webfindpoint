import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './session'
import { UserRole, hasPermission, requireRole } from './roles'

export interface AuthorizeOptions {
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: keyof import('./roles').RolePermissions
}

export async function authorize(
  request: NextRequest,
  options: AuthorizeOptions = {}
): Promise<{ authorized: boolean; session?: any; response?: NextResponse }> {
  const session = await getSession()

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Check role requirement
  if (options.requiredRole) {
    if (!requireRole(session.role as UserRole, options.requiredRole)) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden: Insufficient role' }, { status: 403 }),
      }
    }
  }

  // Check permission requirement
  if (options.requiredPermission) {
    if (!hasPermission(session.role as UserRole, options.requiredPermission)) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 }),
      }
    }
  }

  return {
    authorized: true,
    session,
  }
}