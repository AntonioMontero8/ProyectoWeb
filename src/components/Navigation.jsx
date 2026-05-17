import { NavLink } from 'react-router-dom';
import { Home, User, LogIn, Music2, ListMusic, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { user } = useAuth();

  const navLinks = [
    { to: '/', icon: Home, label: 'Inicio' },
    ...(user ? [
      { to: '/playlists', icon: ListMusic, label: 'Playlists' },
      { to: '/friends', icon: Users, label: 'Amigos' },
      { to: '/account', icon: User, label: 'Cuenta' }
    ] : [
      { to: '/login', icon: LogIn, label: 'Entrar' }
    ])
  ];

  return (
    <>
      {/* Side Navigation (Desktop) */}
      <nav className="side-nav">
        <div className="nav-brand">
          <Music2 size={28} />
          <span>SoundSocial</span>
        </div>
        
        {navLinks.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <link.icon size={24} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bottom-nav">
        {navLinks.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <link.icon size={24} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default Navigation;
