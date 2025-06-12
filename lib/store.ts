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
  searchTerm: string;
  // For view management
  currentView: View;
  selectedAlbumId: string | null;
  selectedArtistId: string | null;
  // For player management
  activeTrack: ActiveTrack | null;
  isPlayerVisible: boolean;
  playQueue: SpotifyTrack[];
  currentTrackIndex: number | null;
  isTrackLoading: boolean;
}

type Actions = {
  setUser: (user: SpotifyUser | null) => void;
  setTopTracks: (tracks: SpotifyTrack[]) => void;
  setSavedAlbums: (albums: SavedAlbum[]) => void;
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
}

const fetchTrackUrl = async (track: SpotifyTrack): Promise<string | null> => {
  if (!track) return null;

  const params = new URLSearchParams({
    songName: track.name,
    artistName: track.artists.map(a => a.name).join(', '),
    durationMs: track.duration_ms.toString(),
  });

  try {
    const response = await fetch(`http://localhost:3001/download?${params.toString()}`);
    if (!response.ok) {
      console.error(`Error fetching track URL: ${response.statusText}`);
      const errorBody = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      throw new Error(errorBody.message || 'Backend responded with an error');
    }
    const data = await response.json();
    if (data.success && data.url) {
      return data.url;
    } else {
      throw new Error(data.message || 'Backend did not return a valid URL.');
    }
  } catch (error) {
    console.error('Failed to fetch track URL from backend:', error);
    // Optionally, you could set an error state here
    return null;
  }
};

export const useUserStore = create<State & Actions>((set, get) => ({
  user: null,
  isLoggedIn: false,
  topTracks: [],
  savedAlbums: [],
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
  setUser: (user) => {
    set({ user, isLoggedIn: !!user });
  },
  setTopTracks: (tracks) => {
    set({ topTracks: tracks });
  },
  setSavedAlbums: (albums) => {
    set({ savedAlbums: albums });
  },
  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },
  logout: () => {
    set({ user: null, isLoggedIn: false, topTracks: [], savedAlbums: [], searchTerm: '', currentView: 'home', isPlayerVisible: false, activeTrack: null, playQueue: [], currentTrackIndex: null, isTrackLoading: false });
    // Here you might want to call an API endpoint to clear the httpOnly cookies
    // For example: fetch('/api/spotify/logout', { method: 'POST' });
  },
  // For view management
  showHome: () => set({ currentView: 'home', selectedAlbumId: null, selectedArtistId: null }),
  showAlbumDetails: (albumId: string) => set({ currentView: 'albumDetails', selectedAlbumId: albumId }),
  showArtistDetails: (artistId: string) => set({ currentView: 'artistDetails', selectedArtistId: artistId }),
  // For player management
  playTracks: async (tracks, startIndex) => {
    const newTrack = tracks[startIndex];
    set({
      playQueue: tracks,
      currentTrackIndex: startIndex,
      activeTrack: newTrack,
      isPlayerVisible: true,
      isTrackLoading: true,
    });
    const url = await fetchTrackUrl(newTrack);
    set(state => ({
      // Only update if the track is still the active one
      activeTrack: state.activeTrack?.id === newTrack.id ? { ...newTrack, url: url ?? undefined } : state.activeTrack,
      isTrackLoading: false
    }));
  },
  hidePlayer: () => set({ isPlayerVisible: false, activeTrack: null, isTrackLoading: false }),
  playNext: async () => {
    const { playQueue, currentTrackIndex } = get();
    if (playQueue.length > 0 && currentTrackIndex !== null) {
      const nextIndex = currentTrackIndex + 1;
      if (nextIndex < playQueue.length) {
        const nextTrack = playQueue[nextIndex];
        set({ currentTrackIndex: nextIndex, activeTrack: nextTrack, isTrackLoading: true });
        const url = await fetchTrackUrl(nextTrack);
        set(state => ({
          activeTrack: state.activeTrack?.id === nextTrack.id ? { ...nextTrack, url: url ?? undefined } : state.activeTrack,
          isTrackLoading: false
        }));
      } else {
        set({ isPlayerVisible: false, activeTrack: null, currentTrackIndex: null, playQueue: [], isTrackLoading: false }); // Clear queue when it ends
      }
    }
  },
  playPrevious: async () => {
    const { playQueue, currentTrackIndex } = get();
    if (playQueue.length > 0 && currentTrackIndex !== null) {
      const prevIndex = currentTrackIndex - 1;
      if (prevIndex >= 0) {
        const prevTrack = playQueue[prevIndex];
        set({ currentTrackIndex: prevIndex, activeTrack: prevTrack, isTrackLoading: true });
        const url = await fetchTrackUrl(prevTrack);
        set(state => ({
          activeTrack: state.activeTrack?.id === prevTrack.id ? { ...prevTrack, url: url ?? undefined } : state.activeTrack,
          isTrackLoading: false
        }));
      }
    }
  },
})) 