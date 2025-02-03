import { useState, useEffect } from 'react';
import { collection, onSnapshot, getFirestore } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

export const RankingSlider = () => {
    const [ranking, setRanking] = useState([]);
    const db = getFirestore();

    useEffect(() => {
        const usersCollection = collection(db, 'users');
        const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const sortedRanking = usersList
                .filter(user => user.pokemonGameScore || user.rhythmInvadersScore)
                .sort((a, b) => (b.pokemonGameScore + b.rhythmInvadersScore) - (a.pokemonGameScore + a.rhythmInvadersScore))
                .slice(0, 10);
            
            setRanking(sortedRanking);
        }, (error) => {
            console.error('Error fetching ranking:', error);
        });

        return () => unsubscribe();
    }, [db]);

    return (
        <div className="container mt-4">
            <h2 className="text-center">Ranking de Jugadores</h2>
            <Swiper
                modules={[Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                pagination={{ clickable: true }}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                }}
            >
                {ranking.map((player, index) => (
                    <SwiperSlide key={player.id}>
                        <div className="card shadow text-center p-3">
                            <h5 className="text-danger">#{index + 1}</h5>
                            <p className="mb-1">{player.displayName || player.email || 'Anónimo'}</p>
                            <h4 className="text-primary">{player.pokemonGameScore || 0} pts (Guess)</h4>
                            <h4 className="text-primary">{player.rhythmInvadersScore || 0} pts (Rhythm)</h4>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};
