import { Search } from 'lucide-react';

function Home() {
  return (
    <div className="page-container">
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Buscar canciones, artistas o amigos..." 
        />
      </div>

      <h1 className="page-title">Descubre</h1>

      <h2 className="section-title">Escuchado recientemente</h2>
      <div className="horizontal-list">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={`recent-${item}`} className="card">
            <div className="card-img"></div>
            <div className="card-title">Mix Diario {item}</div>
            <div className="card-subtitle">Para ti</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Actividad de amigos</h2>
      <div className="horizontal-list">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={`friend-${item}`} className="card" style={{ minWidth: '100px' }}>
            <div className="card-img circular" style={{ width: '100px', height: '100px' }}></div>
            <div className="card-title" style={{ textAlign: 'center' }}>Amigo {item}</div>
            <div className="card-subtitle" style={{ textAlign: 'center' }}>Escuchando...</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
