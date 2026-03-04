import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { users, login } = useApp();
  const navigate = useNavigate();

  const handleLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    login(user);
    const routes: Record<string, string> = { user: '/dashboard', admin: '/admin', tech: '/tech' };
    navigate(routes[user.role]);
  };

  return (
    <div className="page">
      <h1>IT Task Manager</h1>
      <p className="subtitle">Select a user to log in</p>
      <div className="user-grid">
        {users.map(u => (
          <button key={u.id} className={`user-card ${u.role}`} onClick={() => handleLogin(u.id)}>
            <span className="user-name">{u.name}</span>
            <span className="user-role">{u.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
