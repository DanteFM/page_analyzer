import { NextRequest, NextResponse } from "next/server";

export const OWNER_COOKIE = "owner_id";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const existing = request.cookies.get(OWNER_COOKIE);

  if (!existing) {
    const ownerId = crypto.randomUUID();

    response.cookies.set(OWNER_COOKIE, ownerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/'
    })
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // для игнорирования статики
  ],
};