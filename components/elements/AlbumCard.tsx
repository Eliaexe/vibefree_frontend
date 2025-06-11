import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useUserStore } from "@/lib/store";
import { MouseEvent } from "react";

// A generic Album object that fits both search results and saved albums
interface Album {
    id: string;
    name: string;
    artists: { name: string }[];
    images: { url: string; }[];
    external_urls: {
        spotify: string;
    };
}

export default function AlbumCard({ album }: { album: Album }) {
  const showAlbumDetails = useUserStore((state) => state.showAlbumDetails);
  const imageUrl = album.images?.[0]?.url;
  const artists = album.artists.map(artist => artist.name).join(', ');

  const handleClick = (e: MouseEvent) => {
    // Prevent navigation if it's a simple left-click
    if (!e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        showAlbumDetails(album.id);
    }
  }

  return (
    <a href={album.external_urls.spotify} onClick={handleClick} target="_blank" rel="noopener noreferrer">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader>
            {imageUrl && (
                <div className="mb-4">
                    <Image src={imageUrl} alt={album.name} width={200} height={200} className="rounded-md w-full h-auto" />
                </div>
            )}
            <div>
                <CardTitle className="text-lg truncate">{album.name}</CardTitle>
                <CardDescription>{artists}</CardDescription>
            </div>
        </CardHeader>
        </Card>
    </a>
  );
}
