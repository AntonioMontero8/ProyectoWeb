import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './UserMenu.css';

function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleItemClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button className="avatar-btn" onClick={() => setIsOpen(!isOpen)}>
        {user.picture ? (
          <img src={user.picture} alt="Avatar" className="avatar-img" />
        ) : (
          <div className="avatar-placeholder">{user.name ? user.name.charAt(0) : 'U'}</div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="menu-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="dropdown-menu">
            <div className="menu-header">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            
            <ul className="menu-list">
              <li>
                <button onClick={() => handleItemClick('/account')} className="menu-item">
                  <User size={18} />
                  <span>Mi Perfil</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleItemClick('/account')} className="menu-item">
                  <Settings size={18} />
                  <span>Configuración</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleItemClick('/account')} className="menu-item">
                  <Shield size={18} />
                  <span>Seguridad / Contraseña</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleItemClick('/account')} className="menu-item">
                  <HelpCircle size={18} />
                  <span>Ayuda / Soporte</span>
                </button>
              </li>
              <li className="menu-divider"></li>
              <li>
                <button onClick={handleLogout} className="menu-item logout-btn">
                  <LogOut size={18} />
                  <span>Cerrar Sesión</span>
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default UserMenu;
