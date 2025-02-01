import { useState, useEffect } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PokemonList.css';

export const PokemonList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const limit = 16;

  const page = parseInt(searchParams.get('page') || '1');

  const fetchPokemons = async (page) => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          return res.json();
        })
      );
      setPokemons(pokemonDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemons(page);
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setSearchParams({ page: (page - 1).toString() });
    }
  };

  const handleNextPage = () => {
    setSearchParams({ page: (page + 1).toString() });
  };

  if (loading && pokemons.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '16rem' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
        {pokemons.map((pokemon) => (
          <div className="col" key={pokemon.id}>
            <NavLink to={`/pokemon/${pokemon.id}`} className="text-decoration-none pokemon-card-link">
              <div className="card h-100 text-center border-danger pokemon-card">
                <div className="card-body">
                  <img
                    src={pokemon.sprites.front_default}
                    alt={pokemon.name}
                    className="img-fluid mx-auto d-block pokemon-image"
                    style={{ maxWidth: '8rem', maxHeight: '8rem' }}
                  />
                  <h5 className="card-title text-capitalize mt-2 pokemon-name">{pokemon.name}</h5>
                  <div className="d-flex justify-content-center gap-2 mt-2">
                    {pokemon.types.map((type) => (
                      <span key={type.type.name} className="badge bg-danger">
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </NavLink>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-between align-items-center mt-4">
        <button className="btn btn-danger" onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button className="btn btn-danger" onClick={handleNextPage}>
          Next
        </button>
      </div>
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '4rem' }}>
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};