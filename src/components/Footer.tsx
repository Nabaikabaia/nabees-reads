import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-semibold">Nabees Novel Zone</span>
        </div>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/rankings" className="hover:text-foreground transition-colors">Rankings</Link>
          <Link to="/search" className="hover:text-foreground transition-colors">Search</Link>
        </nav>
        <p className="text-sm text-muted-foreground">© 2026 Nabees Novel Zone</p>
      </div>
    </footer>
  );
}
