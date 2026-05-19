import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useComments } from '../context/CommentsContext';
import { useAuth } from '../context/AuthContext';

function SongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { getCommentsForEntity, addComment } = useComments();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          setSong(data.results[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="page-container"><p>Cargando canción...</p></div>;
  if (!song) return <div className="page-container"><p>Canción no encontrada.</p></div>;

  const isThisPlaying = currentSong?.trackId === song.trackId && isPlaying;
  const comments = getCommentsForEntity(song.trackId);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim() && user) {
      addComment(song.trackId, user, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeft size={20} /> Volver
      </button>

      {/* Hero Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={song.artworkUrl100?.replace('100x100', '400x400')} 
            alt={song.trackName} 
            style={{ width: '280px', height: '280px', borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }} 
          />
          <button 
            onClick={() => playSong(song)}
            style={{
              position: 'absolute',
              bottom: '-28px',
              right: '24px',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isThisPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </button>
        </div>
        
        <div style={{ marginTop: '16px' }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', lineHeight: 1.2 }}>{song.trackName}</h1>
          <p 
            style={{ color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer', margin: 0 }}
            onClick={() => navigate(`/artist/${song.artistId}`)}
          >
            {song.artistName}
          </p>
          <p 
            style={{ color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', margin: '8px 0 0 0' }}
            onClick={() => navigate(`/album/${song.collectionId}`)}
          >
            Álbum: <strong style={{ color: 'white' }}>{song.collectionName}</strong>
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={24} color="var(--accent-color)" /> Comentarios ({comments.length})
        </h2>

        {/* Formulario */}
        {user ? (
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <img src={user.picture || 'https://i.pravatar.cc/150?img=68'} alt="Tú" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Añade un comentario público..."
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
            <p style={{ margin: 0 }}>Inicia sesión para dejar un comentario y unirte a la conversación.</p>
          </div>
        )}

        {/* Lista de Comentarios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {comments.map((comment) => (
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
    </div>
  );
}

export default SongDetail;
