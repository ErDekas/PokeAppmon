import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const email = event.target.email.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await saveUserToFirestore(user);
      navigate('/login');
    } catch (error) {
      handleRegistrationError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    await socialSignUp('google');
  };

  const handleGitHubSignUp = async () => {
    await socialSignUp('github');
  };

  const socialSignUp = async (providerType) => {
    setError('');
    setLoading(true);

    try {
      const auth = getAuth();
      const provider = providerType === 'google' 
        ? new GoogleAuthProvider() 
        : new GithubAuthProvider();
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      await saveUserToFirestore(user);
      navigate('/login');
    } catch (error) {
      handleRegistrationError(error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserToFirestore = async (user) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName || '',
        createdAt: new Date(),
        authMethod: 'social',
        pokemonGameScore: 0
      });
    }
  };

  const handleRegistrationError = (error) => {
    console.error('Registration error:', error);
    switch (error.code) {
      case 'auth/email-already-in-use':
        setError('El correo electrónico ya está registrado');
        break;
      case 'auth/invalid-email':
        setError('Correo electrónico inválido');
        break;
      case 'auth/weak-password':
        setError('La contraseña es demasiado débil');
        break;
      default:
        setError('Error al registrar usuario. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-4">Registro</h1>
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister}>
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
                    minLength={6}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirmar Contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-danger w-100"
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p>O regístrate con:</p>
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                  >
                    Google
                  </button>
                  <button 
                    className="btn btn-dark" 
                    onClick={handleGitHubSignUp}
                    disabled={loading}
                  >
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