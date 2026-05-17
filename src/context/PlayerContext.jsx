import { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Queue state
  const [queue, setQueue] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Volume state
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  // Use a ref for the audio object so it persists across renders
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleEnded = () => {
      // Use queue state inside the event listener by putting the logic in a function that gets the latest state or using a ref
      // We will handle playNext inside a useEffect or by using an event listener that always has access to the latest state
      // Actually, since this is bound once, it won't have access to updated state.
      // Better to trigger a state change and handle it in another effect, or re-bind.
    };

    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (currentSong) {
      audioRef.current.src = currentSong.previewUrl;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Error playing audio", e));
    }
  }, [currentSong]);

  // Bind ended event separately so it has access to the latest playNext function
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error("Error playing audio", e));
      } else {
        playNext();
      }
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [queue, currentSong, isRepeat, isShuffle]);

  useEffect(() => {
    if (isPlaying && audioRef.current.src) {
      audioRef.current.play().catch(e => console.error("Error playing audio", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const playSong = (song, playlist = null) => {
    if (currentSong?.trackId === song.trackId) {
      togglePlay();
    } else {
      setCurrentSong(song);
      if (playlist) {
        // If playing from a playlist, set the queue to the rest of the playlist
        const songIndex = playlist.findIndex(s => s.trackId === song.trackId);
        if (songIndex !== -1) {
          setQueue(playlist.slice(songIndex + 1));
        }
      }
    }
  };

  const addToQueue = (song) => {
    setQueue(prevQueue => [...prevQueue, song]);
  };

  const removeFromQueue = (index) => {
    setQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
  };

  const reorderQueue = (startIndex, endIndex) => {
    setQueue(prevQueue => {
      const result = Array.from(prevQueue);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const playNext = () => {
    if (queue.length > 0) {
      let nextIndex = 0;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
      const nextSong = queue[nextIndex];
      setCurrentSong(nextSong);
      setQueue(prevQueue => prevQueue.filter((_, i) => i !== nextIndex));
    } else {
      setIsPlaying(false);
      audioRef.current.currentTime = 0;
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);
  
  const seek = (e) => {
    if (audioRef.current.duration) {
      const progressBar = e.currentTarget;
      const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
      const percentage = (clickPosition / progressBar.offsetWidth);
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <PlayerContext.Provider value={{ 
      currentSong, 
      isPlaying, 
      playSong, 
      togglePlay,
      progress,
      currentTime: formatTime(currentTime),
      duration: formatTime(duration),
      seek,
      volume,
      setVolume,
      isMuted,
      toggleMute,
      queue,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      playNext,
      isShuffle,
      toggleShuffle,
      isRepeat,
      toggleRepeat
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
