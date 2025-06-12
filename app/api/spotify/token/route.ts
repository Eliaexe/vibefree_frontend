import { getTokenFromAuthCode } from '@/lib/spotify';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { code } = await request.json();
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/auth/callback';

  if (!code) {
    return NextResponse.json({ error: 'Code not found' }, { status: 400 });
  }

  const data = await getTokenFromAuthCode(code, redirect_uri);

  if (data.error) {
    return NextResponse.json(data, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set('spotify_access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: data.expires_in,
    path: '/',
  });

  cookieStore.set('spotify_refresh_token', data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
  });

  return NextResponse.json({ ok: true });
} 