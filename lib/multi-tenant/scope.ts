import { SelectQueryBuilder, ObjectLiteral } from 'typeorm'
import { initializeDatabase } from '@/lib/db/database'

// Cache for agency context (in-memory cache, resets on server restart)
const agencyContextCache = new Map<string, { agencyId?: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Multi-tenant data scoping utilities
 * Ensures strict data isolation between agencies
 */

export interface AgencyContext {
  agencyId?: string
  userId: string
  role: 'super_admin' | 'admin' | 'staff'
}

/**
 * Scope a query builder to an agency
 * Super admins can see all agencies
 */
export function scopeToAgency<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  context: AgencyContext,
  alias: string = 'entity'
): SelectQueryBuilder<T> {
  // Super admins can see all agencies
  if (context.role === 'super_admin') {
    return queryBuilder
  }

  // Other roles are scoped to their agency
  if (context.agencyId) {
    return queryBuilder.andWhere(`${alias}.agencyId = :agencyId`, {
      agencyId: context.agencyId,
    })
  }

  // No agency ID means no access
  return queryBuilder.andWhere('1 = 0')
}

/**
 * Get agency context from session
 * If agencyId is not in session, fetch it from database
 */
export async function getAgencyContext(session: {
  userId: string
  email: string
  role: string
  agencyId?: string
}): Promise<AgencyContext> {
  // If agencyId is already in session, use it
  if (session.agencyId) {
    return {
      agencyId: session.agencyId,
      userId: session.userId,
      role: session.role as 'super_admin' | 'admin' | 'staff',
    }
  }

  // Super admins don't need agencyId
  if (session.role === 'super_admin') {
    return {
      userId: session.userId,
      role: 'super_admin',
    }
  }

  // Check cache first
  const cacheKey = session.userId
  const cached = agencyContextCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      agencyId: cached.agencyId,
      userId: session.userId,
      role: session.role as 'super_admin' | 'admin' | 'staff',
    }
  }

  // Fetch agencyId from database
  try {
    const dataSource = await initializeDatabase()
    const User = require('@/entities/User').User
    const userRepository = dataSource.getRepository(User)
    
    // Only select necessary fields for better performance
    const user = await userRepository.findOne({
      where: { id: session.userId },
      select: ['id', 'agencyId'],
    })

    if (user && user.agencyId) {
      // Cache the result
      agencyContextCache.set(cacheKey, { agencyId: user.agencyId, timestamp: Date.now() })
      return {
        agencyId: user.agencyId,
        userId: session.userId,
        role: session.role as 'super_admin' | 'admin' | 'staff',
      }
    }

    // If user has no agency, try to get the first active agency (fallback)
    const Agency = require('@/entities/Agency').Agency
    const agencyRepository = dataSource.getRepository(Agency)
    const firstAgency = await agencyRepository.findOne({
      where: { isActive: true },
      select: ['id'],
      order: { createdAt: 'ASC' },
    })

    if (firstAgency) {
      // Update user's agencyId for future requests
      if (user) {
        user.agencyId = firstAgency.id
        await userRepository.save(user)
      }
      // Cache the result
      agencyContextCache.set(cacheKey, { agencyId: firstAgency.id, timestamp: Date.now() })
      return {
        agencyId: firstAgency.id,
        userId: session.userId,
        role: session.role as 'super_admin' | 'admin' | 'staff',
      }
    }
  } catch (error) {
    console.error('Error fetching agency context:', error)
  }

  // Return context without agencyId (will fail validation in API routes)
  // But log the issue for debugging
  console.error('getAgencyContext: No agencyId found for user:', session.userId, 'role:', session.role)
  return {
    userId: session.userId,
    role: session.role as 'super_admin' | 'admin' | 'staff',
  }
}