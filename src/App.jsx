import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Import components
import { LandingPage } from "./components/LandingPage";
import { NotFound } from "./components/NotFound";
import { PokemonList } from "./components/PokemonList";
import { PokemonDetail } from "./components/PokemonDetail";
import { PokemonGame } from "./components/PokemonGame";
import { PokemonRhythm } from './components/PokemonRhythm';
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsLoggedIn(true);
        setUser(currentUser);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsLoading(false);
    });
  
    // Cleanup the listener when unmounting the component
    return () => unsubscribe();
  }, []);

  // Protect routes while loading authentication state
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-100vh bg-gray-100 flex flex-col" style={{ paddingBottom: '60px'}}>
        <Navigation
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          user={user}
        />

        <main className="container mx-auto p-4 flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pokemons" element={<PokemonList />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />

            {/* Protected Routes */}
            <Route
              path="/jugar"
              element={
                isLoggedIn ? <PokemonGame /> : <Navigate to="/login" replace />
              }
            />

            {/* Protected Routes */}
            <Route 
              path="/jugarBeta"
              element={
                isLoggedIn ? <PokemonRhythm /> : <Navigate to="/login" replace />
              }
            />
            {/* Authentication Routes */}
            <Route
              path="/login"
              element={
                !isLoggedIn ? (
                  <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/registro"
              element={!isLoggedIn ? <Register /> : <Navigate to="/" replace />}
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;