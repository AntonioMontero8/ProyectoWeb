import { User, Mail, UserX, LogOut } from 'lucide-react';

function Account() {
  return (
    <div className="page-container">
      <h1 className="page-title">Tu Cuenta</h1>
      
      <div className="profile-header">
        <div className="profile-avatar">J</div>
        <div className="profile-info">
          <h2>Jose Antonio</h2>
          <p>josea@example.com</p>
          <button className="btn-outline" style={{ padding: '6px 16px', fontSize: '13px' }}>Editar perfil</button>
        </div>
      </div>

      <h2 className="section-title">Editar perfil</h2>
      
      <div className="settings-list">
        <div className="settings-item">
          <div className="settings-item-left">
            <User size={20} />
            <span>Modificar nombre de usuario</span>
          </div>
        </div>
        <div className="settings-item">
          <div className="settings-item-left">
            <Mail size={20} />
            <span>Cambiar correo</span>
          </div>
        </div>
        <div className="settings-item">
          <div className="settings-item-left">
            <UserX size={20} />
            <span>Bloquear personas</span>
          </div>
        </div>
        <div className="settings-item" style={{ color: '#ef4444' }}>
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
