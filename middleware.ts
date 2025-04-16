import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const userSession = req.cookies.get('user');
  const restrictedPaths = [
    'history',
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
    'HEAD',
  ];
  const regex =
    /^\/([a-zA-Z-]{2,3})?(\/(history|GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD))(\/.*)?$/;

  if (userSession && /\/(sign-in|sign-up)/.test(pathname)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!userSession && restrictedPaths.some((_path) => regex.test(pathname))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/([a-zA-Z-]{2,3})?/history',
    '/([a-zA-Z-]{2,3})?/GET/:path*',
    '/([a-zA-Z-]{2,3})?/POST/:path*',
    '/([a-zA-Z-]{2,3})?/PUT/:path*',
    '/([a-zA-Z-]{2,3})?/DELETE/:path*',
    '/([a-zA-Z-]{2,3})?/PATCH/:path*',
    '/([a-zA-Z-]{2,3})?/OPTIONS/:path*',
    '/([a-zA-Z-]{2,3})?/HEAD/:path*',
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ],
};
