import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const userSession = req.cookies.get('user');
  const sessionEnd = req.cookies.get('user-expiration')?.value;

  if (
    userSession &&
    sessionEnd &&
    new Date(sessionEnd).getTime() > Date.now()
  ) {
    if (
      req.nextUrl.pathname === '/sign-in' ||
      req.nextUrl.pathname === '/sign-up'
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (
    !userSession ||
    !sessionEnd ||
    new Date(sessionEnd).getTime() < Date.now()
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/history', '/RESTful', '/variables', '/sign-in'],
};
