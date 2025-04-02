import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const userSession = req.cookies.get('user');

  if (
    !userSession &&
    ['/history', '/RESTful', '/variables'].includes(req.nextUrl.pathname)
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/history', '/RESTful', '/variables'],
};
