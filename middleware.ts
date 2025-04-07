import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const userSession = req.cookies.get('user');
  const restrictedPaths = ['/history', '/RESTful', '/variables'];
  const regex = /^\/([a-zA-Z-]{2,3})?(\/(history|RESTful|variables))$/;

  if (!userSession && restrictedPaths.some((_path) => regex.test(pathname))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/([a-zA-Z-]{2,3})?/history',
    '/([a-zA-Z-]{2,3})?/RESTful',
    '/([a-zA-Z-]{2,3})?/variables',
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ],
};
