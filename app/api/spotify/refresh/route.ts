import { refreshToken } from '@/lib/spotify';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  const refresh_token = cookieStore.get('spotify_refresh_token')?.value;

  if (!refresh_token) {
    return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
  }

  const data = await refreshToken(refresh_token);

  if (data.error) {
    return NextResponse.json(data, { status: 400 });
  }

  cookieStore.set('spotify_access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: data.expires_in,
    path: '/',
  });

  // If a new refresh token is provided, update it
  if (data.refresh_token) {
      cookieStore.set('spotify_refresh_token', data.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          path: '/',
      });
  }

  return NextResponse.json({ ok: true });
} 