import { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
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

    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
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

  const playSong = (song) => {
    if (currentSong?.trackId === song.trackId) {
      togglePlay();
    } else {
      setCurrentSong(song);
    }
  };
  
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
      toggleMute
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
