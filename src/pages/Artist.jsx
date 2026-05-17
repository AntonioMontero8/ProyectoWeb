import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function Artist() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong, currentSong, isPlaying } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song&limit=7`).then(res => res.json()),
      fetch(`https://itunes.apple.com/lookup?id=${id}&entity=album`).then(res => res.json())
    ])
      .then(([songDataResponse, albumDataResponse]) => {
        if (songDataResponse.results && songDataResponse.results.length > 0) {
          const artistData = songDataResponse.results.find(item => item.wrapperType === 'artist') || albumDataResponse.results.find(item => item.wrapperType === 'artist');
          const songData = songDataResponse.results.filter(item => item.wrapperType === 'track');
          const albumData = albumDataResponse.results.filter(item => item.wrapperType === 'collection');
          
          setArtist(artistData || songData[0] || albumData[0]);
          setSongs(songData);
          setAlbums(albumData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="page-container"><p>Cargando artista...</p></div>;
  if (!artist) return <div className="page-container"><p>Artista no encontrado.</p></div>;

  const artistImage = songs.length > 0 ? songs[0].artworkUrl100.replace('100x100', '300x300') : null;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', marginTop: '20px' }}>
        {artistImage ? (
          <img 
            src={artistImage} 
            alt={artist.artistName} 
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} 
          />
        ) : (
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', fontWeight: 'bold', color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            {artist.artistName ? artist.artistName.charAt(0) : '?'}
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '48px', margin: '0 0 8px 0' }}>{artist.artistName}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discografía y canciones populares</p>
        </div>
      </div>

      <h2 className="section-title">Canciones populares</h2>
      <div className="settings-list" style={{ backgroundColor: 'transparent', marginBottom: '40px' }}>
        {songs.map((song, index) => {
          const isThisPlaying = currentSong?.trackId === song.trackId && isPlaying;
          return (
            <div 
              key={song.trackId} 
              className="settings-item" 
              onClick={() => playSong(song)}
              style={{ padding: '12px 16px', borderRadius: '8px', borderBottom: 'none' }}
            >
              <div className="settings-item-left" style={{ width: '100%' }}>
                <div style={{ width: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {isThisPlaying ? <Pause size={16} color="var(--accent-color)" /> : index + 1}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={song.artworkUrl100} style={{ width: '40px', height: '40px', borderRadius: '4px' }} alt="Cover" />
                  <div>
                    <div style={{ color: isThisPlaying ? 'var(--accent-color)' : 'white', fontWeight: 500 }}>{song.trackName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{song.collectionName}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Álbumes y EP's</h2>
      <div className="horizontal-list" style={{ flexWrap: 'wrap', overflowX: 'visible', justifyContent: 'flex-start' }}>
        {albums.map((album) => (
          <div key={album.collectionId} className="card" style={{ marginBottom: '16px' }} onClick={() => navigate(`/album/${album.collectionId}`)}>
            <div style={{ position: 'relative' }}>
              <img src={album.artworkUrl100.replace('100x100', '200x200')} alt={album.collectionName} className="card-img" />
            </div>
            <div className="card-title" title={album.collectionName}>{album.collectionName}</div>
            <div className="card-subtitle">{new Date(album.releaseDate).getFullYear()} • {album.trackCount} canciones</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Artist;
