import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FinishImage } from '../assets';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const FinishGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [nama, setNama] = useState('');
  const { duration, level } = location.state || {};

  useEffect(() => {
    if (!duration || !level) {
      navigate('/bermain');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const username = data.username;
            const currentLevel = data.level || 1;
            setNama(username);

            const leaderboardRef = collection(db, `leaderboard_level${level}`);
            await addDoc(leaderboardRef, {
              username,
              duration,
              timestamp: serverTimestamp(),
            });

            // Naikkan level jika level sekarang < 4 dan level yang diselesaikan sama dengan level saat ini
            if (parseInt(level) === currentLevel) {
              await updateDoc(userRef, {
                level: currentLevel + 1,
              });
            }
          } else {
            console.error('Data pengguna tidak ditemukan.');
            navigate('/');
          }
        } catch (error) {
          console.error('Gagal proses data finish game:', error);
          navigate('/');
        }
      } else {
        console.error('Pengguna tidak login.');
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate, duration, level]);

  return (
    <div
      className="min-h-screen bg-green-100 flex items-center justify-center flex-col p-4 text-center w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${FinishImage})` }}
    >
      <h1 className="text-4xl md:text-6xl font-bold text-white">Selamat</h1>
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">Permainan Selesai</h1>
      <p className="text-2xl text-white mb-3">
        <strong>{nama}</strong> menyelesaikan <strong>level {level}</strong> dalam waktu:
      </p>
      <p className="text-3xl font-bold text-white">{duration} detik</p>

      <div className="flex flex-col sm:flex-row gap-6 mt-12">
        <Link
          to="/bermain"
          className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-2xl sm:text-3xl font-bold font-fredoka py-3 px-8 rounded-full shadow-lg transition text-center"
        >
          Kembali Bermain
        </Link>
        <Link
          to={`/leaderboard/${level}`}
          className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-2xl sm:text-3xl font-bold font-fredoka py-3 px-8 rounded-full shadow-lg transition text-center"
        >
          Lihat Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default FinishGame;