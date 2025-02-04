import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export const NotFound = () => (
  <div className="container text-center py-5">
    <h1 className="display-1 text-danger">404</h1>
    <p className="h2 mt-3">¡Oh no! Esta página no existe</p>
    <img src="/assets/404.webp" alt="404 Not Found" />
    <br />
    <NavLink to="/" className="btn btn-danger mt-4">
      Volver al inicio
    </NavLink>
  </div>
);