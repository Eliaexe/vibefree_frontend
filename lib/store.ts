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
    const newPlayQueue: ActiveTrack[] = tracks.map(t => ({...t})); // Create a queue of ActiveTracks

    set({
      playQueue: newPlayQueue,
      currentTrackIndex: startIndex,
      activeTrack: newActiveTrack,
      isPlayerVisible: true,
      isTrackLoading: true,
    });

    const url = await fetchTrackUrl(newActiveTrack);
    set(state => {
      const updatedQueue = state.playQueue.map((track, index) => 
        index === startIndex ? { ...track, url: url ?? undefined } : track
      );
      return {
        activeTrack: { ...newActiveTrack, url: url ?? undefined },
        playQueue: updatedQueue,
        isTrackLoading: false,
      };
    });

    get().preloadNextTracks();
  },
  hidePlayer: () => set({ isPlayerVisible: false, activeTrack: null, isTrackLoading: false }),
  playNext: async () => {
    const { playQueue, currentTrackIndex, preloadNextTracks } = get();
    if (currentTrackIndex === null || currentTrackIndex >= playQueue.length - 1) {
      set({ isPlayerVisible: false, activeTrack: null });
      return;
    }

    const nextIndex = currentTrackIndex + 1;
    const nextTrack = playQueue[nextIndex];

    set({ currentTrackIndex: nextIndex, activeTrack: nextTrack, isTrackLoading: !nextTrack.url });

    if (!nextTrack.url) {
      const url = await fetchTrackUrl(nextTrack);
      set(state => {
        const updatedQueue = state.playQueue.map((track, index) =>
          index === nextIndex ? { ...track, url: url ?? undefined } : track
        );
        return {
          activeTrack: { ...nextTrack, url: url ?? undefined },
          playQueue: updatedQueue,
          isTrackLoading: false,
        };
      });
    }
    
    preloadNextTracks();
  },
  playPrevious: async () => {
    const { playQueue, currentTrackIndex, preloadNextTracks } = get();
    if (currentTrackIndex === null || currentTrackIndex === 0) return;

    const prevIndex = currentTrackIndex - 1;
    const prevTrack = playQueue[prevIndex];

    set({ currentTrackIndex: prevIndex, activeTrack: prevTrack, isTrackLoading: !prevTrack.url });

    if (!prevTrack.url) {
      const url = await fetchTrackUrl(prevTrack);
      set(state => {
        const updatedQueue = state.playQueue.map((track, index) =>
          index === prevIndex ? { ...track, url: url ?? undefined } : track
        );
        return {
          activeTrack: { ...prevTrack, url: url ?? undefined },
          playQueue: updatedQueue,
          isTrackLoading: false,
        };
      });
    }

    preloadNextTracks();
  },
  preloadNextTracks: async () => {
    const { playQueue, currentTrackIndex } = get();
    if (currentTrackIndex === null) return;

    const preloadDepth = 2;
    for (let i = 1; i <= preloadDepth; i++) {
      const targetIndex = currentTrackIndex + i;
      if (targetIndex < playQueue.length) {
        const trackToPreload = playQueue[targetIndex];
        if (!trackToPreload.url) {
          fetchTrackUrl(trackToPreload).then(url => {
            if (url) {
              set(state => {
                const newPlayQueue = [...state.playQueue];
                if (newPlayQueue[targetIndex]?.id === trackToPreload.id) {
                  newPlayQueue[targetIndex] = { ...newPlayQueue[targetIndex], url };
                  return { playQueue: newPlayQueue };
                }
                return {};
              });
            }
          });
        }
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