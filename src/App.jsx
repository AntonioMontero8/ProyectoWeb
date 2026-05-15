import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import PlayerBar from './components/PlayerBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Account from './pages/Account';

function App() {
  return (
    <div className="app-container">
      <Navigation />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </main>

      <PlayerBar />
    </div>
  );
}

export default App;
