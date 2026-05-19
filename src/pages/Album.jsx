import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, MoreVertical, ListVideo, Check, Share2, X, MessageSquare, Send } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useComments } from '../context/CommentsContext';
import { mockFriendsData } from '../data/mockFriends';

function Album() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const { playSong, currentSong, isPlaying, addToQueue } = usePlayer();
  const { playlists, addSongToPlaylist } = usePlaylists();
  const { shareSong } = useChat();
  const { user } = useAuth();
  const { getCommentsForEntity, addComment } = useComments();
  const navigate = useNavigate();
  const [shareModalSong, setShareModalSong] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

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
              onClick={() => navigate(`/song/${song.trackId}`)}
              style={{ padding: '12px 16px', borderRadius: '8px', borderBottom: 'none', position: 'relative', cursor: 'pointer' }}
            >
              <div className="settings-item-left" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                <div 
                  onClick={(e) => { e.stopPropagation(); playSong(song, songs); }}
                  style={{ width: '30px', textAlign: 'center', color: 'var(--text-secondary)', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Reproducir canción"
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {isThisPlaying ? <Pause size={16} color="var(--accent-color)" /> : <Play size={16} />}
                </div>
                <div style={{ flex: 1, overflow: 'hidden', marginLeft: '8px' }}>
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

      {/* Comments Section */}
      <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: '16px', padding: '24px', marginTop: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={24} color="var(--accent-color)" /> Comentarios del Álbum
        </h2>

        {/* Formulario */}
        {user ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (newComment.trim() && user) {
                addComment(album.collectionId, user, newComment.trim());
                setNewComment('');
              }
            }} 
            style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}
          >
            <img src={user.picture || 'https://i.pravatar.cc/150?img=68'} alt="Tú" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="¿Qué opinas de este álbum?"
                style={{ 
                  flex: 1, 
                  backgroundColor: 'var(--bg-color)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)', 
                  padding: '12px 16px', 
                  borderRadius: '24px', 
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                style={{ 
                  width: '44px', height: '44px', borderRadius: '50%', 
                  backgroundColor: newComment.trim() ? 'var(--accent-color)' : 'var(--surface-hover)', 
                  color: newComment.trim() ? 'white' : 'var(--text-secondary)',
                  border: 'none', cursor: newComment.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Send size={18} style={{ marginLeft: '-2px' }} />
              </button>
            </div>
          </form>
        ) : (
          <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0 }}>Inicia sesión para dejar un comentario en este álbum.</p>
          </div>
        )}

        {/* Lista de Comentarios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(getCommentsForEntity(album.collectionId) || []).map((comment) => (
            <div key={comment.id} style={{ display: 'flex', gap: '16px' }}>
              <img src={comment.user.avatar} alt={comment.user.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{comment.user.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {new Date(comment.timestamp).toLocaleDateString()} a las {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: 'var(--text-primary)' }}>{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

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

export default Album;
