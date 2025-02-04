import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PokemonSearch.css';

export const PokemonSearch = ({ onSelect }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTerm.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const formattedSearch = searchTerm.trim().toLowerCase();
        
        const fetchPokemon = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
                const data = await response.json();
                
                const filtered = data.results.filter(pokemon =>
                    pokemon.name.includes(formattedSearch)
                );
                setSuggestions(filtered);
                setIsOpen(filtered.length > 0);
                setHighlightedIndex(-1);
            } catch (error) {
                console.error("Error fetching Pokémon:", error);
            }
        };

        fetchPokemon();
    }, [searchTerm]);

    const handleKeyDown = (e) => {
        if (!suggestions.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSelect(suggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSelect = (pokemon) => {
        setSearchTerm(pokemon.name);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current.blur(); // Se quita el focus del input

        onSelect?.(pokemon.name);
        navigate(`/pokemon/${pokemon.name}`);
    };

    return (
        <div className="pokemon-search" ref={dropdownRef}>
            <div className="search-container">
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Buscar Pokémon"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(suggestions.length > 0)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 150)} // Pequeño delay para permitir el click en opciones
                />
            </div>
            
            {isOpen && suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((pokemon, index) => (
                        <li key={pokemon.name}>
                            <button
                                className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Evita que el input pierda el focus antes de seleccionar
                                    handleSelect(pokemon);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                {pokemon.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
