import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Navigation = ({ isLoggedIn, setIsLoggedIn, user }) => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-danger cursor-pointer">
    <div className="container">
      <div className="navbar-nav me-auto">
        <NavLink 
          to="/" 
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active fw-bold cursor-pointer' : ''}`
          }
        >
          Inicio
        </NavLink>
        <NavLink 
          to="/pokemons" 
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active fw-bold cursor-pointer' : ''}`
          }
        >
          Pokemons
        </NavLink>
        <NavLink 
          to="/jugar" 
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active fw-bold cursor-pointer' : ''}`
          }
        >
          Jugar
        </NavLink>
        <NavLink 
          to="/jugarBeta"
          className={({ isActive }) => 
            ` nav-link ${isActive ? 'active fw-bold cursor-pointer' : ''}`
          }
        >
          Ritmo
        </NavLink>
      </div>
      <div className="d-flex align-items-center">
        {isLoggedIn ? (
          <>
            <span className="text-white me-3">
              Bienvenido, {user?.displayName || user?.email}
            </span>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="btn btn-light cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <NavLink 
              to="/login" 
              className="nav-link text-white me-3 cursor-pointer"
            >
              Iniciar Sesión
            </NavLink>
            <NavLink 
              to="/registro" 
              className="btn btn-light cursor-pointer"
            >
              Registro
            </NavLink>
          </>
        )}
      </div>
    </div>
  </nav>
);