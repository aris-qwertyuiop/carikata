import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackgroundImage } from '../assets';
import { FaSignOutAlt } from 'react-icons/fa';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase'

const HomePage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.clear();

    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center bg-no-repeat flex flex-col sm:flex-col lg:flex-row items-center justify-center lg:justify-end sm:px-4 pr-0 lg:pr-10 relative"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* Judul Mobile */}
      <div className="block xl:hidden text-center mt-10 mb-30">
        <h1 className="text-white text-4xl sm:text-5xl font-bold font-fredoka drop-shadow-lg">
          Word Search Game
        </h1>
      </div>

      {/* Judul Desktop */}
      <div className="hidden xl:block absolute top-1/3 left-1/5 transform -translate-y-1/2 text-center">
        <h1 className="text-white text-6xl xl:text-8xl font-bold font-fredoka drop-shadow-lg leading-snug whitespace-pre-line">
          Word Search{'\n'}Game
        </h1>
      </div>

      {/* Tombol Admin & Logout */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {/* <Link
          to="/admin"
          className="bg-red-500 hover:bg-red-600 text-white text-lg sm:text-xl md:text-3xl font-bold font-fredoka py-2 sm:py-2.5 md:py-3 px-6 sm:px-8 md:px-10 rounded-full shadow-md transition"
        >
          Admin
        </Link> */}
        {currentUser && (
          <button
            onClick={handleLogout}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 text-blue-700 text-xl sm:text-2xl md:text-3xl p-3 rounded-full shadow-md transition"
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        )}
      </div>

      {/* Tombol Bermain & Leaderboard */}
      <div className="flex flex-col items-center gap-8 lg:gap-20 sm:mt-8 w-full sm:w-auto max-w-xs sm:max-w-sm lg:mr-40">
        <Link
          to="/bermain"
          className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-3xl sm:text-4xl md:text-5xl font-bold font-fredoka py-3 px-6 sm:px-10 rounded-full shadow-lg transition text-center w-full"
        >
          Bermain
        </Link>
        <Link
          to="/leaderboard"
          className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-3xl sm:text-4xl md:text-5xl font-bold font-fredoka py-3 px-6 sm:px-10 rounded-full shadow-lg transition text-center w-full"
        >
          Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default HomePage;