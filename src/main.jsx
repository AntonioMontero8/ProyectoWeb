import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.jsx';
import { PlayerProvider } from './context/PlayerContext.jsx';
import { PlaylistProvider } from './context/PlaylistContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <PlaylistProvider>
            <PlayerProvider>
              <App />
            </PlayerProvider>
          </PlaylistProvider>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
