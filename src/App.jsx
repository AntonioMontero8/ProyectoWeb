import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import PlayerBar from './components/PlayerBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Account from './pages/Account';
import Artist from './pages/Artist';
import Album from './pages/Album';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';

function App() {
  return (
    <div className="app-container">
      <Navigation />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/artist/:id" element={<Artist />} />
          <Route path="/album/:id" element={<Album />} />
        </Routes>
      </main>

      <PlayerBar />
    </div>
  );
}

export default App;
