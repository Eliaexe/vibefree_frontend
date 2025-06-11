import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useUserStore } from "@/lib/store";
import { MouseEvent } from "react";

// Define the type based on what the search API returns for artists
interface Artist {
    id: string;
    name: string;
    images: { url: string; }[];
    external_urls: {
        spotify: string;
    };
}

export default function ArtistCard({ artist }: { artist: Artist }) {
  const showArtistDetails = useUserStore((state) => state.showArtistDetails);
  const imageUrl = artist.images?.[0]?.url;

  const handleClick = (e: MouseEvent) => {
    // Prevent navigation if it's a simple left-click
    if (!e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        showArtistDetails(artist.id);
    }
  }

  return (
    <a href={artist.external_urls.spotify} onClick={handleClick} target="_blank" rel="noopener noreferrer">
        <Card className="hover:bg-muted/50 transition-colors text-center cursor-pointer">
            <CardHeader>
                {imageUrl ? (
                    <Image src={imageUrl} alt={artist.name} width={200} height={200} className="rounded-full w-32 h-32 mx-auto" />
                ) : (
                    <div className="w-32 h-32 mx-auto bg-muted rounded-full" />
                )}
                <CardTitle className="mt-4">{artist.name}</CardTitle>
            </CardHeader>
        </Card>
    </a>
  );
} 