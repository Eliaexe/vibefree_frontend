import Image from 'next/image';
import { useUserStore } from '@/lib/store';

// Assuming Album is a type defined somewhere, let's create a basic one for props
interface Album {
    id: string;
    name: string;
    artists: { name: string }[];
    images: { url: string }[];
}

interface AlbumCardProps {
    album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
    const { showAlbumDetails } = useUserStore();
    const imageUrl = album.images?.[0]?.url;

    const handleCardClick = () => {
        showAlbumDetails(album.id);
    };

    return (
        <div className="group cursor-pointer" onClick={handleCardClick}>
            {imageUrl ? (
                <Image 
                    src={imageUrl} 
                    alt={album.name} 
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
                <p className="font-semibold truncate group-hover:underline">{album.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                    {album.artists?.map(a => a.name).join(', ') || 'Various Artists'}
                </p>
            </div>
        </div>
    );
}
