import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Play, Pause } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { usePlayer } from '../context/PlayerContext';
import { mockFriendsData, suggestedFriends } from '../data/mockFriends';

function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { chats, sendMessage } = useChat();
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Encontrar al amigo en las listas mock
  const friendId = parseInt(id, 10);
  const friend = mockFriendsData.find(f => f.id === friendId) || suggestedFriends.find(f => f.id === friendId);
  const messages = chats[friendId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(friendId, inputText.trim());
      setInputText('');
    }
  };

  if (!friend) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <h2>Amigo no encontrado</h2>
        <button className="btn-primary" onClick={() => navigate('/friends')} style={{ marginTop: '16px' }}>Volver a Amigos</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', alignItems: 'center', padding: '16px 24px', 
        borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <button 
          onClick={() => navigate('/friends')} 
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', marginRight: '16px' }}
        >
          <ArrowLeft size={24} />
        </button>
        <img src={friend.avatar} alt={friend.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '12px' }} />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{friend.name}</div>
          <div style={{ fontSize: '12px', color: friend.status === 'online' ? '#10b981' : 'var(--text-secondary)' }}>
            {friend.status === 'online' ? 'En línea' : 'Desconectado'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
            Aún no hay mensajes. ¡Escríbele a {friend.name}!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ 
              alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.isMe ? 'flex-end' : 'flex-start'
            }}>
              {msg.type === 'text' ? (
                <div style={{
                  backgroundColor: msg.isMe ? 'var(--accent-color)' : 'var(--surface-color)',
                  color: msg.isMe ? 'white' : 'var(--text-primary)',
                  padding: '12px 16px',
                  borderRadius: msg.isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '15px'
                }}>
                  {msg.text}
                </div>
              ) : msg.type === 'song' ? (
                <div 
                  style={{
                    backgroundColor: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    width: '260px'
                  }}
                  onClick={() => playSong(msg.songData)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={msg.songData.artworkUrl100} alt={msg.songData.trackName} style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                      {currentSong?.trackId === msg.songData.trackId && isPlaying ? <Pause size={16} color="white" /> : <Play size={16} color="white" style={{marginLeft: '2px'}}/>}
                    </div>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.songData.trackName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.songData.artistName}</div>
                  </div>
                </div>
              ) : null}
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px 24px', backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Mensaje para ${friend.name}...`}
            style={{ 
              flex: 1, 
              backgroundColor: 'var(--bg-color)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-primary)', 
              padding: '12px 16px', 
              borderRadius: '24px', 
              outline: 'none',
              fontSize: '15px'
            }}
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              backgroundColor: inputText.trim() ? 'var(--accent-color)' : 'var(--surface-hover)', 
              color: inputText.trim() ? 'white' : 'var(--text-secondary)',
              border: 'none', cursor: inputText.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
          >
            <Send size={20} style={{ marginLeft: '-2px' }} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
