import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from "react-icons/fi";

const BackButton = ({ text = "Kembali", to = null, className = "" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full 
        bg-white bg-opacity-80 hover:bg-opacity-100 
        text-blue-700 font-semibold shadow-lg transition duration-300 
        ${className}`}
    >
      <FiArrowLeft size={20} />
      <span className="hidden sm:inline">{text}</span>
    </button>
  );
};

export default BackButton;