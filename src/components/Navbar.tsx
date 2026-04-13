import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, BookOpen, Moon, Sun, Menu, X, Home, Trophy, Library, Clock, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/rankings", label: "Rankings", icon: Trophy },
  { to: "/library", label: "Library", icon: Library },
  { to: "/history", label: "History", icon: Clock },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const [query, setQuery] = useState("");
  const { settings, setSettings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between gap-3">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold tracking-tight hidden sm:inline">
                Nabees <span className="text-primary">Novel Zone</span>
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop search + theme */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden md:flex relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </form>
            <button
              onClick={() => setSettings({ darkMode: !settings.darkMode })}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in sidebar */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                  <BookOpen className="h-6 w-6 text-primary" />
                  <span className="font-bold">Nabees Novel Zone</span>
                </Link>
                <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search novels..."
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </form>
              </div>

              {/* Nav items */}
              <nav className="flex-1 px-3 space-y-1">
                {NAV_ITEMS.map((item, i) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={() => setSettings({ darkMode: !settings.darkMode })}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {settings.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  {settings.darkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
