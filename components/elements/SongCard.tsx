import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

// Assuming the store now defines a SpotifyTrack type
import { useUserStore } from "@/lib/store";
import { MouseEvent } from "react";

// Get the track type from the store definition
type Track = ReturnType<typeof useUserStore.getState>['topTracks'][0];


export default function SongCard({ track }: { track: Track }) {
  const showPlayer = useUserStore((state) => state.showPlayer);
  const imageUrl = track.album?.images?.[0]?.url;
  const artists = track.artists.map(artist => artist.name).join(', ');

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    showPlayer(track);
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
        <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader className="flex-row items-center gap-4">
            {imageUrl && (
                <Image src={imageUrl} alt={track.album.name} width={64} height={64} className="rounded-md" />
            )}
            <div className="flex-1">
                <CardTitle className="text-lg">{track.name}</CardTitle>
                <CardDescription>{artists}</CardDescription>
            </div>
        </CardHeader>
        </Card>
    </div>
  );
}