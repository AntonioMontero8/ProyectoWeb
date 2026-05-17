import { useState, useEffect } from 'react';
import { Search, Play, Pause, User, MoreVertical, ListVideo, Plus, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const { playSong, currentSong, isPlaying, addToQueue } = usePlayer();
  const { playlists, addSongToPlaylist } = usePlaylists();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2) {
        setLoading(true);
        Promise.all([
          fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=5`).then(res => res.json()),
          fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12`).then(res => res.json())
        ])
          .then(([artistData, songData]) => {
            setArtistResults(artistData.results);
            setResults(songData.results);
            setLoading(false);
          })
          .catch(err => {
            console.error(err);
            setLoading(false);
          });
      } else {
        setResults([]);
        setArtistResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="page-container">
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Buscar canciones o artistas..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Buscando...</p>}

      {artistResults.length > 0 && (
        <>
          <h2 className="section-title">Artistas</h2>
          <div className="horizontal-list" style={{ flexWrap: 'wrap', overflowX: 'visible', justifyContent: 'flex-start' }}>
            {artistResults.map((artist) => {
              const matchingSong = results.find(song => song.artistId === artist.artistId);
              const artistImage = matchingSong ? matchingSong.artworkUrl100.replace('100x100', '200x200') : null;
              
              return (
                <div 
                  key={artist.artistId} 
                  className="card" 
                  onClick={() => navigate(`/artist/${artist.artistId}`)}
                  style={{ marginBottom: '16px', minWidth: '120px' }}
                >
                  <div style={{ position: 'relative' }}>
                    {artistImage ? (
                      <img 
                        src={artistImage} 
                        alt={artist.artistName} 
                        className="card-img circular" 
                        style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div className="card-img circular" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-hover)', width: '120px', height: '120px', borderRadius: '50%' }}>
                         <User size={40} color="var(--text-secondary)" />
                      </div>
                    )}
                  </div>
                  <div className="card-title" style={{ textAlign: 'center', marginTop: '8px' }}>{artist.artistName}</div>
                  <div className="card-subtitle" style={{ textAlign: 'center' }}>Artista</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {results.length > 0 && (
        <>
          <h2 className="section-title">Canciones</h2>
          <div className="horizontal-list" style={{ flexWrap: 'wrap', overflowX: 'visible', justifyContent: 'flex-start' }}>
            {results.map((song) => {
              const isThisPlaying = currentSong?.trackId === song.trackId && isPlaying;
              return (
                <div key={song.trackId} className="card" onClick={() => playSong(song)} style={{ marginBottom: '16px', position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={song.artworkUrl100.replace('100x100', '200x200')} alt={song.trackName} className="card-img" />
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '8px',
                      backgroundColor: 'var(--accent-color)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      opacity: isThisPlaying ? 1 : 0.8
                    }}>
                      {isThisPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{marginLeft: '2px'}} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div className="card-title" title={song.trackName} style={{ cursor: 'pointer' }}>{song.trackName}</div>
                      <div className="card-subtitle" style={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={(e) => { e.stopPropagation(); navigate(`/artist/${song.artistId}`); }}>{song.artistName}</div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === song.trackId ? null : song.trackId); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', flexShrink: 0, marginLeft: '4px' }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {activeMenu === song.trackId && (
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '40px',
                        right: '0',
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
                            <span>{p.name}</span>
                            {p.songs.some(s => s.trackId === song.trackId) && <Check size={14} color="var(--accent-color)" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {results.length === 0 && !loading && (
        <>
          <h1 className="page-title">Descubre</h1>
          <h2 className="section-title">Escuchado recientemente</h2>
          <div className="horizontal-list">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={`recent-${item}`} className="card">
                <div className="card-img"></div>
                <div className="card-title">Mix Diario {item}</div>
                <div className="card-subtitle">Para ti</div>
              </div>
            ))}
          </div>

          <h2 className="section-title">Actividad de amigos</h2>
          <div className="horizontal-list">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={`friend-${item}`} className="card" style={{ minWidth: '100px' }}>
                <div className="card-img circular" style={{ width: '100px', height: '100px' }}></div>
                <div className="card-title" style={{ textAlign: 'center' }}>Amigo {item}</div>
                <div className="card-subtitle" style={{ textAlign: 'center' }}>Escuchando...</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
