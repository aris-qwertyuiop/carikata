import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  BackgroundImage,
  Level1Image,
  Level2Image,
  Level3Image,
  Level4Image,
} from '../assets';
import BackButton from '../components/BackButton';

const GRID_SIZE = 10;

const getRandomLetter = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[Math.floor(Math.random() * letters.length)];
};

const getDirectionsByLevel = (level) => {
  const levelNum = parseInt(level, 10);
  if (levelNum === 1) return [[0, 1], [1, 0]];
  if (levelNum === 2) return [[0, 1], [1, 0], [1, 1]];
  if (levelNum === 3) return [[0, 1], [1, 0], [1, 1]];
  return [[0, 1], [1, 0], [1, 1], [1, -1]];
};

const generateWordSearchGrid = (words, directions) => {
  const maxTotalAttempts = 100;

  for (let attempt = 0; attempt < maxTotalAttempts; attempt++) {
    const grid = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(null)
    );

    const occupied = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(false)
    );

    const canPlaceWord = (word, startX, startY, dx, dy) => {
      const len = word.length;

      for (let i = 0; i < len; i++) {
        const x = startX + dx * i;
        const y = startY + dy * i;

        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;

        const cell = grid[x][y];
        const letter = word[i].toUpperCase();

        // Jika sel tidak kosong dan tidak cocok dengan huruf yang ingin ditaruh
        if (cell !== null && cell !== letter) return false;

        // Periksa sekeliling agar tidak bersentuhan
        for (let xi = -1; xi <= 1; xi++) {
          for (let yi = -1; yi <= 1; yi++) {
            const nx = x + xi;
            const ny = y + yi;

            // Skip posisi huruf itu sendiri
            if (xi === 0 && yi === 0) continue;

            // Cek area sekitar
            if (
              nx >= 0 &&
              nx < GRID_SIZE &&
              ny >= 0 &&
              ny < GRID_SIZE &&
              occupied[nx][ny]
            ) {
              return false;
            }
          }
        }
      }

      return true;
    };

    const placeWord = (word) => {
      const upperWord = word.toUpperCase();
      const maxAttemptsPerWord = 100;

      for (let i = 0; i < maxAttemptsPerWord; i++) {
        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        const startX = Math.floor(Math.random() * GRID_SIZE);
        const startY = Math.floor(Math.random() * GRID_SIZE);

        if (canPlaceWord(upperWord, startX, startY, dx, dy)) {
          for (let j = 0; j < upperWord.length; j++) {
            const x = startX + dx * j;
            const y = startY + dy * j;
            grid[x][y] = upperWord[j];
            occupied[x][y] = true;
          }
          return true;
        }
      }

      return false;
    };

    let success = true;
    for (const word of words) {
      if (!placeWord(word)) {
        success = false;
        break;
      }
    }

    if (success) {
      // Isi grid dengan huruf acak di posisi kosong
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          if (!grid[i][j]) {
            grid[i][j] = getRandomLetter();
          }
        }
      }
      return grid;
    }
  }

  throw new Error("Gagal membuat grid yang valid.");
};

const LevelPage = () => {
  const { id } = useParams();
  const [words, setWords] = useState([]);
  const [grid, setGrid] = useState([]);
  const [kategori, setKategori] = useState('');
  const [bgImage, setBgImage] = useState(BackgroundImage);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundWordsCells, setFoundWordsCells] = useState([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragDirection, setDragDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const startTimeRef = useRef(Date.now());

  const levelImages = {
    1: Level1Image,
    2: Level2Image,
    3: Level3Image,
    4: Level4Image,
  };

  useEffect(() => {
    if (words.length > 0 && foundWords.length === words.length) {
      const endTime = Date.now();
      const durationInSeconds = Math.floor(
        (endTime - startTimeRef.current) / 1000
      );

      navigate('/finish', {
        state: {
          duration: durationInSeconds,
          level: id,
        },
      });
    }
  }, [foundWords, words, navigate, id]);

  useEffect(() => {
    setBgImage(levelImages[id] || BackgroundImage);
    const fetchWords = async () => {
      try {
        const ref = doc(db, 'kata_per_level', `level_${id}`);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const upperWords = (data.kata || []).map((w) => w.toUpperCase());
          const directions = getDirectionsByLevel(id);
          setWords(upperWords);
          setKategori(data.kategori || 'Tidak diketahui');
          setGrid(generateWordSearchGrid(upperWords, directions));
        }
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [id]);

  const handleMouseDown = (row, col) => {
    setIsMouseDown(true);
    setSelectedCells([[row, col]]);
    setDragDirection(null);
  };

  const handleMouseEnter = (row, col) => {
    if (!isMouseDown) return;

    const last = selectedCells[selectedCells.length - 1];
    if (!last) return;

    const [lastRow, lastCol] = last;
    if (selectedCells.some(([r, c]) => r === row && c === col)) return;

    const dx = row - lastRow;
    const dy = col - lastCol;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return;

    if (!dragDirection && selectedCells.length === 1) {
      setDragDirection([dx, dy]);
      setSelectedCells((prev) => [...prev, [row, col]]);
      return;
    }

    if (dragDirection && dx === dragDirection[0] && dy === dragDirection[1]) {
      setSelectedCells((prev) => [...prev, [row, col]]);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);

    const selectedWord = selectedCells
      .map(([r, c]) => grid[r][c])
      .join('')
      .toUpperCase();

    if (words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
      setFoundWords((prev) => [...prev, selectedWord]);
      setFoundWordsCells((prev) => [...prev, ...selectedCells]);
    }

    setSelectedCells([]);
    setDragDirection(null);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-300 to-blue-500 p-4 w-full h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <BackButton />
      <div className="text-center text-white my-8 md:mt-14 md:mb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold font-fredoka">
          Level {id}: {kategori}
        </h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-32">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-fredoka text-lg mt-4">
            Memuat data game...
          </p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-start justify-center gap-6">
          <div
            className="grid grid-cols-10 gap-1 bg-blue-200 rounded-3xl shadow-xl p-3 select-none touch-none overscroll-contain"
            onMouseLeave={() => setIsMouseDown(false)}
            onTouchEnd={handleMouseUp}
          >
            {grid.map((row, rowIndex) =>
              row.map((char, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-md border text-sm md:text-base font-bold
                  ${selectedCells.some(([r, c]) => r === rowIndex && c === colIndex)
                    ? 'bg-blue-700 text-black'
                    : foundWordsCells.some(([r, c]) => r === rowIndex && c === colIndex)
                      ? 'bg-blue-700 text-black'
                      : 'bg-white text-blue-600'
                  }`}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                  onTouchStart={() => handleMouseDown(rowIndex, colIndex)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && target.dataset) {
                      const r = parseInt(target.dataset.row);
                      const c = parseInt(target.dataset.col);
                      if (!isNaN(r) && !isNaN(c)) handleMouseEnter(r, c);
                    }
                  }}
                  data-row={rowIndex}
                  data-col={colIndex}
                >
                  {char}
                </div>
              ))
            )}
          </div>

          <div className="p-4 w-full md:w-auto">
            <h2 className="text-white text-3xl md:text-5xl font-bold mb-2 font-fredoka">Cari Kata:</h2>
            <ol className="list-decimal pl-5 space-y-1 text-white font-semibold text-xl md:text-2xl">
              {words.map((word, i) => (
                <li
                  key={i}
                  className={foundWords.includes(word) ? 'line-through text-blue-100' : ''}
                >
                  {word}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelPage;
