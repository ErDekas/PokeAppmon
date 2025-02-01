import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import * as Tone from 'tone';
import 'bootstrap/dist/css/bootstrap.min.css';

export const PokemonRhythm = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [notes, setNotes] = useState([]);
  const [missed, setMissed] = useState(0);
  const [pokemonSprites, setPokemonSprites] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const POKEMON_IDS = [1, 4, 7, 25];
  const LANES = 4;
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BASE_NOTE_SPEED = 5;
  const MAX_MISSED = 5;
  const SPEED_INCREASE_INTERVAL = 30000; // 30 segundos
  const SPEED_INCREASE_AMOUNT = 0.2;
  const BASE_POINTS = 100;

  const currentScoreRef = useRef(0);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const currentSpeedRef = useRef(1);
  const speedIncreaseIntervalRef = useRef(null);
  const notesToRemoveRef = useRef(new Set());
  const playerRef = useRef(null);
  const songStartTimeRef = useRef(null);

  const generateInfiniteNotes = (startTime) => {
    const notes = [];
    const notesPerSecond = 8;
    const secondsToGenerate = 5; // Generar 5 segundos de notas por adelantado
    
    for (let second = startTime; second < startTime + secondsToGenerate; second++) {
      for (let i = 0; i < notesPerSecond; i++) {
        const timeInTenths = Math.floor((i/notesPerSecond) * 10);
        notes.push({
          time: `${second}:${timeInTenths}`,
          lane: Math.floor(Math.random() * 4)
        });
      }
    }
    
    return notes.sort((a, b) => {
      const [secA, tenthA] = a.time.split(':').map(Number);
      const [secB, tenthB] = b.time.split(':').map(Number);
      return secA === secB ? tenthA - tenthB : secA - secB;
    });
  };


  // Definir la estructura de notas de la canción
  const setupSongNotes = () => {
    const generateNotes = () => {
      const notes = [];
      let currentSecond = 0;
      let totalNotes = 0;
      const usedTimesMap = new Map(); // Mapa para rastrear tiempos ocupados
      
      // Distribuir 344 notas en 43 segundos
      while (currentSecond < 43 && totalNotes < 344) {
        // Para cada segundo, generar 8 notas
        for (let i = 0; i < 8 && totalNotes < 344; i++) {
          // Calcular el tiempo exacto para esta nota
          const timeInTenths = Math.floor((i/8) * 10);
          const timeKey = `${currentSecond}:${timeInTenths}`;
          
          // Si este tiempo ya está ocupado, intentar el siguiente
          if (usedTimesMap.has(timeKey)) {
            continue;
          }
          
          // Generar un carril del 0 al 3
          const lane = Math.floor(Math.random() * 4); // Ahora genera del 0 al 3
          
          // Registrar este tiempo como ocupado
          usedTimesMap.set(timeKey, true);
          
          notes.push({ time: timeKey, lane });
          totalNotes++;
        }
        currentSecond++;
      }
      
      // Ordenar las notas por tiempo
      return notes.sort((a, b) => {
        const [secA, tenthA] = a.time.split(':').map(Number);
        const [secB, tenthB] = b.time.split(':').map(Number);
        return secA === secB ? tenthA - tenthB : secA - secB;
      });
    };
    
    // Generar el patrón de notas
    return [
      // === INTRODUCCIÓN (0:00 - 0:43) ===
      ...generateNotes()
    ];
  };

  const createSongNoteChart = () => {
    const songNotes = setupSongNotes(); // Genera el patrón inicial de notas
    
    return {
      songNotes,
      getInfiniteNotes: (startTime) => generateInfiniteNotes(startTime)
    };
  };

  const setupAudio = async () => {
    try {
      await Tone.start();
      playerRef.current = new Tone.Player({
        url: "/assets/music/song.mp3",
        autostart: false,
        loop: true,
        onload: () => {
          setIsAudioLoaded(true);
        },
        onended: () => {
          // Cuando la canción termina, resetear la velocidad
          setSpeedMultiplier(1);
          currentSpeedRef.current = 1;
          if (playerRef.current) {
            playerRef.current.playbackRate = 1;
          }
        }
      }).toDestination();

      // Obtener la duración de la canción en segundos
      playerRef.current.buffer.onload = () => {
        const songDuration = playerRef.current.buffer.duration;
        // Configurar el intervalo basado en la duración de la canción
        SPEED_INCREASE_INTERVAL = (songDuration * 1000) / 4; // Dividir la canción en 4 partes
      };
    } catch (error) {
      console.error("Error loading audio: ", error);
    }
  };

  useEffect(() => {
    setupAudio();
    return () => {
      if(playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const fetchHighScore = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && docSnap.data().rhythmInvadersScore) {
            setHighScore(docSnap.data().rhythmInvadersScore);
          }
        } catch (error) {
          console.error('Error fetching high score:', error);
        }
      }
    };

    fetchHighScore();
  }, []);

  useEffect(() => {
    const fetchPokemonSprites = async () => {
      const sprites = {};
      for (const pokemonId of POKEMON_IDS) {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
          const data = await response.json();
          sprites[pokemonId] = data.sprites.front_default;
        } catch (error) {
          console.error(`Error fetching Pokemon sprite:`, error);
        }
      }
      setPokemonSprites(sprites);
    };

    fetchPokemonSprites();
  }, []);

  const startGame = async () => {
    await Tone.start();
    setScore(0);
    currentScoreRef.current = 0;
    setMissed(0);
    setGameActive(true);
    setGameOver(false);
    setSpeedMultiplier(1);
    currentSpeedRef.current = 1;
    setNotes([]);
  
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.playbackRate = 1; // Asegurar que empiece a velocidad normal
        playerRef.current.start();
        songStartTimeRef.current = Date.now();
        
        // Configurar el intervalo de aumento de velocidad
        speedIncreaseIntervalRef.current = setInterval(() => {
          setSpeedMultiplier(prev => {
            const newSpeed = prev + SPEED_INCREASE_AMOUNT;
            if (playerRef.current) {
              playerRef.current.playbackRate = newSpeed;
            }
            currentSpeedRef.current = newSpeed;
            return newSpeed;
          });
        }, SPEED_INCREASE_INTERVAL);
      }
    }, 1000);
  
    startGameLoop();
  };
  
  const startGameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    let noteGenerationCounter = 0;
  
    gameLoopRef.current = setInterval(() => {
      // Generar nuevas notas de forma gradual
      if (noteGenerationCounter % 30 === 0) { // Ajusta este valor para controlar la frecuencia
        setNotes((prevNotes) => {
          // Limitar el número máximo de notas en pantalla
          const maxNotes = 50; 
          if (prevNotes.length >= maxNotes) {
            return prevNotes;
          }
  
          // Generar una nueva nota
          const newNote = {
            lane: Math.floor(Math.random() * 4),
            y: -50,
            pokemonId: POKEMON_IDS[Math.floor(Math.random() * POKEMON_IDS.length)],
            id: Date.now() + Math.random()
          };
  
          return [...prevNotes, newNote];
        });
      }
      noteGenerationCounter++;
  
      // Limpiar y dibujar el canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Dibujar fondo
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
      // Dibujar carriles
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      for (let i = 1; i < LANES; i++) {
        const x = i * (CANVAS_WIDTH / LANES);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
  
      // Línea de golpeo
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT - 100);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 100);
      ctx.stroke();
  
      // Actualizar y dibujar notas
      setNotes((prevNotes) => {
        const updatedNotes = prevNotes
          .map((note) => ({ 
            ...note, 
            y: note.y + (BASE_NOTE_SPEED * currentSpeedRef.current) 
          }))
          .filter((note) => {
            if (note.y > CANVAS_HEIGHT) {
              setMissed((prevMissed) => {
                const newMissed = prevMissed + 1;
                if (newMissed >= MAX_MISSED) {
                  endGame();
                }
                return newMissed;
              });
              return false;
            }
            return true;
          });
  
        // Dibujar notas
        updatedNotes.forEach((note) => {
          const sprite = new Image();
          sprite.src = pokemonSprites[note.pokemonId];
          const x = note.lane * (CANVAS_WIDTH / LANES) + (CANVAS_WIDTH / LANES) / 2 - 25;
          ctx.drawImage(sprite, x, note.y, 50, 50);
        });
  
        return updatedNotes;
      });
    }, 16); // 60 FPS
  };
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!gameActive) return;
  
      switch (event.key) {
        case 'a':
          handleNoteHit(0);
          break;
        case 's':
          handleNoteHit(1);
          break;
        case 'd':
          handleNoteHit(2);
          break;
        case 'f':
          handleNoteHit(3);
          break;
        default:
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive]);

  useEffect(() => {
    if (gameActive) {
      startGameLoop();
    }
  
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameActive]);

  const handleNoteHit = (lane) => {
    if (!gameActive) return;

    setNotes((prevNotes) => {
      const hitNoteIndex = prevNotes.findIndex(
        (note) =>
          note.lane === lane &&
          note.y >= CANVAS_HEIGHT - 150 &&
          note.y <= CANVAS_HEIGHT - 50
      );

      if (hitNoteIndex !== -1) {
        const newNotes = [...prevNotes];
        newNotes.splice(hitNoteIndex, 1);
        
        // Calculate points with speed multiplier
        const pointsWithMultiplier = Math.round(BASE_POINTS * currentSpeedRef.current);
        const newScore = currentScoreRef.current + pointsWithMultiplier;
        currentScoreRef.current = newScore;
        setScore(newScore);
        return newNotes;
      }

      return prevNotes;
    });
  };

  const endGame = async () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (speedIncreaseIntervalRef.current) {
      clearInterval(speedIncreaseIntervalRef.current);
    }
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.playbackRate = 1; // Resetear la velocidad al terminar
    }
    setSpeedMultiplier(1);
    currentSpeedRef.current = 1;
    setGameActive(false);
    setGameOver(true);

    const finalScore = currentScoreRef.current;
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        const currentHighScore = docSnap.data()?.rhythmInvadersScore || 0;
        
        if (finalScore > currentHighScore) {
          setHighScore(finalScore);
          await updateDoc(userDocRef, {
            rhythmInvadersScore: finalScore
          });
        }
      } catch (error) {
        console.error('Error updating score:', error);
      }
    }
  };

  return (
    <div className="container text-center">
      <h1 className="mt-4">Pokémon Rhythm Game</h1>
      <h3>High Score: {highScore}</h3>

      {!gameActive && !gameOver ? (
        <div>
          <button 
            className="btn btn-primary btn-lg mt-3" 
            onClick={startGame} 
            disabled={!isAudioLoaded}
          >
            {isAudioLoaded ? 'Start Game' : 'Loading audio...'}
          </button>
        </div>
      ) : gameOver ? (
        <div>
          <h2>Game Over!</h2>
          <p>Your Score: {score}</p>
          {score > highScore && <p className="text-success">New High Score!</p>}
          <button className="btn btn-primary mt-3" onClick={startGame}>
            Play Again
          </button>
        </div>
      ) : (
        <div>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border"
          />
          <div className="mt-3">
            <h3>
              Score: {score} | Points per Hit: {Math.round(BASE_POINTS * speedMultiplier)} | Missed: {missed}/{MAX_MISSED} | Speed: {speedMultiplier.toFixed(1)}x
            </h3>
            <div className="btn-group">
              {['A', 'S', 'D', 'F'].map((lane, index) => (
                <button
                  key={lane}
                  className="btn btn-dark m-4"
                  onClick={() => handleNoteHit(index)}
                >
                  {lane}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
