import { Link, useNavigate } from "react-router-dom";
import { Search, BookOpen, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">
            Nabees <span className="text-primary">Novel Zone</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/rankings" className="text-muted-foreground hover:text-foreground transition-colors">Rankings</Link>
          <Link to="/library" className="text-muted-foreground hover:text-foreground transition-colors">Library</Link>
          <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors">History</Link>
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search novels..."
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </form>

        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search novels..."
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm outline-none"
            />
          </form>
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <Link to="/" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary">Home</Link>
            <Link to="/rankings" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary">Rankings</Link>
            <Link to="/library" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary">Library</Link>
            <Link to="/history" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary">History</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
