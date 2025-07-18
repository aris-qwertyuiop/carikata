import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { BackgroundImage } from '../assets';
import BackButton from '../components/BackButton';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
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

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        username: username,
        role: 'user',
        level: 1
      });

      localStorage.setItem('email', email);
      localStorage.setItem('username', username);
      localStorage.setItem('role', 'user');
      navigate('/bermain');
    } catch (err) {
      setError('Gagal mendaftar. Coba lagi.');
    }
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start pt-10"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <BackButton to="/" />

      <h1 className="text-4xl font-bold text-white drop-shadow-md font-fredoka mt-4 mb-10 py-3 px-20 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 shadow-lg">
        Register
      </h1>

      <form
        onSubmit={handleRegister}
        className="flex flex-col items-center gap-6 bg-white bg-opacity-90 rounded-3xl p-10 shadow-2xl w-[90%] md:w-[500px]"
      >
        {error && <p className="text-red-600 font-semibold">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="px-4 py-3 rounded-full w-full text-lg font-fredoka border border-gray-300"
        />
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
        <button
          type="submit"
          className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-xl font-fredoka py-3 px-10 rounded-full shadow-lg w-full"
        >
          Daftar
        </button>

        <p className="text-sm font-fredoka mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
