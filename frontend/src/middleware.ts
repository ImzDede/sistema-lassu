import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('lassu.token')?.value;

  const loginURL = new URL('/', request.url);

  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/home') || 
    request.nextUrl.pathname.startsWith('/primeiroAcesso');

  // 1. Se NÃO tem token e tenta acessar rota privada -> Login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(loginURL);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/home/:path*',
    '/primeiroAcesso',
  ]
};