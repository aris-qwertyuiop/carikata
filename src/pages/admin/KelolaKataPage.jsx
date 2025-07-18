import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import Layout from './Layout';

const KelolaKataPage = () => {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [kategori, setKategori] = useState('');
  const [newKata, setNewKata] = useState('');
  const [daftarKata, setDaftarKata] = useState([]);

  const fetchLevels = async () => {
    const q = query(collection(db, 'levels'), orderBy('number'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      number: doc.data().number,
    }));
    setLevels(data);
    if (!selectedLevel && data.length > 0) {
      setSelectedLevel(`level_${data[0].number}`);
    }
  };

  const fetchKata = async (levelId) => {
    const docRef = doc(db, 'kata_per_level', levelId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setKategori(data.kategori || '');
      setDaftarKata(data.kata || []);
    } else {
      setKategori('');
      setDaftarKata([]);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    if (selectedLevel) fetchKata(selectedLevel);
  }, [selectedLevel]);

  const handleAddKata = async () => {
    const trimmedKata = newKata.trim();

    if (!trimmedKata) return;

    if (trimmedKata.length > 10) {
      alert("❌ Kata terlalu panjang! Maksimal 10 huruf.");
      return;
    }

    if (/\s/.test(trimmedKata)) {
      alert("❌ Kata tidak boleh mengandung spasi!");
      return;
    }

    const docRef = doc(db, 'kata_per_level', selectedLevel);
    await setDoc(docRef, { kategori, kata: arrayUnion(trimmedKata) }, { merge: true });
    setNewKata('');
    fetchKata(selectedLevel);
  };


  const handleRemoveKata = async (word) => {
    const docRef = doc(db, 'kata_per_level', selectedLevel);
    await updateDoc(docRef, {
      kata: arrayRemove(word),
    });
    fetchKata(selectedLevel);
  };

  const handleKategoriUpdate = async () => {
    const docRef = doc(db, 'kata_per_level', selectedLevel);
    await setDoc(docRef, { kategori }, { merge: true });
  };

  const handleAddLevel = async () => {
    const nextNumber = levels.length > 0
      ? Math.max(...levels.map((lvl) => lvl.number)) + 1
      : 1;
    await addDoc(collection(db, 'levels'), { number: nextNumber });
    await fetchLevels();
    setSelectedLevel(`level_${nextNumber}`);
  };

  const handleDeleteLevel = async (level) => {
    const confirm = window.confirm(`Yakin ingin menghapus level ${level.number}? Ini akan menghapus kata juga.`);
    if (!confirm) return;

    // Hapus level dari koleksi levels
    await deleteDoc(doc(db, 'levels', level.id));

    // Hapus dokumen kata_per_level
    await deleteDoc(doc(db, 'kata_per_level', `level_${level.number}`));

    await fetchLevels();
    setSelectedLevel('');
    setKategori('');
    setDaftarKata([]);
  };

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Kelola Level</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(`level_${lvl.number}`)}
              className={`px-4 py-2 rounded-full font-bold font-fredoka shadow-md transition ${selectedLevel === `level_${lvl.number}`
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
            >
              Level {lvl.number}
            </button>
          ))}
          <button
            onClick={handleAddLevel}
            className="px-4 py-2 rounded-full bg-green-600 text-white font-bold"
          >
            + Tambah Level
          </button>
        </div>

        {selectedLevel && (
          <>
            <button
              onClick={() => {
                const levelObj = levels.find(
                  (lvl) => `level_${lvl.number}` === selectedLevel
                );
                handleDeleteLevel(levelObj);
              }}
              className="mb-4 bg-red-600 text-white px-4 py-2 rounded font-bold"
            >
              Hapus Level Ini
            </button>

            <h2 className="text-xl font-bold mb-4">Kelola Kata</h2>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">Nama Kategori:</label>
              <div className="flex gap-2">
                <input
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button
                  onClick={handleKategoriUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Ubah
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">Tambah Kata Baru:</label>
              <div className="flex gap-2">
                <input
                  value={newKata}
                  onChange={(e) => setNewKata(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button
                  onClick={handleAddKata}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Daftar Kata:</h3>
              <ul className="list-disc pl-5">
                {daftarKata.map((word, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center mb-1"
                  >
                    <span>
                      {index + 1}. {word}
                    </span>
                    <button
                      onClick={() => handleRemoveKata(word)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default KelolaKataPage;