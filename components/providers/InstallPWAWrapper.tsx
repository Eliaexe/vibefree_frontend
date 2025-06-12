'use client';

import dynamic from 'next/dynamic';

// Import InstallPWA dynamically to avoid client-side only code issues
const InstallPWA = dynamic(() => import('@/components/InstallPWA'), { 
  ssr: false 
});

export default function InstallPWAWrapper() {
  return <InstallPWA />;
} 