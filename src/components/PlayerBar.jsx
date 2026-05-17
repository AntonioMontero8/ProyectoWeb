import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, ListVideo, X, GripVertical, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

function PlayerBar() {
  const { currentSong, isPlaying, togglePlay, progress, currentTime, duration, seek, volume, setVolume, isMuted, toggleMute, queue, removeFromQueue, reorderQueue, playNext, isShuffle, toggleShuffle, isRepeat, toggleRepeat } = usePlayer();
  const navigate = useNavigate();
  const [showQueue, setShowQueue] = useState(false);

  const handleVolumeChange = (e) => {
    if (e.type === 'pointermove' && e.buttons !== 1) return;
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const percentage = clickPosition / progressBar.offsetWidth;
    setVolume(Math.max(0, Math.min(1, percentage)));
  };

  const handleSeek = (e) => {
    if (!currentSong) return;
    if (e.type === 'pointermove' && e.buttons !== 1) return;
    seek(e);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (draggedIndex !== index) {
      reorderQueue(draggedIndex, index);
    }
  };

  return (
    <div className="player-bar">
      <div className="player-info">
        {currentSong ? (
          <img 
            src={currentSong.artworkUrl100} 
            alt="Cover" 
            className="player-cover" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/album/${currentSong.collectionId}`)}
          />
        ) : (
          <div className="player-cover"></div>
        )}
        <div className="player-text">
          <div 
            className="player-title" 
            style={{ cursor: currentSong ? 'pointer' : 'default' }}
            onClick={() => currentSong && navigate(`/album/${currentSong.collectionId}`)}
          >
            {currentSong ? currentSong.trackName : 'Ninguna canción'}
          </div>
          <div 
            className="player-artist" 
            style={{ cursor: currentSong ? 'pointer' : 'default' }}
            onClick={() => currentSong && navigate(`/artist/${currentSong.artistId}`)}
          >
            {currentSong ? currentSong.artistName : 'Selecciona una canción'}
          </div>
        </div>
      </div>
      
      <div className="player-controls">
        <div className="control-buttons">
          <button 
            className={`control-btn secondary hide-mobile ${isShuffle ? 'active' : ''}`} 
            onClick={toggleShuffle}
            style={isShuffle ? { color: 'var(--accent-color)' } : {}}
          >
            <Shuffle size={18} />
          </button>
          <button className="control-btn"><SkipBack size={24} /></button>
          <button className="control-btn play" style={{ paddingLeft: (!isPlaying) ? '2px' : '0px' }} onClick={togglePlay}>
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button className="control-btn" onClick={playNext}><SkipForward size={24} /></button>
          <button 
            className={`control-btn secondary hide-mobile ${isRepeat ? 'active' : ''}`} 
            onClick={toggleRepeat}
            style={isRepeat ? { color: 'var(--accent-color)' } : {}}
          >
            <Repeat size={18} />
          </button>
        </div>
        
        <div className="progress-bar-container">
          <span>{currentSong ? currentTime : '0:00'}</span>
          <div 
            className="progress-bar" 
            style={{ touchAction: 'none' }}
            onPointerDown={handleSeek}
            onPointerMove={handleSeek}
          >
            <div className="progress-fill" style={{ width: currentSong ? `${progress}%` : '0%', pointerEvents: 'none' }}></div>
          </div>
          <span>{currentSong ? duration : '0:00'}</span>
        </div>
      </div>

      <div className="player-actions">
        <div 
          style={{ cursor: 'pointer', display: 'flex', color: showQueue ? 'var(--accent-color)' : 'var(--text-secondary)' }} 
          onClick={() => setShowQueue(!showQueue)}
        >
          <ListVideo size={20} />
        </div>
        <div style={{ cursor: 'pointer', display: 'flex' }} onClick={toggleMute}>
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </div>
        <div 
          className="progress-bar" 
          style={{ width: '80px', touchAction: 'none' }} 
          onPointerDown={handleVolumeChange}
          onPointerMove={handleVolumeChange}
        >
           <div className="progress-fill" style={{ width: isMuted ? '0%' : `${volume * 100}%`, pointerEvents: 'none' }}></div>
        </div>
      </div>

      {showQueue && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          right: '16px',
          width: '320px',
          maxHeight: '400px',
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-color)' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Cola de reproducción</h3>
            <button onClick={() => setShowQueue(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {queue.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 16px' }}>La cola está vacía</p>
            ) : (
              queue.map((song, index) => (
                <div 
                  key={`${song.trackId}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '8px', 
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ cursor: 'grab', marginRight: '8px', color: 'var(--text-secondary)' }}>
                    <GripVertical size={16} />
                  </div>
                  <img src={song.artworkUrl100} alt={song.trackName} style={{ width: '32px', height: '32px', borderRadius: '4px', marginRight: '12px' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.trackName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artistName}</div>
                  </div>
                  <button 
                    onClick={() => removeFromQueue(index)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerBar;
