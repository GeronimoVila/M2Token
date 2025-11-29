import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {

  const token = request.cookies.get('access_token')

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
}