'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useUserStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      const exchangeToken = async () => {
        try {
          const response = await fetch('/api/spotify/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error('Failed to exchange token');
          }

          // Now that cookies are set, we can fetch user data
          const userResponse = await fetch('/api/spotify/me');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
          }
          
          // Redirect to home page after successful login
          router.push('/');

        } catch (err) {
          setError('Authentication failed. Please try again.');
          // Optionally redirect back to login
          // router.push('/login');
        }
      };

      exchangeToken();
    } else {
      setError('No authorization code found.');
    }
  }, [searchParams, router, setUser]);

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Authenticating...</h1>
      <p>Please wait while we log you in.</p>
    </div>
  );
}