import { NextResponse } from 'next/server';
import querystring from 'querystring';

export async function GET() {
  const scope = 'user-read-private user-read-email user-top-read user-library-read streaming user-modify-playback-state';
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/auth/callback';

  const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: redirect_uri,
    });

  return NextResponse.redirect(authUrl);
} 