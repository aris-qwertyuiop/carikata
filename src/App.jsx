import { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';
import BermainPage from './pages/Bermain';
import LevelPage from './pages/LevelPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import KelolaKataPage from './pages/admin/KelolaKataPage';
import KelolaLeaderboard from './pages/admin/KelolaLeaderboard';
import KelolaUser from './pages/admin/KelolaUser';
import FinishGame from './pages/FinishGame';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRoute from './components/AdminRoute';
import LeaderboardPage from './pages/Leaderboard';
import LeaderboardLevel from './pages/LeaderboardLevel';

function App() {
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };

    const preventWheelZoom = (e) => {
      if (e.ctrlKey) e.preventDefault();
    };

    const preventKeyboardZoom = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "=")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchstart", preventZoom, { passive: false });
    document.addEventListener("touchend", preventDoubleTapZoom);
    window.addEventListener("wheel", preventWheelZoom, { passive: false });
    window.addEventListener("keydown", preventKeyboardZoom);

    return () => {
      document.removeEventListener("touchstart", preventZoom);
      document.removeEventListener("touchend", preventDoubleTapZoom);
      window.removeEventListener("wheel", preventWheelZoom);
      window.removeEventListener("keydown", preventKeyboardZoom);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bermain" element={<BermainPage />} />
        <Route path="/level/:id" element={<LevelPage />} />
        <Route path="/finish" element={<FinishGame />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/leaderboard/:id" element={<LeaderboardLevel />} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/kata" element={<AdminRoute><KelolaKataPage /></AdminRoute>} />
        <Route path="/admin/leaderboard" element={<AdminRoute><KelolaLeaderboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><KelolaUser /></AdminRoute>} />
      </Routes>
    </Router>
  )
}

export default App
