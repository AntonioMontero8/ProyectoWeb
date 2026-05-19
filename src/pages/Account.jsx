import { useState } from 'react';
import { User, Mail, LogOut, Camera, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Account() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');

  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <User size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h2>Inicia sesión para ver tu cuenta</h2>
      </div>
    );
  }

  const handleSaveName = () => {
    if (newName.trim()) {
      login({ ...user, name: newName.trim() });
    }
    setEditingName(false);
  };

  const handleSaveEmail = () => {
    if (newEmail.trim()) {
      login({ ...user, email: newEmail.trim() });
    }
    setEditingEmail(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="page-container">
      <h1 className="page-title">Tu Cuenta</h1>

      {/* Profile Header */}
      <div className="profile-header">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div className="profile-avatar">{initials}</div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '26px', height: '26px', borderRadius: '50%',
            backgroundColor: 'var(--accent-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: '2px solid var(--bg-color)'
          }}>
            <Camera size={13} color="white" />
          </div>
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <h2 className="section-title">Editar perfil</h2>

      <div className="settings-list">

        {/* Nombre */}
        <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="settings-item-left">
              <User size={20} />
              <span>Nombre de usuario</span>
            </div>
            {!editingName && (
              <button
                onClick={() => { setNewName(user.name); setEditingName(true); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '13px' }}
              >
                Editar
              </button>
            )}
          </div>
          {editingName ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                autoFocus
                style={{ flex: 1 }}
              />
              <button onClick={handleSaveName} style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
                <Check size={18} />
              </button>
              <button onClick={() => setEditingName(false)} style={{ background: 'var(--surface-hover)', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, paddingLeft: '28px' }}>{user.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="settings-item-left">
              <Mail size={20} />
              <span>Correo electrónico</span>
            </div>
            {!editingEmail && (
              <button
                onClick={() => { setNewEmail(user.email); setEditingEmail(true); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '13px' }}
              >
                Editar
              </button>
            )}
          </div>
          {editingEmail ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                className="form-input"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveEmail(); if (e.key === 'Escape') setEditingEmail(false); }}
                autoFocus
                style={{ flex: 1 }}
              />
              <button onClick={handleSaveEmail} style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
                <Check size={18} />
              </button>
              <button onClick={() => setEditingEmail(false)} style={{ background: 'var(--surface-hover)', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, paddingLeft: '28px' }}>{user.email}</p>
          )}
        </div>

        {/* Cerrar sesión */}
        <div
          className="settings-item"
          style={{ color: '#ef4444', cursor: 'pointer' }}
          onClick={handleLogout}
        >
          <div className="settings-item-left">
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Account;