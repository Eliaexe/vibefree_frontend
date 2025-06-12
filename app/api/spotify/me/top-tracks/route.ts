import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token not found' }, { status: 401 });
  }

  // Spotify API allows for time_range parameter. Let's make it available.
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('time_range') || 'medium_term'; // short_term, medium_term, long_term

  const response = await fetch(`${SPOTIFY_API_BASE}/me/top/tracks?time_range=${timeRange}&limit=20`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.json();
    console.error("Spotify API Error fetching top tracks:", errorDetails);
    return NextResponse.json(errorDetails, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
} 