import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signUp, confirmSignUp } from '../lib/auth';

type View = 'login' | 'signup' | 'verify';
const ROLE_ROUTES = { user: '/dashboard', admin: '/admin', tech: '/tech' } as const;

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const initialView = (location.state as { view?: View } | null)?.view ?? 'login';

  const [view, setView] = useState<View>(initialView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'tech'>('user');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setError(''); setLoading(false); };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const r = await login(email, password);
      navigate(ROLE_ROUTES[r]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      await signUp(name, email, password, role);
      setView('verify');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      const r = await login(email, password);
      navigate(ROLE_ROUTES[r]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>IT Task Manager</h1>

      {view === 'login' && (
        <>
          <p className="subtitle">Sign in to continue</p>
          <form className="login-form" onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            {error && <p className="login-error">{error}</p>}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="login-switch">
              No account?{' '}
              <button type="button" className="link-btn" onClick={() => { setError(''); setView('signup'); }}>
                Sign up
              </button>
            </p>
          </form>
        </>
      )}

      {view === 'signup' && (
        <>
          <p className="subtitle">Create your account</p>
          <form className="login-form" onSubmit={handleSignup}>
            <input type="text" placeholder="Full name" value={name}
              onChange={e => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            <input type="password" placeholder="Password (min 8 chars, upper + lower + digit)" value={password}
              onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            <select value={role} onChange={e => setRole(e.target.value as 'user' | 'tech')}>
              <option value="user">User — submit work orders</option>
              <option value="tech">Technician — claim and complete jobs</option>
            </select>
            {error && <p className="login-error">{error}</p>}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
            <p className="login-switch">
              Already have an account?{' '}
              <button type="button" className="link-btn" onClick={() => { setError(''); setView('login'); }}>
                Sign in
              </button>
            </p>
          </form>
        </>
      )}

      {view === 'verify' && (
        <>
          <p className="subtitle">Check your email for a verification code</p>
          <form className="login-form" onSubmit={handleVerify}>
            <input type="text" placeholder="6-digit code" value={code}
              onChange={e => setCode(e.target.value)} required maxLength={6} />
            {error && <p className="login-error">{error}</p>}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & sign in'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
