import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token not found' }, { status: 401 });
  }

  const response = await fetch(`${SPOTIFY_API_BASE}/me/albums?limit=20`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.json();
    console.error("Spotify API Error fetching saved albums:", errorDetails);
    return NextResponse.json(errorDetails, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
} 