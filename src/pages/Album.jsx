import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, ListVideo, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useAuth } from '../context/AuthContext';

function Album() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const { playSong, currentSong, isPlaying, addToQueue } = usePlayer();
  const { playlists, addSongToPlaylist } = usePlaylists();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const albumData = data.results.find(item => item.wrapperType === 'collection');
          const songData = data.results.filter(item => item.wrapperType === 'track');
          setAlbum(albumData || songData[0]); 
          setSongs(songData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="page-container"><p>Cargando álbum...</p></div>;
  if (!album) return <div className="page-container"><p>Álbum no encontrado.</p></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '40px', marginTop: '20px' }}>
        <img 
          src={album.artworkUrl100?.replace('100x100', '300x300') || album.artworkUrl100} 
          alt={album.collectionName} 
          style={{ width: '200px', height: '200px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} 
        />
        <div>
          <p style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>Álbum</p>
          <h1 style={{ fontSize: '48px', margin: '4px 0 8px 0', lineHeight: 1.1 }}>{album.collectionName}</h1>
          <p 
            style={{ color: 'var(--text-secondary)', cursor: 'pointer', display: 'inline-block' }}
            onClick={() => navigate(`/artist/${album.artistId}`)}
          >
            <strong style={{ color: 'white' }}>{album.artistName}</strong> • {album.trackCount} canciones
          </p>
        </div>
      </div>

      <div className="settings-list" style={{ backgroundColor: 'transparent' }}>
        {songs.map((song, index) => {
          const isThisPlaying = currentSong?.trackId === song.trackId && isPlaying;
          return (
            <div 
              key={song.trackId} 
              className="settings-item" 
              onClick={() => playSong(song, songs)}
              style={{ padding: '12px 16px', borderRadius: '8px', borderBottom: 'none', position: 'relative' }}
            >
              <div className="settings-item-left" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '30px', textAlign: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {isThisPlaying ? <Pause size={16} color="var(--accent-color)" /> : index + 1}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ color: isThisPlaying ? 'var(--accent-color)' : 'white', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={song.trackName}>{song.trackName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artistName}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === song.trackId ? null : song.trackId); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {activeMenu === song.trackId && (
                <div 
                  style={{
                    position: 'absolute',
                    right: '16px',
                    marginTop: '36px',
                    backgroundColor: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    minWidth: '160px'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <button 
                    className="settings-item" 
                    style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', fontSize: '13px' }}
                    onClick={(e) => { e.stopPropagation(); addToQueue(song); setActiveMenu(null); }}
                  >
                    <div className="settings-item-left">
                      <ListVideo size={16} /> Agregar a cola
                    </div>
                  </button>
                  {user && (
                    <>
                      <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 12px' }}>Agregar a playlist:</div>
                      {playlists.map(p => (
                        <button 
                          key={p.id}
                          className="settings-item" 
                          style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', fontSize: '13px' }}
                          onClick={(e) => { e.stopPropagation(); addSongToPlaylist(p.id, song); setActiveMenu(null); }}
                        >
                          <div className="settings-item-left" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{p.name}</span>
                            {p.songs.some(s => s.trackId === song.trackId) && <Check size={14} color="var(--accent-color)" />}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Album;
