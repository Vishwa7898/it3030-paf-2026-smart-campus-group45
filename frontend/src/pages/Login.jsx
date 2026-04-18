import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { LogIn, KeyRound } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();

  // If already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-container fade-in">
      <div className="card auth-card">
        <div className="auth-icon">
          <KeyRound size={32} />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p style={{ marginBottom: '2rem' }}>Sign in to access your Smart Campus portal</p>
        
        <button 
          onClick={login} 
          className="btn-primary" 
          style={{ width: '100%', padding: '0.875rem', fontSize: '1.125rem' }}
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
            alt="Google Logo" 
            style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', padding: '2px' }}
          />
          Sign in with Google
        </button>

        <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
