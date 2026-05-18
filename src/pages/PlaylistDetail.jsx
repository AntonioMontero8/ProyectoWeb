import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePlaylists } from '../context/PlaylistContext';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Shuffle, Trash2, ArrowLeft, GripVertical, ListMusic, Edit2, X, Search, Plus } from 'lucide-react';

function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, removeSongFromPlaylist, reorderPlaylist, updatePlaylist, addSongToPlaylist } = usePlaylists();
  const { playSong, currentSong, isPlaying, toggleShuffle, isShuffle } = usePlayer();
  const { user } = useAuth();
  
  const playlist = playlists.find(p => p.id === id);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=5`)
          .then(res => res.json())
          .then(data => {
            setSearchResults(data.results);
            setIsSearching(false);
          })
          .catch(err => {
            console.error(err);
            setIsSearching(false);
          });
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <ListMusic size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h2>Inicia sesión para ver playlists</h2>
      </div>
    );
  }

  if (!playlist) {
    return <div className="page-container">Playlist no encontrada</div>;
  }

  const handleOpenModal = () => {
    setName(playlist.name);
    setDescription(playlist.description);
    setSearchQuery('');
    setSearchResults([]);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    updatePlaylist(playlist.id, name, description);
    setShowModal(false);
  };

  const handlePlayAll = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (draggedIndex !== index) {
      reorderPlaylist(playlist.id, draggedIndex, index);
    }
  };

  return (
    <div className="page-container">
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '32px' }}>
        <div style={{ width: '200px', height: '200px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {playlist.songs && playlist.songs.length > 0 ? (
            <img src={playlist.songs[0].artworkUrl100.replace('100x100', '400x400')} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <ListMusic size={64} color="var(--text-secondary)" />
            </div>
          )}
        </div>
        <div>
          <h4 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', marginBottom: '8px' }}>Playlist</h4>
          <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 16px 0', lineHeight: 1 }}>{playlist.name}</h1>
          {playlist.description && <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{playlist.description}</p>}
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{playlist.songs?.length || 0} canciones</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <button 
          className="btn-primary" 
          onClick={handlePlayAll}
          disabled={!playlist.songs || playlist.songs.length === 0}
        >
          <Play size={20} fill="currentColor" />
          Reproducir
        </button>
        <button 
          className={`btn-secondary ${isShuffle ? 'active' : ''}`} 
          onClick={toggleShuffle}
          style={isShuffle ? { color: 'var(--accent-color)' } : {}}
        >
          <Shuffle size={20} />
          Aleatorio
        </button>
        <button 
          className="btn-secondary" 
          onClick={handleOpenModal}
        >
          <Edit2 size={20} />
          Editar
        </button>
      </div>

      {playlist.songs && playlist.songs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {playlist.songs.map((song, index) => {
            const isThisPlaying = currentSong?.trackId === song.trackId;
            return (
              <div 
                key={`${song.trackId}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  backgroundColor: 'var(--surface-color)', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: isThisPlaying ? '1px solid var(--accent-color)' : '1px solid transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-color)'}
                onClick={() => playSong(song, playlist.songs)}
              >
                <div style={{ cursor: 'grab', marginRight: '16px', color: 'var(--text-secondary)' }}>
                  <GripVertical size={20} />
                </div>
                <div style={{ width: '32px', color: isThisPlaying ? 'var(--accent-color)' : 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>
                  {isThisPlaying && isPlaying ? <Pause size={16} fill="currentColor" /> : (isThisPlaying ? <Play size={16} fill="currentColor" /> : index + 1)}
                </div>
                <img src={song.artworkUrl100} alt={song.trackName} style={{ width: '40px', height: '40px', borderRadius: '4px', margin: '0 16px' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: '600', color: isThisPlaying ? 'var(--accent-color)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.trackName}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artistName}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeSongFromPlaylist(playlist.id, song.trackId); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>No hay canciones en esta playlist.</p>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="form-container" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 className="form-title">Editar Playlist</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  autoFocus 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea 
                  className="form-input" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-group" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <label className="form-label">Buscar canciones para agregar</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Buscar canciones..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                {isSearching && <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>Buscando...</p>}
                {searchResults.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                    {searchResults.map(song => {
                      const isAdded = playlist.songs && playlist.songs.some(s => s.trackId === song.trackId);
                      return (
                        <div key={song.trackId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                            <img src={song.artworkUrl100} alt={song.trackName} style={{ width: '32px', height: '32px', borderRadius: '4px', marginRight: '12px' }} />
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.trackName}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artistName}</div>
                            </div>
                          </div>
                          {!isAdded ? (
                            <button
                              type="button"
                              onClick={() => addSongToPlaylist(playlist.id, song)}
                              style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', flexShrink: 0, marginLeft: '8px' }}
                            >
                              <Plus size={14} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>Añadida</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistDetail;
