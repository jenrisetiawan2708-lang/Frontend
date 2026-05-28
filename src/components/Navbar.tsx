import logo from "../assets/logo-navbar.png";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="HOMIA"
            className="w-[70px] object-contain"
          />

          <h1 className="text-blue-600 font-extrabold text-2xl tracking-wide">
            HOMIA
          </h1>
        </div>

        {/* MENU */}
        <div className="flex gap-7 text-sm font-semibold items-center text-gray-700">
          {/* BERANDA */}
          <Link
            to="/"
            className="hover:text-blue-600 transition duration-200"
          >
            Beranda
          </Link>

          {/* FITUR */}
          <button
            onClick={() => {
              document
                .getElementById("fitur-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-blue-600 transition duration-200"
          >
            Fitur
          </button>

          {/* PROFILE */}
          <button
            onClick={() => {
              document
                .getElementById("profile-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-blue-600 transition duration-200"
          >
            Profile
          </button>

          {/* LOGIN BUTTON */}
          <Link
            to="/login"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg
            hover:bg-blue-700 hover:scale-105
            transition-all duration-200 shadow-sm"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}