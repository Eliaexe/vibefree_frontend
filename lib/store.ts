import { create } from 'zustand'

// Define the shape of the Spotify user profile
interface SpotifyUser {
  display_name: string;
  email: string;
  id: string;
  images: { url: string; height: number; width: number }[];
  // Add other fields you might need from the Spotify user object
}

// Define the shape of a Spotify Track
export interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        name: string;
        images: { url: string; }[];
    };
    duration_ms: number;
    external_urls: {
        spotify: string;
    }
}

// Interfaccia per la traccia attiva, che può contenere l'URL del player
export type ActiveTrack = SpotifyTrack & { url?: string };

// Define the shape of a Spotify Saved Album
export interface SavedAlbum {
    added_at: string;
    album: {
        id: string;
        name: string;
        artists: { name: string }[];
        images: { url: string; }[];
        external_urls: {
            spotify: string;
        }
    }
}

type View = 'home' | 'albumDetails' | 'artistDetails';

type State = {
  user: SpotifyUser | null;
  isLoggedIn: boolean;
  topTracks: SpotifyTrack[];
  savedAlbums: SavedAlbum[];
  savedTracks: SpotifyTrack[];
  searchTerm: string;
  // For view management
  currentView: View;
  selectedAlbumId: string | null;
  selectedArtistId: string | null;
  // For player management
  activeTrack: ActiveTrack | null;
  isPlayerVisible: boolean;
  playQueue: ActiveTrack[];
  currentTrackIndex: number | null;
  isTrackLoading: boolean;
  isPlayerExpanded: boolean;
  trackProgress: {
    currentTime: number;
    duration: number;
  };
}

type Actions = {
  setUser: (user: SpotifyUser | null) => void;
  setTopTracks: (tracks: SpotifyTrack[]) => void;
  setSavedAlbums: (albums: SavedAlbum[]) => void;
  setSavedTracks: (tracks: SpotifyTrack[]) => void;
  setSearchTerm: (term: string) => void;
  logout: () => void;
  // For view management
  showHome: () => void;
  showAlbumDetails: (albumId: string) => void;
  showArtistDetails: (artistId: string) => void;
  // For player management
  playTracks: (tracks: SpotifyTrack[], startIndex: number) => Promise<void>;
  hidePlayer: () => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setPlayerExpanded: (isExpanded: boolean) => void;
  setTrackProgress: (progress: { currentTime: number; duration: number; }) => void;
  preloadNextTracks: () => Promise<void>;
}

// This function just constructs the URL for the streaming endpoint.
const getStreamUrl = (track: SpotifyTrack): string | null => {
  if (!track) return null;
  const params = new URLSearchParams({
    songName: track.name,
    artistName: track.artists.map(a => a.name).join(', '),
    durationMs: track.duration_ms.toString(),
  });
  return `/api/youtube/stream?${params.toString()}`;
};

// This function calls the backend to warm up the cache for a track.
const preloadTrack = async (track: SpotifyTrack): Promise<void> => {
  if (!track) return;
  console.log(`[Preload] Inizio pre-caricamento per: ${track.name}`);
  const params = new URLSearchParams({
    songName: track.name,
    artistName: track.artists.map(a => a.name).join(', '),
    durationMs: track.duration_ms.toString(),
  });
  try {
    const response = await fetch(`/api/youtube/cache-lookup?${params.toString()}`);
    if (response.ok) {
        console.log(`[Preload] Successo per: ${track.name}`);
    } else {
        console.warn(`[Preload] Fallito per: ${track.name}`);
    }
  } catch (error) {
      console.error(`[Preload] Errore di rete per: ${track.name}`, error);
  }
};

export const useUserStore = create<State & Actions>((set, get) => ({
  user: null,
  isLoggedIn: false,
  topTracks: [],
  savedAlbums: [],
  savedTracks: [],
  searchTerm: '',
  // For view management
  currentView: 'home',
  selectedAlbumId: null,
  selectedArtistId: null,
  // For player management
  activeTrack: null,
  isPlayerVisible: false,
  playQueue: [],
  currentTrackIndex: null,
  isTrackLoading: false,
  isPlayerExpanded: false,
  trackProgress: { currentTime: 0, duration: 0 },
  setUser: (user) => {
    set({ user, isLoggedIn: !!user });
  },
  setTopTracks: (tracks) => {
    set({ topTracks: tracks });
  },
  setSavedAlbums: (albums) => {
    set({ savedAlbums: albums });
  },
  setSavedTracks: (tracks) => {
    set({ savedTracks: tracks });
  },
  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },
  logout: () => {
    set({ user: null, isLoggedIn: false, topTracks: [], savedAlbums: [], savedTracks: [], searchTerm: '', currentView: 'home', isPlayerVisible: false, activeTrack: null, playQueue: [], currentTrackIndex: null, isTrackLoading: false, isPlayerExpanded: false });
    // Here you might want to call an API endpoint to clear the httpOnly cookies
    // For example: fetch('/api/spotify/logout', { method: 'POST' });
  },
  // For view management
  showHome: () => set({ currentView: 'home', selectedAlbumId: null, selectedArtistId: null }),
  showAlbumDetails: (albumId: string) => set({ currentView: 'albumDetails', selectedAlbumId: albumId }),
  showArtistDetails: (artistId: string) => set({ currentView: 'artistDetails', selectedArtistId: artistId }),
  // Player Actions with Preloading
  playTracks: async (tracks, startIndex) => {
    const newActiveTrack = tracks[startIndex];
    set({
      playQueue: tracks.map(t => ({...t})),
      currentTrackIndex: startIndex,
      activeTrack: { ...newActiveTrack, url: getStreamUrl(newActiveTrack) ?? undefined },
      isPlayerVisible: true,
      isTrackLoading: false, // The audio element handles loading state
    });
    get().preloadNextTracks();
  },
  hidePlayer: () => set({ isPlayerVisible: false, activeTrack: null, isTrackLoading: false }),
  playNext: async () => {
    const { playQueue, currentTrackIndex } = get();
    if (currentTrackIndex === null || currentTrackIndex >= playQueue.length - 1) {
      set({ isPlayerVisible: false, activeTrack: null });
      return;
    }
    const nextIndex = currentTrackIndex + 1;
    const nextTrack = playQueue[nextIndex];
    set({
        currentTrackIndex: nextIndex,
        activeTrack: { ...nextTrack, url: getStreamUrl(nextTrack) ?? undefined },
    });
    get().preloadNextTracks();
  },
  playPrevious: async () => {
    const { playQueue, currentTrackIndex } = get();
    if (currentTrackIndex === null || currentTrackIndex === 0) return;
    const prevIndex = currentTrackIndex - 1;
    const prevTrack = playQueue[prevIndex];
    set({
        currentTrackIndex: prevIndex,
        activeTrack: { ...prevTrack, url: getStreamUrl(prevTrack) ?? undefined },
    });
    get().preloadNextTracks();
  },
  preloadNextTracks: async () => {
    const { playQueue, currentTrackIndex } = get();
    if (currentTrackIndex === null) return;
    const preloadDepth = 2;
    for (let i = 1; i <= preloadDepth; i++) {
        const targetIndex = currentTrackIndex + i;
        if (targetIndex < playQueue.length) {
            // No need to check for URL, just trigger the preload
            preloadTrack(playQueue[targetIndex]);
        }
    }
  },
  setPlayerExpanded: (isExpanded) => {
    set({ isPlayerExpanded: isExpanded });
  },
  setTrackProgress: (progress) => {
    set({ trackProgress: progress });
  }
})) 