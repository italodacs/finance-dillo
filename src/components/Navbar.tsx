import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-gray-200 dark:bg-gray-800">
      {/* Logo */}
      <h1
        className="text-xl font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        Finance App
      </h1>

      {/* Menu de Navegação */}
      <div className="flex items-center space-x-4">
        {/* Link Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className={`px-4 py-2 rounded transition ${
            isActive("/dashboard")
              ? "bg-blue-500 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Dashboard
        </button>

        {/* Link Registrar */}
        <button
          onClick={() => navigate("/registrar")}
          className={`px-4 py-2 rounded transition ${
            isActive("/registrar")
              ? "bg-blue-500 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Registrar
        </button>

        {/* Link Questões */}
        <button
          onClick={() => navigate("/questions")}
          className={`px-4 py-2 rounded transition ${
            isActive("/questions")
              ? "bg-blue-500 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Questões
        </button>

        {/* Toggle Tema */}
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          Sair
        </button>
      </div>
    </nav>
  );
};
