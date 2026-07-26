import { Link, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useAuthStore } from "../store/authStore";

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
      <Link to="/" className="flex min-w-0 items-center gap-3">
        <img src="/logo.png" alt="Meeting Market" className="h-12 w-12 rounded-full object-cover ring-1 ring-gold/50" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-cream">Meeting Market</p>
          <p className="text-xs text-cream/55">рынок встреч</p>
        </div>
      </Link>
      {user ? (
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-cream/70 sm:inline">{user.username}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      ) : null}
    </header>
  );
}
