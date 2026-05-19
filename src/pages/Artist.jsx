import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, ListVideo, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useAuth } from '../context/AuthContext';

function Artist() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const { playSong, currentSong, isPlaying, addToQueue } = usePlayer();
  const { playlists, addSongToPlaylist } = usePlaylists();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song&limit=7`).then(res => res.json()),
      fetch(`https://itunes.apple.com/lookup?id=${id}&entity=album`).then(res => res.json())
    ])
      .then(([songDataResponse, albumDataResponse]) => {
        if (songDataResponse.results && songDataResponse.results.length > 0) {
          const artistData = songDataResponse.results.find(item => item.wrapperType === 'artist') || albumDataResponse.results.find(item => item.wrapperType === 'artist');
          const songData = songDataResponse.results.filter(item => item.wrapperType === 'track');
          const albumData = albumDataResponse.results.filter(item => item.wrapperType === 'collection');
          
          setArtist(artistData || songData[0] || albumData[0]);
          setSongs(songData);
          setAlbums(albumData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="page-container"><p>Cargando artista...</p></div>;
  if (!artist) return <div className="page-container"><p>Artista no encontrado.</p></div>;

  const artistImage = songs.length > 0 ? songs[0].artworkUrl100.replace('100x100', '300x300') : null;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', marginTop: '20px' }}>
        {artistImage ? (
          <img 
            src={artistImage} 
            alt={artist.artistName} 
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} 
          />
        ) : (
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', fontWeight: 'bold', color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            {artist.artistName ? artist.artistName.charAt(0) : '?'}
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '48px', margin: '0 0 8px 0' }}>{artist.artistName}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discografía y canciones populares</p>
        </div>
      </div>

      <h2 className="section-title">Canciones populares</h2>
      <div className="settings-list" style={{ backgroundColor: 'transparent', marginBottom: '40px' }}>
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
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                  <img src={song.artworkUrl100} style={{ width: '40px', height: '40px', borderRadius: '4px', flexShrink: 0 }} alt="Cover" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ color: isThisPlaying ? 'var(--accent-color)' : 'white', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={song.trackName}>{song.trackName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.collectionName}</div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === song.trackId ? null : song.trackId); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', flexShrink: 0, marginLeft: '8px' }}
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

      <h2 className="section-title">Álbumes y EP's</h2>
      <div className="horizontal-list" style={{ flexWrap: 'wrap', overflowX: 'visible', justifyContent: 'flex-start' }}>
        {albums.map((album) => (
          <div key={album.collectionId} className="card" style={{ marginBottom: '16px' }} onClick={() => navigate(`/album/${album.collectionId}`)}>
            <div style={{ position: 'relative' }}>
              <img src={album.artworkUrl100.replace('100x100', '200x200')} alt={album.collectionName} className="card-img" />
            </div>
            <div className="card-title" title={album.collectionName}>{album.collectionName}</div>
            <div className="card-subtitle">{new Date(album.releaseDate).getFullYear()} • {album.trackCount} canciones</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Artist;
