import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function GET(
  request: NextRequest,
  context: any    
) {
  const albumId = context.params.id;
  const accessToken = (await cookies()).get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token not found' }, { status: 401 });
  }

  const response = await fetch(`${SPOTIFY_API_BASE}/albums/${albumId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return NextResponse.json(await response.json(), { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
