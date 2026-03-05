import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function NavBar() {
  const { currentUser, logout, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <span className="nav-brand">IT Task Manager</span>
      <div className="nav-right">
        <span className="nav-user">{currentUser.name} ({currentUser.role})</span>
        <button className="btn small" onClick={toggleDarkMode} title="Toggle theme">
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button className="btn small" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
