import { useState, useEffect, useRef } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, getFirestore, updateDoc, getDoc } from 'firebase/firestore'
import 'bootstrap/dist/css/bootstrap.min.css'

export const PokemonGame = () => {
  const [pokemon, setPokemon] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lost, setLost] = useState(false)
  const currentPokemonIdRef = useRef(null)

  const auth = getAuth()
  const db = getFirestore()

  useEffect(() => {
    const fetchUserScore = async () => {
      const user = auth.currentUser
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            setScore(userDoc.data().pokemonGameScore || 0)
          }
        } catch (error) {
          console.error('Error fetching user score:', error)
        }
      }
      await getRandomPokemon()
    }

    fetchUserScore()
  }, [])

  const getRandomPokemon = async () => {
    try {
      setLoading(true)
      const id = Math.floor(Math.random() * 1051) + 1
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      const data = await response.json()
      
      // Store current Pokemon ID to prevent race conditions
      const thisRequestId = id
      currentPokemonIdRef.current = id

      // Only update if this is still the most recent request
      if (currentPokemonIdRef.current === thisRequestId) {
        setPokemon(data)
        setShowHint(false)
        setGuesses([])
        setGameOver(false)
        setLost(false)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching pokemon:', error)
      setLoading(false)
    }
  }

  const handleGuess = async (event) => {
    event.preventDefault()
    const guess = event.target.guess.value.toLowerCase()
    event.target.guess.value = ''
    const user = auth.currentUser

    if (guesses.length < 9) {
      if (guess === pokemon.name) {
        const newScore = score + (showHint ? 5 : 10)
        
        if (user) {
          try {
            const userDocRef = doc(db, 'users', user.uid)
            await updateDoc(userDocRef, {
              pokemonGameScore: newScore
            })
          } catch (error) {
            console.error('Error updating user score:', error)
          }
        }

        setScore(newScore)
        setGameOver(true)
      } else {
        setGuesses(prev => [...prev, guess])
        if (guesses.length >= 2) {
          setShowHint(true)
        }
      }
    } else {
      setGameOver(true)
      setLost(true)
    }
  }

  return (
    <div className="container py-4">
      <div className="card shadow-lg border-danger">
        <div className="card-body">
          <h1 className="card-title text-center mb-4">¿Cuál es este Pokémon?</h1>
          
          <div className="text-center mb-4">
            {loading ? (
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              pokemon && (
                <img 
                  src={pokemon.sprites.front_default} 
                  alt="Pokemon Mystery"
                  className={`img-fluid mx-auto ${!gameOver ? 'pokemon-silhouette' : ''}`}
                  style={{
                    maxWidth: '12rem', 
                    maxHeight: '12rem', 
                    filter: !gameOver ? 'brightness(0)' : 'none'
                  }}
                />
              )
            )}
          </div>

          {!gameOver && !loading ? (
            <>
              <form onSubmit={handleGuess} className="mb-4">
                <div className="input-group">
                  <input
                    type="text"
                    name="guess"
                    placeholder="Nombre del Pokémon..."
                    className="form-control"
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-danger"
                  >
                    Adivinar
                  </button>
                </div>
              </form>

              {showHint && (
                <div className="alert alert-info">
                  <h5 className="alert-heading">Pistas:</h5>
                  <p className="mb-0">Tipo: {pokemon.types.map(t => t.type.name).join(', ')}</p>
                  <p className="mb-0">Altura: {pokemon.height / 10}m</p>
                  <p className="mb-0">Peso: {pokemon.weight / 10}kg</p>
                  <p className="mb-0">Número en la Pokédex: {pokemon.id}</p>
                </div>
              )}

              {guesses.length > 0 && (
                <div className="mt-3">
                  <h5>Intentos anteriores:</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {guesses.map((guess, index) => (
                      <span key={index} className="badge bg-secondary">
                        {guess}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : gameOver && (
            <div className="text-center">
              {lost ? (
                <>
                  <h2 className="text-danger mb-3">¡Has Perdido!</h2>
                  <p>El Pokémon era {pokemon.name}</p>
                </>
              ) : (
                <>
                  <h2 className="text-success mb-3">¡Correcto!</h2>
                  <p>El Pokémon era {pokemon.name}</p>
                  <p>Puntuación actual: {score}</p>
                </>
              )}
              <button
                onClick={getRandomPokemon}
                className="btn btn-danger mt-3"
              >
                Volver a Intentar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};