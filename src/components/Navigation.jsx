import { NavLink, useLocation } from 'react-router-dom';
import { PokemonSearch } from './PokemonSearch';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Navigation = ({ isLoggedIn, setIsLoggedIn, user }) => {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger cursor-pointer">
      <div className="container">
        <div className="navbar-nav d-flex align-items-center justify-content-center w-100 gap-3">
          <div className="d-flex align-items-center justify-content-center">
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
                `nav-link ${isActive ? 'active fw-bold cursor-pointer' : ''}`
              }
            >
              Ritmo
            </NavLink>
          </div>

          <div className="d-flex align-items-center justify-content-center">
            <PokemonSearch />
          </div>

          <div className="d-flex align-items-center justify-content-center">
            {isLoggedIn ? (
              <>
                <span className="text-white me-3">
                {(user.displayName || user.email) && ` Bienvenido, ${user.displayName || user.email}`}
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
                  className="btn btn-light cursor-pointer m-3"
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
      </div>
    </nav>
  );
};