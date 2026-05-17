import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

function PlayerBar() {
  const { currentSong, isPlaying, togglePlay, progress, currentTime, duration, seek, volume, setVolume, isMuted, toggleMute } = usePlayer();
  const navigate = useNavigate();

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
          <button className="control-btn secondary hide-mobile"><Shuffle size={18} /></button>
          <button className="control-btn"><SkipBack size={24} /></button>
          <button className="control-btn play" style={{ paddingLeft: (!isPlaying) ? '2px' : '0px' }} onClick={togglePlay}>
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button className="control-btn"><SkipForward size={24} /></button>
          <button className="control-btn secondary hide-mobile"><Repeat size={18} /></button>
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
    </div>
  );
}

export default PlayerBar;
