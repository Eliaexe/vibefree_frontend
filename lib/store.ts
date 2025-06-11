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
interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        name: string;
        images: { url: string; }[];
    };
    external_urls: {
        spotify: string;
    }
}

// Define the shape of a Spotify Saved Album
interface SavedAlbum {
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
  // For view management
  currentView: View;
  selectedAlbumId: string | null;
  selectedArtistId: string | null;
}

type Actions = {
  setUser: (user: SpotifyUser | null) => void;
  setTopTracks: (tracks: SpotifyTrack[]) => void;
  setSavedAlbums: (albums: SavedAlbum[]) => void;
  logout: () => void;
  // For view management
  showHome: () => void;
  showAlbumDetails: (albumId: string) => void;
  showArtistDetails: (artistId: string) => void;
}

export const useUserStore = create<State & Actions>((set) => ({
  user: null,
  isLoggedIn: false,
  topTracks: [],
  savedAlbums: [],
  // For view management
  currentView: 'home',
  selectedAlbumId: null,
  selectedArtistId: null,
  setUser: (user) => {
    set({ user, isLoggedIn: !!user });
  },
  setTopTracks: (tracks) => {
    set({ topTracks: tracks });
  },
  setSavedAlbums: (albums) => {
    set({ savedAlbums: albums });
  },
  logout: () => {
    set({ user: null, isLoggedIn: false, topTracks: [], savedAlbums: [], currentView: 'home' });
    // Here you might want to call an API endpoint to clear the httpOnly cookies
    // For example: fetch('/api/spotify/logout', { method: 'POST' });
  },
  // For view management
  showHome: () => set({ currentView: 'home', selectedAlbumId: null, selectedArtistId: null }),
  showAlbumDetails: (albumId: string) => set({ currentView: 'albumDetails', selectedAlbumId: albumId }),
  showArtistDetails: (artistId: string) => set({ currentView: 'artistDetails', selectedArtistId: artistId }),
})) 