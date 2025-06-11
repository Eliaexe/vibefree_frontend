'use client';

import { useUserStore } from "@/lib/store";
import Image from "next/image";
import { Button } from "../ui/button";
import { XIcon, PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";


export default function PlayerFooter() {
    const { isPlayerVisible, activeTrack, hidePlayer } = useUserStore();

    if (!isPlayerVisible || !activeTrack) {
        return null;
    }

    const imageUrl = activeTrack.album?.images?.[0]?.url;

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
            <div className="container mx-auto flex items-center justify-between">
                {/* Track Info */}
                <div className="flex items-center gap-4">
                    {imageUrl && (
                        <Image src={imageUrl} alt={activeTrack.album.name} width={56} height={56} className="rounded-md" />
                    )}
                    <div>
                        <p className="font-bold">{activeTrack.name}</p>
                        <p className="text-sm text-muted-foreground">{activeTrack.artists.map(a => a.name).join(', ')}</p>
                    </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                        <SkipBackIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="default" size="icon" className="rounded-full h-10 w-10">
                        <PlayIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <SkipForwardIcon className="h-5 w-5" />
                    </Button>
                </div>

                {/* Close Button */}
                <Button onClick={hidePlayer} variant="ghost" size="icon">
                    <XIcon className="h-5 w-5" />
                </Button>
            </div>
        </footer>
    );
}