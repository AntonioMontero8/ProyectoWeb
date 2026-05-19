import { useState, useEffect } from 'react';
import { Search, Play, Pause, User, MoreVertical, ListVideo, Plus, Check, Share2, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockFriendsData } from '../data/mockFriends';

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const { playSong, currentSong, isPlaying, addToQueue } = usePlayer();
  const { playlists, addSongToPlaylist } = usePlaylists();
  const { shareSong } = useChat();
  const { user } = useAuth();
  const [shareModalSong, setShareModalSong] = useState(null);

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2) {
        setLoading(true);
        Promise.all([
          fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=5`).then(res => res.json()),
          fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12`).then(res => res.json()),
          fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=6`).then(res => res.json())
        ])
          .then(([artistData, songData, albumData]) => {
            setArtistResults(artistData.results);
            setResults(songData.results);
            setAlbumResults(albumData.results);
            setLoading(false);
          })
          .catch(err => {
            console.error(err);
            setLoading(false);
          });
      } else {
        setResults([]);
        setArtistResults([]);
        setAlbumResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    fetch('https://itunes.apple.com/us/rss/topalbums/limit=10/json')
      .then(res => res.json())
      .then(data => {
        if (data?.feed?.entry) {
          setTopAlbums(data.feed.entry);
        }
      })
      .catch(err => console.error(err));
  }, []);

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

      {albumResults.length > 0 && (
        <>
          <h2 className="section-title">Álbumes</h2>
          <div className="horizontal-list" style={{ flexWrap: 'wrap', overflowX: 'visible', justifyContent: 'flex-start' }}>
            {albumResults.map((album) => (
              <div 
                key={album.collectionId} 
                className="card" 
                onClick={() => navigate(`/album/${album.collectionId}`)}
                style={{ marginBottom: '16px' }}
              >
                <img src={album.artworkUrl100.replace('100x100', '200x200')} alt={album.collectionName} className="card-img" />
                <div className="card-title" title={album.collectionName}>{album.collectionName}</div>
                <div className="card-subtitle">{album.artistName}</div>
              </div>
            ))}
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
                <div key={song.trackId} className="card" onClick={() => navigate(`/song/${song.trackId}`)} style={{ marginBottom: '16px', position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={song.artworkUrl100.replace('100x100', '200x200')} alt={song.trackName} className="card-img" />
                    <div 
                      onClick={(e) => { e.stopPropagation(); playSong(song); }}
                      style={{
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
                        opacity: isThisPlaying ? 1 : 0.8,
                        transition: 'transform 0.1s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
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
                      {user && (
                        <>
                          <button 
                            className="settings-item" 
                            style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', fontSize: '13px' }}
                            onClick={(e) => { e.stopPropagation(); setShareModalSong(song); setActiveMenu(null); }}
                          >
                            <div className="settings-item-left">
                              <Share2 size={16} /> Compartir con amigo
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
                        </>
                      )}
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
          <h2 className="section-title">Álbumes más escuchados en el momento</h2>
          <div className="horizontal-list">
            {topAlbums.length > 0 ? topAlbums.map((album) => {
              const albumId = album.id.attributes['im:id'];
              const name = album['im:name'].label;
              const artist = album['im:artist'].label;
              const image = album['im:image'][2].label.replace('170x170bb', '300x300bb');

              return (
                <div key={albumId} className="card" onClick={() => navigate(`/album/${albumId}`)}>
                  <div style={{ position: 'relative' }}>
                    <img src={image} alt={name} className="card-img" />
                  </div>
                  <div className="card-title" title={name}>{name}</div>
                  <div className="card-subtitle" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist}</div>
                </div>
              );
            }) : (
              <p style={{ color: 'var(--text-secondary)' }}>Cargando álbumes...</p>
            )}
          </div>

          {user && (
            <>
              <h2 className="section-title">Actividad de amigos</h2>
              <div className="horizontal-list">
                {mockFriendsData.map((friend) => {
                  const isFriendPlaying = currentSong?.trackId === friend.currentSong.trackId && isPlaying;
                  return (
                    <div 
                      key={`friend-${friend.id}`} 
                      className="card" 
                      onClick={() => playSong(friend.currentSong)}
                      style={{ minWidth: '140px', position: 'relative', overflow: 'hidden' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={friend.currentSong.artworkUrl100.replace('100x100', '200x200')} 
                          alt={friend.currentSong.trackName} 
                          className="card-img"
                          style={{ opacity: 0.7, objectFit: 'cover' }}
                        />
                        <img 
                          src={friend.avatar} 
                          alt={friend.name}
                          style={{ 
                            position: 'absolute', 
                            bottom: '8px', 
                            right: '8px', 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%',
                            border: '2px solid var(--surface-color)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                          }} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: friend.status === 'online' ? '#10b981' : 'var(--text-secondary)' }}></div>
                          {friend.time}
                        </div>
                      </div>
                      <div className="card-title" style={{ marginTop: '8px' }}>{friend.name}</div>
                      <div className="card-subtitle" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isFriendPlaying ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                        🎵 {friend.currentSong.trackName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {shareModalSong && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShareModalSong(null)}>
          <div style={{
            backgroundColor: 'var(--surface-color)', padding: '24px',
            borderRadius: '16px', width: '90%', maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Compartir canción</h3>
              <button onClick={() => setShareModalSong(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', backgroundColor: 'var(--bg-color)', padding: '12px', borderRadius: '12px' }}>
              <img src={shareModalSong.artworkUrl100} alt={shareModalSong.trackName} style={{ width: '64px', height: '64px', borderRadius: '8px' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{shareModalSong.trackName}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{shareModalSong.artistName}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Enviar a:</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {mockFriendsData.map(friend => (
                <button 
                  key={friend.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    padding: '12px', background: 'none', border: 'none',
                    color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '8px',
                    transition: 'background-color 0.2s', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    shareSong(friend.id, shareModalSong);
                    setShareModalSong(null);
                    alert(`Canción compartida con ${friend.name}`);
                  }}
                >
                  <img src={friend.avatar} alt={friend.name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>{friend.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
