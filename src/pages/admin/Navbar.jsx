import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(true);

  return (
    <nav className="bg-[#5483e0] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="text-xl font-bold">Admin Panel</div>
          <div className="hidden md:flex gap-6">
            <Link to="/" className="hover:text-yellow-300">Home</Link>
            <Link to="/admin/kata" className="hover:text-yellow-300">Kelola Kata</Link>
            <Link to="/admin/leaderboard" className="hover:text-yellow-300">Leaderboard</Link>
            <Link to="/admin/users" className="hover:text-yellow-300">Manajemen User</Link>
          </div>
          <div className="md:hidden">
            <button onClick={() => setOpen(!open)} className="focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4">
          <Link to="/" className="block py-2 hover:text-yellow-300">Home</Link>
          <Link to="/admin/kata" className="block py-2 hover:text-yellow-300">Kata</Link>
          <Link to="/admin/leaderboard" className="block py-2 hover:text-yellow-300">Leaderboard</Link>
          <Link to="/admin/users" className="block py-2 hover:text-yellow-300">User</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;