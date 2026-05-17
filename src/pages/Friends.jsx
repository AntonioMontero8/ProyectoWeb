import { useState } from 'react';
import { Users, UserPlus, Search, Clock, Trash2 } from 'lucide-react';
import { mockFriendsData, suggestedFriends } from '../data/mockFriends';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

function Friends() {
  const [activeTab, setActiveTab] = useState('friends');
  const [query, setQuery] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const [friendsList, setFriendsList] = useState(mockFriendsData);
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h2>Inicia sesión para ver a tus amigos</h2>
        <p>Conéctate con otros y descubre qué están escuchando.</p>
      </div>
    );
  }

  const handleSendRequest = (id) => {
    setSentRequests([...sentRequests, id]);
  };

  const handleDeleteFriend = (id) => {
    setFriendsList(friendsList.filter(f => f.id !== id));
  };

  const filteredSuggested = suggestedFriends.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.username.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="page-container">
      <h1 className="page-title">Gestión de Amigos</h1>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button 
          className={`btn-secondary ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
          style={activeTab === 'friends' ? { backgroundColor: 'var(--surface-hover)', color: 'white' } : { border: 'none', background: 'none' }}
        >
          <Users size={20} /> Mis Amigos
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
          style={activeTab === 'add' ? { backgroundColor: 'var(--surface-hover)', color: 'white' } : { border: 'none', background: 'none' }}
        >
          <UserPlus size={20} /> Añadir Amigos
        </button>
      </div>

      {activeTab === 'friends' && (
        <div>
          <h2 className="section-title">En línea y recientes</h2>
          <div className="settings-list" style={{ backgroundColor: 'transparent' }}>
            {friendsList.map(friend => {
              const isFriendPlaying = currentSong?.trackId === friend.currentSong.trackId && isPlaying;
              return (
                <div key={friend.id} className="settings-item" style={{ padding: '16px', borderRadius: '8px', borderBottom: 'none' }}>
                  <div className="settings-item-left" style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={friend.avatar} alt={friend.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '14px', height: '14px', borderRadius: '50%', backgroundColor: friend.status === 'online' ? '#10b981' : 'var(--text-secondary)', border: '2px solid var(--background-color)' }}></div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{friend.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{friend.username}</div>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer', color: isFriendPlaying ? 'var(--accent-color)' : 'var(--text-primary)' }}
                        onClick={() => playSong(friend.currentSong)}
                      >
                        <img src={friend.currentSong.artworkUrl100} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Escuchando: {friend.currentSong.trackName}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteFriend(friend.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', flexShrink: 0 }}
                      title="Eliminar amigo"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div>
          <div className="search-container" style={{ marginBottom: '32px' }}>
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar por nombre o usuario (@)..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <h2 className="section-title">Sugerencias para ti</h2>
          <div className="settings-list" style={{ backgroundColor: 'transparent' }}>
            {filteredSuggested.length > 0 ? filteredSuggested.map(user => {
              const isSent = sentRequests.includes(user.id);
              return (
                <div key={user.id} className="settings-item" style={{ padding: '16px', borderRadius: '8px', borderBottom: 'none' }}>
                  <div className="settings-item-left" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img src={user.avatar} alt={user.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{user.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.username}</div>
                    </div>
                  </div>
                  <button 
                    className={`btn-${isSent ? 'secondary' : 'primary'}`}
                    onClick={() => handleSendRequest(user.id)}
                    disabled={isSent}
                  >
                    {isSent ? <><Clock size={16} /> Enviada</> : <><UserPlus size={16} /> Añadir</>}
                  </button>
                </div>
              );
            }) : (
              <p style={{ color: 'var(--text-secondary)' }}>No se encontraron usuarios.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;
