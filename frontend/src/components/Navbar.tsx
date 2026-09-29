import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { DiyaIcon } from "./HeritageMotifs";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-sandstone-light/95 backdrop-blur border-b-2 border-gold/40 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <DiyaIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <span className="font-display font-semibold text-2xl text-maroon tracking-wide">
            PlacesIndia
          </span>
        </Link>
        <div className="flex items-center gap-5 text-sm font-body">
          <Link to="/" className="text-ink/70 hover:text-maroon transition-colors">
            Browse
          </Link>
	  <Link to="/predict-development-score" className="text-ink/70 hover:text-maroon transition-colors">ML 			   Predictor
	  </Link>
	  <Link to="/compare" className="text-ink/70 hover:text-maroon transition-colors">Compare</Link>
	  <Link to="/rankings" className="text-ink/70 hover:text-maroon transition-colors">Rankings</Link>
	  <Link to="/map" className="text-ink/70 hover:text-maroon transition-colors">Map</Link>
          {user?.role === "admin" && (
          <Link to="/admin" className="text-ink/70 hover:text-maroon transition-colors">
              Admin
          </Link>
          )}
          {user ? (
            <>
              <span className="text-ink/50">Hi, {user.name}</span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-ink/70 hover:text-maroon transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-ink/70 hover:text-maroon transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-maroon text-sandstone-light px-4 py-2 rounded-full hover:bg-maroon-dark transition-colors shadow-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
