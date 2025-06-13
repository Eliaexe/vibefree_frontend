import { NextRequest, NextResponse } from 'next/server';

// Questo endpoint fa da proxy sicuro verso il backend di VibeFree.
// Il front-end chiama questo endpoint, che a sua volta chiama il backend reale.
const BACKEND_URL = process.env.VIBEFREE_BACKEND_URL || 'http://localhost:5501';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Estrai i parametri dalla richiesta originale
  const songName = searchParams.get('songName');
  const artistName = searchParams.get('artistName');
  const durationMs = searchParams.get('durationMs');

  if (!songName || !artistName || !durationMs) {
    return NextResponse.json({ success: false, message: 'Missing required query parameters' }, { status: 400 });
  }

  const backendApiUrl = `${BACKEND_URL}/cache-lookup?songName=${encodeURIComponent(songName)}&artistName=${encodeURIComponent(artistName)}&durationMs=${durationMs}`;

  try {
    // Chiama il backend e attendi la sua risposta
    const backendResponse = await fetch(backendApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Se la risposta non è OK, inoltra l'errore
    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      return new NextResponse(errorData, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
      });
    }

    // Inoltra la risposta di successo al client
    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API PROXY ERROR] /cache-lookup:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred while proxying the request.' },
      { status: 500 }
    );
  }
} 