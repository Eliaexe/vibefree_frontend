import Image from 'next/image';
import { SpotifyTrack } from '@/lib/store';

interface SongCardProps {
    track: SpotifyTrack;
}

export default function SongCard({ track }: SongCardProps) {
    const imageUrl = track.album?.images?.[0]?.url;

    return (
        <div className="group cursor-pointer">
            {imageUrl ? (
                <Image 
                    src={imageUrl} 
                    alt={track.name} 
                    width={192} 
                    height={192} 
                    className="w-full h-auto object-cover rounded-md aspect-square"
                />
            ) : (
                <div className="w-full bg-muted rounded-md aspect-square flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No Image</p>
                </div>
            )}
            <div className="mt-2">
                <p className="font-semibold truncate group-hover:underline">{track.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                    {track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                </p>
            </div>
        </div>
    );
}