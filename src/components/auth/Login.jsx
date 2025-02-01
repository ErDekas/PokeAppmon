import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Login = ({ setIsLoggedIn, setUser }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      handleSuccessfulLogin(userCredential.user);
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      handleSuccessfulLogin(userCredential.user);
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const auth = getAuth();
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      handleSuccessfulLogin(userCredential.user);
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSuccessfulLogin = (user) => {
    setIsLoggedIn(true);
    setUser({ 
      name: user.displayName || user.email.split('@')[0],
      email: user.email 
    });
    navigate('/');
  };

  const handleLoginError = (error) => {
    console.error('Login error:', error);
    switch (error.code) {
      case 'auth/invalid-credential':
        setError('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
        break;
      case 'auth/user-not-found':
        setError('No se encontró un usuario con este correo electrónico.');
        break;
      case 'auth/wrong-password':
        setError('Contraseña incorrecta.');
        break;
      default:
        setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-4">Iniciar Sesión</h1>
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-danger w-100"
                  disabled={loading}
                >
                  {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p>O inicia sesión con:</p>
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    Google
                  </button>
                  <button className="btn btn-dark" disabled={loading} onClick={handleGithubLogin}>
                    Github
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};