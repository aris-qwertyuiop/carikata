import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackgroundImage } from '../assets';
import BackButton from '../components/BackButton';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaLock } from 'react-icons/fa';
import { auth, db } from '../firebase';

const BermainPage = () => {
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserLevel(userDocSnap.data().level || 1);
          } else {
            navigate('/login');
          }

          const levelSnapshot = await getDocs(collection(db, 'kata_per_level'));
          const levelList = levelSnapshot.docs
            .map(doc => doc.id) // ex: 'level_1', 'level_2'
            .filter(id => id.startsWith('level_'))
            .map(id => parseInt(id.replace('level_', '')))
            .sort((a, b) => a - b);

          setLevels(levelList);
        } catch (error) {
          console.error('Gagal memuat data:', error);
          navigate('/login');
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start pt-10 pb-20"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <BackButton to='/' />

      <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-4xl font-bold text-white drop-shadow-md font-fredoka mt-4 mb-10 py-3 px-20 rounded-full shadow-lg transition text-center">
        Level
      </h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-32">
          <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-fredoka text-lg mt-4">Memuat data level...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4 mt-6 overflow-y-auto max-h-[calc(100vh-250px)] pb-6">
          {levels.map((level) => {
            const locked = userLevel !== null && level > userLevel;

            return locked ? (
              <div
                key={level}
                className="relative bg-gradient-to-b from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-blue-200 text-4xl font-bold font-fredoka py-3 px-20 rounded-full shadow-inner transition text-center cursor-not-allowed"
              >
                <FaLock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-200 text-2xl" />
                Level {level}
              </div>
            ) : (
              <Link
                key={level}
                to={`/level/${level}`}
                className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-4xl font-bold font-fredoka py-3 px-20 rounded-full shadow-lg transition text-center"
              >
                Level {level}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BermainPage;