import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { HomeImage } from '../assets';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
      }

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.data());
      if (docSnap.exists()) {
        const userRole = docSnap.data().role;
        const isAdmin = userRole === 'admin';
        setAllowed(isAdmin);
        if (!isAdmin) {
          window.alert('Kamu bukan admin, dilarang mengakses halaman ini');
        }
      } else {
        setAllowed(false);
        navigate('/login');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div
      className="w-full h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{ backgroundImage: `url(${HomeImage})` }}
    >
      <h1 className='text-white text-4xl font-bold'>Memuat...</h1>
    </div>
  );
  if (!allowed) return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;