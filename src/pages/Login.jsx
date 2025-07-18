import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { BackgroundImage } from '../assets';
import BackButton from '../components/BackButton';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        setError('Akun tidak ditemukan di database.');
        return;
      }

      const userData = userSnap.data();
      const role = userData.role || 'user';

      if (role === 'admin') {
        navigate('/admin');
        return;
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Email atau password salah. Silakan coba lagi.');
    }
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start pt-10"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <BackButton to="/" />

      <h1 className="text-4xl font-bold text-white drop-shadow-md font-fredoka mt-4 mb-10 py-3 px-20 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 shadow-lg">
        Login
      </h1>

      <form
        onSubmit={handleLogin}
        className="flex flex-col items-center gap-6 bg-white bg-opacity-90 rounded-3xl p-10 shadow-2xl w-[90%] md:w-[500px]"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-4 py-3 rounded-full w-full text-lg font-fredoka border border-gray-300"
        />
        <div className="relative w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 rounded-full w-full text-lg font-fredoka border border-gray-300 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        {error && <p className="text-red-600 font-semibold">{error}</p>}

        <button
          type="submit"
          className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-xl font-fredoka py-3 px-10 rounded-full shadow-lg w-full"
        >
          Masuk
        </button>

        <p className="text-sm font-fredoka mt-4">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
