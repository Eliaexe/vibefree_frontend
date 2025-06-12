'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect browser
    const userAgent = navigator.userAgent.toLowerCase();
    setIsFirefox(userAgent.indexOf('firefox') > -1);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      // Show the install prompt
      installPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the saved prompt as it can't be used again
      setInstallPrompt(null);
    } else if (isFirefox) {
      // Show instructions for Firefox
      alert('Per installare su Firefox:\n\n1. Clicca sui tre puntini in alto a destra\n2. Seleziona "Installa app"\n3. Segui le istruzioni sullo schermo');
    } else if (isIOS) {
      // Show instructions for iOS
      alert('Per installare su iOS:\n\n1. Tocca l\'icona di condivisione (rettangolo con freccia verso l\'alto)\n2. Scorri verso il basso e tocca "Aggiungi a Home"\n3. Tocca "Aggiungi" in alto a destra');
    }
  };

  // Don't show anything if already installed
  if (isInstalled) return null;

  // Show install button even without prompt for Firefox and iOS
  const shouldShow = installPrompt !== null || isFirefox || isIOS;

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 mx-auto max-w-md p-4 bg-card rounded-lg shadow-lg border border-border">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium">Installa VibeFree</h3>
          <p className="text-sm text-muted-foreground">Accedi più velocemente e usa offline</p>
        </div>
        <Button onClick={handleInstallClick} className="ml-4">
          <Download className="mr-2 h-4 w-4" />
          Installa
        </Button>
      </div>
    </div>
  );
} 