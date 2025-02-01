import 'bootstrap/dist/css/bootstrap.min.css';

export const LandingPage = () => (
    <div className="container text-center py-5">
      <h1 className="display-4 mb-4">Bienvenido a la Pokemon App</h1>
      <div className="col-lg-8 mx-auto">
        <p className="lead mb-5">
          Explora el fascinante mundo Pokemon, aprende sobre sus características 
          y pon a prueba tus conocimientos con nuestros juegos.
        </p>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title h4 mb-3">Explorar</h2>
                <p className="card-text">Descubre todos los Pokemon y sus características únicas</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title h4 mb-3">Aprender</h2>
                <p className="card-text">Conoce los detalles de cada Pokemon en profundidad</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title h4 mb-3">Jugar</h2>
                <p className="card-text">Pon a prueba tus conocimientos con juegos divertidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );