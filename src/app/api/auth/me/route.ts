import { NextResponse, NextRequest } from 'next/server';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { user: null },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      );
    }
    const user = verifyToken(token);
    return NextResponse.json(
      { user },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch {
    return NextResponse.json(
      { user: null },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  }
}
