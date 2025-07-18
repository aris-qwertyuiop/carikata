import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
import Layout from './Layout';

const KelolaLeaderboard = () => {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLevels = async () => {
    try {
      const q = query(collection(db, 'levels'), orderBy('number'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        number: doc.data().number,
      }));
      setLevels(data);
      if (!selectedLevel && data.length > 0) {
        setSelectedLevel(data[0].number);
      }
    } catch (error) {
      console.error('Gagal mengambil daftar level:', error);
    }
  };

  const fetchLeaderboard = async () => {
    if (!selectedLevel) return;
    setLoading(true);
    try {
      const leaderboardRef = collection(db, `leaderboard_level${selectedLevel}`);
      const q = query(leaderboardRef, orderBy('duration', 'asc')); // Hanya satu orderBy

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedData = data.sort((a, b) => {
        if (a.duration !== b.duration) return a.duration - b.duration;
        if (a.timestamp && b.timestamp) {
          return a.timestamp.toMillis() - b.timestamp.toMillis();
        }
        return 0;
      });

      setLeaderboardData(sortedData);
    } catch (error) {
      console.error('Gagal mengambil data leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Apakah yakin ingin menghapus data ini?')) return;
    try {
      await deleteDoc(doc(db, `leaderboard_level${selectedLevel}`, id));
      fetchLeaderboard();
    } catch (error) {
      console.error('Gagal menghapus data:', error);
    }
  };

  const handleResetLeaderboard = async () => {
    if (!window.confirm('Apakah yakin ingin mereset leaderboard level ini?')) return;
    try {
      const q = query(collection(db, `leaderboard_level${selectedLevel}`));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      fetchLeaderboard();
    } catch (error) {
      console.error('Gagal reset leaderboard:', error);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedLevel]);

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Kelola Leaderboard</h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.number)}
              className={`px-4 py-2 rounded-full font-bold font-fredoka shadow-md transition ${selectedLevel === lvl.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
            >
              Level {lvl.number}
            </button>
          ))}
        </div>

        {selectedLevel && (
          <div className="mb-6">
            <button
              onClick={handleResetLeaderboard}
              className="bg-red-600 text-white px-4 py-2 rounded shadow-md hover:bg-red-700"
            >
              Reset Leaderboard Level {selectedLevel}
            </button>
          </div>
        )}

        {loading ? (
          <p>Loading leaderboard...</p>
        ) : leaderboardData.length === 0 ? (
          <p>Belum ada data leaderboard untuk level ini.</p>
        ) : (
          <table className="w-full table-auto border border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border px-4 py-2">No</th>
                <th className="border px-4 py-2">Username</th>
                <th className="border px-4 py-2">Durasi (detik)</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry, index) => (
                <tr key={entry.id} className="text-center bg-white">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{entry.username}</td>
                  <td className="border px-4 py-2">{entry.duration}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default KelolaLeaderboard;