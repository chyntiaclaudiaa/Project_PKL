import { useNavigate } from 'react-router-dom';
import { Home, Plus, List, Upload, User, LogOut } from 'lucide-react';
import '../style/Sidebar.css';

function Sidebar({ user, active, onLogout }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">M</div>
        <div>
          <h2>MarCom System</h2>
          <p>Marketing Communication</p>
        </div>
      </div>

      <nav className="menu">
        <button
          className={`menu-item ${active === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/anggota/dashboard')}
        >
          <Home className="menu-icon" size={20} />
          <span>Beranda</span>
        </button>

        <button
          className={`menu-item ${active === 'request' ? 'active' : ''}`}
          onClick={() => navigate('/anggota/input-request')}
        >
          <Plus className="menu-icon" size={20} />
          <span>Input Request Konten</span>
        </button>

        <button
          className={`menu-item ${active === 'myrequest' ? 'active' : ''}`}
          onClick={() => navigate('/anggota/requests')}
        >
          <List className="menu-icon" size={20} />
          <span>Request Saya</span>
        </button>

        <button
          className={`menu-item ${active === 'upload' ? 'active' : ''}`}
          onClick={() => navigate('/anggota/upload-hasil')}
        >
          <Upload className="menu-icon" size={20} />
          <span>Upload Hasil Konten</span>
        </button>

        <button
          className={`menu-item ${active === 'profile' ? 'active' : ''}`}
          onClick={() => navigate('/anggota/profile')}
        >
          <User className="menu-icon" size={20} />
          <span>Profil Saya</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{user?.name}</h3>
            <p>{user?.role}</p>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;