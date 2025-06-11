import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });

  // Clear the cookies on the response
  response.cookies.set('spotify_access_token', '', { maxAge: 0 });
  response.cookies.set('spotify_refresh_token', '', { maxAge: 0 });

  return response;
} 