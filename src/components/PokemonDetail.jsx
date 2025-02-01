import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

export const PokemonDetail = () => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpriteIndex, setCurrentSpriteIndex] = useState(0);
  const { id } = useParams();

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        setPokemon(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pokemon:', error);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [id]);

  const playPokemonCry = () => {
    const audioUrl = `https://play.pokemonshowdown.com/audio/cries/${pokemon.name.toLowerCase()}.mp3`;
    const audio = new Audio(audioUrl);
    
    audio.addEventListener('playing', () => setIsPlaying(true));
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('error', () => {
      console.error('Error playing Pokemon cry');
      setIsPlaying(false);
    });

    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    });
  };

  const getAvailableSprites = () => {
    if (!pokemon) return [];
    return [
      { url: pokemon.sprites.front_default, label: 'Default' },
      { url: pokemon.sprites.front_shiny, label: 'Shiny' },
      { url: pokemon.sprites.other['official-artwork'].front_default, label: 'Artwork' },
      { url: pokemon.sprites.other['home'].front_default, label: 'Home' },
    ].filter(sprite => sprite.url !== null);
  };

  const nextSprite = () => {
    const sprites = getAvailableSprites();
    setCurrentSpriteIndex((prev) => (prev + 1) % sprites.length);
  };

  const prevSprite = () => {
    const sprites = getAvailableSprites();
    setCurrentSpriteIndex((prev) => (prev - 1 + sprites.length) % sprites.length);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '16rem'}}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return <Navigate to="/404" replace />;
  }

  const sprites = getAvailableSprites();
  const statsData = pokemon.stats.map(stat => ({
    stat: stat.stat.name,
    value: stat.base_stat
  }));

  return (
    <div className="container py-4">
      <div className="card border-0" style={{
        background: 'linear-gradient(145deg, #cc0000 0%, #ff0000 100%)',
        borderRadius: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div className="card-body text-white">
          <div className="row">
            <div className="col-md-6">
              <div className="position-relative bg-light rounded-circle p-4 mx-auto" style={{
                width: '280px',
                height: '280px',
                border: '8px solid #333',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
              }}>
                <img 
                  src={sprites[currentSpriteIndex].url}
                  alt={`${pokemon.name} - ${sprites[currentSpriteIndex].label}`}
                  className="img-fluid position-absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '200px',
                    maxHeight: '200px'
                  }}
                />
                <button
                  onClick={prevSprite}
                  className="btn btn-dark btn-sm position-absolute"
                  style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSprite}
                  className="btn btn-dark btn-sm position-absolute"
                  style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={playPokemonCry}
                  className="btn btn-dark btn-sm position-absolute"
                  style={{ bottom: '1rem', right: '1rem' }}
                  title="Escuchar sonido"
                >
                  {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
              <div className="text-center mt-3">
                <h1 className="text-capitalize mb-0" style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                }}>
                  #{pokemon.id} {pokemon.name}
                </h1>
                <div className="d-flex justify-content-center gap-2 mt-2">
                  {pokemon.types.map((type) => (
                    <span 
                      key={type.type.name}
                      className="badge"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)',
                        padding: '0.5rem 1rem',
                        borderRadius: '1rem'
                      }}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="stats-container position-relative mt-4" style={{ height: '300px' }}>
                <svg viewBox="0 0 300 300" width="100%" height="100%">
                  {/* Hexágono de fondo */}
                  <polygon 
                    points="150,50 250,100 250,200 150,250 50,200 50,100"
                    fill="rgba(255,255,255,0.1)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                  />
                  {/* Líneas de la red */}
                  <line x1="150" y1="50" x2="150" y2="250" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="50" y1="100" x2="250" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="250" y1="100" x2="50" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  
                  {/* Polígono de estadísticas */}
                  <polygon
                    points={`
                      ${150 + (statsData[0].value / 255 * 100)},${150 - (statsData[0].value / 255 * 87)}
                      ${150 + (statsData[1].value / 255 * 87)},${150 + (statsData[1].value / 255 * 50)}
                      ${150 - (statsData[2].value / 255 * 87)},${150 + (statsData[2].value / 255 * 50)}
                      ${150 - (statsData[3].value / 255 * 100)},${150 - (statsData[3].value / 255 * 87)}
                      ${150 - (statsData[4].value / 255 * 87)},${150 - (statsData[4].value / 255 * 50)}
                      ${150 + (statsData[5].value / 255 * 87)},${150 - (statsData[5].value / 255 * 50)}
                    `}
                    fill="rgba(255,255,255,0.4)"
                    stroke="white"
                    strokeWidth="2"
                  />
                  
                  {/* Etiquetas de estadísticas */}
                  {statsData.map((stat, index) => {
                    const angle = (index * 60 - 90) * Math.PI / 180;
                    const x = 150 + Math.cos(angle) * 130;
                    const y = 150 + Math.sin(angle) * 130;
                    return (
                      <text
                        key={stat.stat}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        className="text-capitalize"
                      >
                        {stat.stat.replace('-', ' ')}
                        <tspan x={x} y={y + 15}>{stat.value}</tspan>
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="h5 mb-3">Movimientos</h3>
            <div className="d-flex flex-wrap gap-2">
              {pokemon.moves.slice(0, 8).map((move) => (
                <span 
                  key={move.move.name}
                  className="badge"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem'
                  }}
                >
                  {move.move.name.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};