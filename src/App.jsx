import { Routes, Route, Link } from 'react-router-dom';
import Navigation from './components/Navigation';
import PlayerBar from './components/PlayerBar';
import UserMenu from './components/UserMenu';
import Home from './pages/Home';
import Login from './pages/Login';
import Account from './pages/Account';
import Artist from './pages/Artist';
import Album from './pages/Album';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Friends from './pages/Friends';
import { useAuth } from './context/AuthContext';
import { LogIn } from 'lucide-react';

function App() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Navigation />
      
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-spacer"></div>
          {user ? (
            <UserMenu />
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <LogIn size={16} /> Iniciar Sesión
            </Link>
          )}
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/artist/:id" element={<Artist />} />
          <Route path="/album/:id" element={<Album />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>
      </main>

      <PlayerBar />
    </div>
  );
}

export default App;
