'use client';

import { useState, useEffect } from 'react';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';

export default function LoadingExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [isContainerLoading, setIsContainerLoading] = useState(false);

  const simulateFullPageLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const simulateContainerLoading = () => {
    setIsContainerLoading(true);
    setTimeout(() => setIsContainerLoading(false), 2000);
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-lg font-medium mb-4">Loading a pagina intera</h2>
        <Button onClick={simulateFullPageLoading}>
          Mostra loading pagina intera
        </Button>
        {isLoading && <Loading fullPage />}
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Loading in un container</h2>
        <div className="border border-border rounded-md h-40 relative">
          {isContainerLoading ? (
            <Loading />
          ) : (
            <div className="p-4">
              <p>Contenuto del container</p>
              <Button onClick={simulateContainerLoading} className="mt-4">
                Mostra loading nel container
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 