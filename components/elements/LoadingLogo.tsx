import Image from 'next/image';

interface LoadingLogoProps {
  showText?: boolean;
}

export default function LoadingLogo({ showText = true }: LoadingLogoProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="flex items-end justify-center h-10 gap-1">
        <div className="w-2 h-4 bg-primary rounded-full animate-bar-wave" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-4 bg-primary rounded-full animate-bar-wave" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-4 bg-primary rounded-full animate-bar-wave" style={{ animationDelay: '0.4s' }}></div>
      </div>
      {showText && <p className="text-muted-foreground">Loading...</p>}
    </div>
  );
} 