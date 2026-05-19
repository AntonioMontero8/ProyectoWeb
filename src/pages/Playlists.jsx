import { useState } from 'react';
import { usePlaylists } from '../context/PlaylistContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, ListMusic, MoreVertical, Edit2, Trash2, X } from 'lucide-react';

function Playlists() {
  const { playlists, createPlaylist, updatePlaylist, deletePlaylist } = usePlaylists();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <ListMusic size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h2>Inicia sesión para crear playlists</h2>
        <p>Guarda y organiza tus canciones favoritas.</p>
      </div>
    );
  }

  const handleOpenModal = (playlist = null) => {
    if (playlist) {
      setEditingId(playlist.id);
      setName(playlist.name);
      setDescription(playlist.description);
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updatePlaylist(editingId, name, description);
    } else {
      createPlaylist(name, description);
    }
    setShowModal(false);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Mis Playlists</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Nueva Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '64px' }}>
          <ListMusic size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h2>Aún no tienes playlists</h2>
          <p>Crea tu primera playlist para guardar tus canciones favoritas.</p>
        </div>
      ) : (
        <div className="horizontal-list" style={{ flexWrap: 'wrap', overflowX: 'visible', justifyContent: 'flex-start' }}>
          {playlists.map(playlist => (
            <div key={playlist.id} className="card" style={{ marginBottom: '16px', position: 'relative' }}>
              <div 
                className="card-img" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-color)' }}
                onClick={() => navigate(`/playlists/${playlist.id}`)}
              >
                {playlist.songs && playlist.songs.length > 0 ? (
                  <img src={playlist.songs[0].artworkUrl100.replace('100x100', '200x200')} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                ) : (
                  <ListMusic size={48} color="var(--text-secondary)" />
                )}
              </div>
              
              <div className="card-title" onClick={() => navigate(`/playlists/${playlist.id}`)}>{playlist.name}</div>
              <div className="card-subtitle">{playlist.songs?.length || 0} canciones</div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(playlist); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <Edit2 size={16} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
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
            <h2 className="form-title">{editingId ? 'Editar Playlist' : 'Nueva Playlist'}</h2>
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
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Playlists;
