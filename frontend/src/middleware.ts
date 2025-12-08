import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('lassuauth.token')?.value;

  const loginURL = new URL('/', request.url);
  const homeURL = new URL('/home', request.url);

  // Verifica se a rota atual exige proteção
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/home') || 
    request.nextUrl.pathname.startsWith('/primeiroAcesso');

  // CASO 1: Sem token tentando acessar rota protegida -> Manda pro Login
  if (!token) {
    if (isProtectedRoute) {
      return NextResponse.redirect(loginURL);
    }
  }

  // CASO 2: Com token tentando acessar a tela de Login -> Manda pra Home
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
    '/primeiroAcesso',
  ]
};