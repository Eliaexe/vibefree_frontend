import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.VIBEFREE_BACKEND_URL;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const backendUrl = `${BACKEND_URL}/cache-lookup?${searchParams.toString()}`;

    console.log(`[Next.js Proxy] Forwarding cache-lookup to: ${backendUrl}`);

    try {
        const backendResponse = await fetch(backendUrl);

        if (!backendResponse.ok) {
            const errorBody = await backendResponse.json().catch(() => ({ message: 'Unknown backend error' }));
            return NextResponse.json(
                { success: false, message: errorBody.message || 'Backend lookup failed.' },
                { status: backendResponse.status }
            );
        }

        const data = await backendResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('[Next.js Proxy] Internal error during cache-lookup:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error in Next.js proxy.' },
            { status: 500 }
        );
    }
} 