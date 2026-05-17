import { createContext, useContext, useState, useEffect } from 'react';

const PlaylistContext = createContext();

export const usePlaylists = () => useContext(PlaylistContext);

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem('music_playlists');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('music_playlists', JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = (name, description) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      songs: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  const updatePlaylist = (id, name, description) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name, description } : p));
  };

  const deletePlaylist = (id) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const addSongToPlaylist = (playlistId, song) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        // Prevent duplicates
        if (!p.songs.find(s => s.trackId === song.trackId)) {
          return { ...p, songs: [...p.songs, song] };
        }
      }
      return p;
    }));
  };

  const removeSongFromPlaylist = (playlistId, trackId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.trackId !== trackId) };
      }
      return p;
    }));
  };

  const reorderPlaylist = (playlistId, startIndex, endIndex) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const result = Array.from(p.songs);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { ...p, songs: result };
      }
      return p;
    }));
  };

  return (
    <PlaylistContext.Provider value={{
      playlists,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      reorderPlaylist
    }}>
      {children}
    </PlaylistContext.Provider>
  );
};
