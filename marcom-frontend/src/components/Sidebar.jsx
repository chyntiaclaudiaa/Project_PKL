import { useNavigate } from 'react-router-dom';
import {
  Home,
  Plus,
  List,
  Upload,
  User,
  LogOut,
} from 'lucide-react';

import logoKecilBankSumut from "../assets/Logo_Kecil_Bank_Sumut.png";
import '../style/Sidebar.css';

function Sidebar({ user, active, onLogout }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <div className="logo-container">
            <img
              src={logoKecilBankSumut}
              alt="Bank Sumut"
              className="brand-image"
            />
          </div>

          <div>
            <h2>MarCom System</h2>
            <p>Marketing Communication</p>
          </div>
        </div>

        <div className="role-card">
          <span className="role-label">ROLE AKTIF</span>

          <div className="role-user">
            <User size={14} />
            <span>{user?.role || 'Anggota'}</span>
          </div>
        </div>

        <nav className="menu">
          <button
            className={`menu-item ${active === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/anggota/dashboard')}
          >
            <Home size={20} />
            <span>Beranda</span>
          </button>

          <button
            className={`menu-item ${active === 'request' ? 'active' : ''}`}
            onClick={() => navigate('/anggota/input-request')}
          >
            <Plus size={20} />
            <span>Input Request</span>
          </button>

          <button
            className={`menu-item ${active === 'myrequest' ? 'active' : ''}`}
            onClick={() => navigate('/anggota/requests')}
          >
            <List size={20} />
            <span>Request Saya</span>
          </button>

          <button
            className={`menu-item ${active === 'upload' ? 'active' : ''}`}
            onClick={() => navigate('/anggota/upload-hasil')}
          >
            <Upload size={20} />
            <span>Upload Hasil</span>
          </button>

          <button
            className={`menu-item ${active === 'profile' ? 'active' : ''}`}
            onClick={() => navigate('/anggota/profile')}
          >
            <User size={20} />
            <span>Profil Saya</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="user-info-container">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="user-details">
            <h3>{user?.name}</h3>
            <p>{user?.role}</p>
          </div>
        </div>
        
        <button className="logout-btn-icon" onClick={onLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;