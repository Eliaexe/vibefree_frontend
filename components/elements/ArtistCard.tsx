import Image from 'next/image';
import { useUserStore } from '@/lib/store';

// A generic Artist object that fits search results
interface Artist {
    id: string;
    name: string;
    images: { url: string }[];
    type: string; // To display "Artist"
}

interface ArtistCardProps {
    artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
    const { showArtistDetails } = useUserStore();
    const imageUrl = artist.images?.[0]?.url;

    const handleCardClick = () => {
        showArtistDetails(artist.id);
    };

    return (
        <div className="group cursor-pointer text-center" onClick={handleCardClick}>
            {imageUrl ? (
                <Image 
                    src={imageUrl} 
                    alt={artist.name} 
                    width={192} 
                    height={192} 
                    className="w-full h-auto object-cover rounded-full aspect-square"
                />
            ) : (
                <div className="w-full bg-muted rounded-full aspect-square flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No Image</p>
                </div>
            )}
            <div className="mt-2">
                <p className="font-semibold truncate group-hover:underline">{artist.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{artist.type}</p>
            </div>
        </div>
    );
} 