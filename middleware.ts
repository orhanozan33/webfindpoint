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

  // Admin routes protection (simple cookie check - full verification in layout)
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

    // Token exists - let layout handle full verification
    // Already logged in, redirect from login page
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url))
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