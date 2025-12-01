import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('lassuauth.token')?.value;

  const loginURL = new URL('/', request.url);
  const homeURL = new URL('/home', request.url)

  if (!token) {
    if (
        request.nextUrl.pathname.startsWith('/home') || 
        request.nextUrl.pathname.startsWith('/cadastroExtensionista')
    ) {
      return NextResponse.redirect(loginURL);
    }
  }

  if (token) {
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(homeURL);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/home/:path*',
    '/cadastroExtensionista'
  ]
};