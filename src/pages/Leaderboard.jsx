import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BackgroundImage } from '../assets';
import BackButton from '../components/BackButton';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const LeaderboardPage = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const colRef = collection(db, 'kata_per_level');
        const snapshot = await getDocs(colRef);
        const levelNumbers = snapshot.docs
          .map((doc) => {
            const match = doc.id.match(/^level_(\d+)$/);
            return match ? parseInt(match[1], 10) : null;
          })
          .filter((lvl) => lvl !== null)
          .sort((a, b) => a - b);
        setLevels(levelNumbers);
      } catch (err) {
        console.error('Gagal mengambil daftar level:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start pt-10 pb-20"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <BackButton to="/" />

      <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 text-4xl font-bold text-white drop-shadow-md font-fredoka mt-4 mb-10 py-3 px-20 rounded-full shadow-lg transition text-center">
        Leaderboard
      </h1>

      {loading ? (
        <p className="text-white font-fredoka text-lg">Memuat level...</p>
      ) : levels.length === 0 ? (
        <p className="text-white font-fredoka text-lg">Belum ada level tersedia.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4 mt-6 overflow-y-auto max-h-[calc(100vh-250px)] pb-6">
          {levels.map((level) => (
            <Link
              key={level}
              to={`/leaderboard/${level}`}
              className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-4xl font-bold font-fredoka py-3 px-20 rounded-full shadow-lg transition text-center"
            >
              Level {level}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;