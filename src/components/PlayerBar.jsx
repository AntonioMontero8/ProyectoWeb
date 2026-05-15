import { Play, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';

function PlayerBar() {
  return (
    <div className="player-bar">
      <div className="player-info">
        <div className="player-cover"></div>
        <div className="player-text">
          <div className="player-title">Canción de ejemplo</div>
          <div className="player-artist">Artista desconocido</div>
        </div>
      </div>
      
      <div className="player-controls">
        <div className="control-buttons">
          <button className="control-btn secondary hide-mobile"><Shuffle size={18} /></button>
          <button className="control-btn"><SkipBack size={24} /></button>
          <button className="control-btn play" style={{ paddingLeft: '2px' }}><Play size={18} fill="currentColor" /></button>
          <button className="control-btn"><SkipForward size={24} /></button>
          <button className="control-btn secondary hide-mobile"><Repeat size={18} /></button>
        </div>
        
        <div className="progress-bar-container">
          <span>1:23</span>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span>3:45</span>
        </div>
      </div>

      <div className="player-actions">
        <Volume2 size={20} />
        <div className="progress-bar" style={{ width: '80px' }}>
           <div className="progress-fill" style={{ width: '70%' }}></div>
        </div>
      </div>
    </div>
  );
}

export default PlayerBar;
