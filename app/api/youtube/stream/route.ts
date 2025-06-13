import { NextRequest, NextResponse } from 'next/server';

// This is a Route Handler for the Next.js App Router.
// It acts as a proxy to the actual backend service.

const BACKEND_URL = process.env.VIBEFREE_BACKEND_URL || 'http://localhost:5501';

export async function GET(req: NextRequest) {
    // Extract search params from the incoming request
    const { searchParams } = new URL(req.url);

    // Forward the search params to the backend service
    const backendUrl = `${BACKEND_URL}/stream?${searchParams.toString()}`;

    console.log(`[Next.js Proxy] Forwarding stream request to: ${backendUrl}`);

    try {
        // Fetch the stream from the backend
        const backendResponse = await fetch(backendUrl);

        // Check if the backend responded successfully.
        // If not, we don't forward the body, we just return an error status.
        if (!backendResponse.ok || !backendResponse.body) {
            console.error(`[Next.js Proxy] Backend returned an error: ${backendResponse.status}`);
            // Return an empty response with the actual error code.
            // The browser will see this as a failed request for the audio source.
            return new NextResponse(null, { status: backendResponse.status });
        }

        // Get the readable stream from the backend response
        const stream = backendResponse.body;

        // Return a new response with the stream and appropriate headers
        return new NextResponse(stream, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-cache', // Ensure the browser doesn't cache the stream
            },
        });

    } catch (error) {
        console.error('[Next.js Proxy] Internal error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error in Next.js proxy.' },
            { status: 500 }
        );
    }
} 