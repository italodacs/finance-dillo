import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-gray-100 border-b border-gray-300 shadow-sm">
      {/* Logo */}
      <h1
        className="text-xl font-bold text-gray-800 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        DilloFinance
      </h1>

      {/* Menu de Navegação */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/dashboard")}
          className={`px-4 py-2 rounded transition ${
            isActive("/dashboard")
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/registrar")}
          className={`px-4 py-2 rounded transition ${
            isActive("/registrar")
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          Registrar
        </button>

        <button
          onClick={() => navigate("/questions")}
          className={`px-4 py-2 rounded transition ${
            isActive("/questions")
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          Questões
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
