import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale } from './lib/i18n/index'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') && 
    !pathname.endsWith('/') &&
    !locales.some(locale => pathname === `/${locale}` || pathname === `/${locale}/`)
  ) {
    return NextResponse.next()
  }

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      if (pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      // For login page, add pathname to headers so layout can skip auth
      const response = NextResponse.next()
      response.headers.set('x-pathname', pathname)
      return response
    }

    // Basic token format check (JWT has 3 parts separated by dots)
    // Full verification happens in layout
    const tokenParts = token.split('.')
    const isValidFormat = tokenParts.length === 3 && tokenParts.every(part => part.length > 0)
    
    if (!isValidFormat) {
      // Invalid token format - clear cookie and redirect to login
      if (pathname !== '/admin/login') {
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('admin-token')
        return response
      }
      // On login page, just clear cookie
      const response = NextResponse.next()
      response.cookies.delete('admin-token')
      response.headers.set('x-pathname', pathname)
      return response
    }

    // Token exists and has valid format - let layout handle full verification
    // Don't redirect from login page automatically - let layout verify token first
    // This prevents redirect loops with invalid tokens
    if (pathname === '/admin/login') {
      // Only redirect if we're sure token is valid (we can't verify in middleware)
      // So we let the layout handle it - if token is invalid, layout will redirect back
      const response = NextResponse.next()
      response.headers.set('x-pathname', pathname)
      return response
    }

    // Add pathname to headers for layout
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)
    return response
  }

  // i18n routing for public pages
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (static assets like .png, .jpg, .json, .webmanifest, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|json|webmanifest|xml|txt|css|js|woff|woff2|ttf|eot)).*)',
    '/admin/:path*',
  ],
}