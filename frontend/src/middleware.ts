import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/auth') && token) return NextResponse.redirect(new URL('/', request.url));
  if (pathname.startsWith('/auth') || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL('/auth/login', request.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secretKey');
    const { payload } = await jwtVerify(token, secret);

    const role = payload.role as string;
    const companyId = payload.companyId as string | null;

    if (pathname.startsWith('/admin')) {
      if (role !== 'superadmin') return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (pathname.startsWith('/proveedor')) {
      if (role !== 'proveedor') return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (pathname.startsWith('/companies')) {
      if (!role.startsWith('empresa')) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (role === 'empresa_owner' && !companyId) {
        if (pathname !== '/companies/onboarding') {
          return NextResponse.redirect(new URL('/companies/onboarding', request.url));
        }
      }

      if (role === 'empresa_owner' && companyId && pathname === '/companies/onboarding') {
         return NextResponse.redirect(new URL('/companies/dashboard', request.url));
      }
    }

    if (pathname === '/') {
      if (role === 'superadmin') return NextResponse.redirect(new URL('/admin', request.url));
      if (role === 'proveedor') return NextResponse.redirect(new URL('/proveedor', request.url));
      
      if (role.startsWith('empresa')) {
        if (role === 'empresa_owner' && !companyId) {
           return NextResponse.redirect(new URL('/companies/onboarding', request.url));
        }
        return NextResponse.redirect(new URL('/companies/dashboard', request.url));
      }
    }

    return NextResponse.next();

  } catch (error) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('access_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};