import 'bootstrap/dist/css/bootstrap.min.css';

export const LandingPage = () => (
  <div className="position-relative">
    {/* Video de fondo */}
    <video autoPlay loop muted className="position-fixed top-0 start-0 w-100 h-100" style={{ objectFit: 'cover', zIndex: -1 }}>
      <source src="/assets/fondo.mp4" type="video/mp4" />
      Tu navegador no soporta el elemento de video.
    </video>

    {/* Contenedor principal centrado */}
    <div className="d-flex align-items-center justify-content-center vh-100 text-white">
      <div className="container text-center p-5" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
        <h1 className="display-4 fw-bold mb-4">Bienvenido a la Pokémon App</h1>
        <p className="lead mb-4">Explora el fascinante mundo Pokémon, aprende sobre sus características y pon a prueba tus conocimientos con nuestros juegos.</p>

        {/* Tarjetas */}
        <div className="row g-4">
          {["Explorar", "Aprender", "Jugar"].map((titulo, index) => (
            <div className="col-md-4" key={index}>
              <div className="card h-100 shadow-lg text-dark" style={{ borderRadius: '10px' }}>
                <div className="card-body">
                  <h2 className="card-title h4 fw-bold mb-3">{titulo}</h2>
                  <p className="card-text">
                    {titulo === "Explorar" && "Descubre todos los Pokémon y sus características únicas."}
                    {titulo === "Aprender" && "Conoce los detalles de cada Pokémon en profundidad."}
                    {titulo === "Jugar" && "Pon a prueba tus conocimientos con juegos divertidos."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
