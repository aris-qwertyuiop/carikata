import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { LeaderboardImage } from '../assets';
import BackButton from '../components/BackButton';

const LeaderboardLevel = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardRef = collection(db, `leaderboard_level${id}`);
        const querySnapshot = await getDocs(leaderboardRef);
        const results = querySnapshot.docs.map(doc => doc.data());

        // Urutkan secara manual berdasarkan duration, lalu timestamp
        results.sort((a, b) => {
          if (a.duration !== b.duration) {
            return a.duration - b.duration;
          }
          return (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0);
        });

        setData(results);
      } catch (err) {
        console.error('Gagal mengambil leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [id]);


  return (
    <div
      className="w-full min-h-screen bg-fixed bg-cover bg-center bg-no-repeat flex flex-col items-center pt-10 pb-20 px-4"
      style={{ backgroundImage: `url(${LeaderboardImage})` }}
    >

      <BackButton to="/leaderboard" />
      <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 text-3xl sm:text-4xl font-bold text-white drop-shadow-md font-fredoka mt-4 py-3 px-8 rounded-full shadow-lg text-center">
        Leaderboard
      </h1>
      <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 text-3xl sm:text-4xl font-bold text-white drop-shadow-md font-fredoka mt-4 mb-6 py-3 px-8 rounded-full shadow-lg text-center">
        Level {id}
      </h1>

      {loading ? (
        <p className="text-white font-fredoka text-lg">Memuat leaderboard...</p>
      ) : data.length === 0 ? (
        <p className="text-white font-fredoka text-lg">Belum ada data leaderboard.</p>
      ) : (
        <ul className="w-full max-w-xl space-y-4">
          {data.map((entry, index) => (
            <li
              key={index}
              className="bg-white bg-opacity-80 rounded-xl p-4 shadow-md flex justify-between items-center"
            >
              <span className="font-bold text-lg">{index + 1}. {entry.username}</span>
              <span className="text-blue-700 font-bold text-lg">{entry.duration} detik</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/"
        className="mt-10 bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-xl font-bold font-fredoka py-3 px-10 rounded-full shadow-lg transition text-center"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default LeaderboardLevel;