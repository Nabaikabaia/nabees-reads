import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Compass, Home, Search } from "lucide-react";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Seo
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Browse our novel library instead."
        path={location.pathname}
      />
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md space-y-6">
          <div
            className="mx-auto w-24 h-24 rounded-3xl flex items-center justify-center text-5xl font-extrabold text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            404
          </div>
          <div>
            <h1 className="text-3xl font-bold">Lost in the library</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              We couldn't find{" "}
              <code className="px-1.5 py-0.5 rounded bg-muted text-xs">
                {location.pathname}
              </code>
              . Let's get you back to a story.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              <Home className="h-4 w-4" /> Home
            </Link>
            <Link
              to="/genres"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted active:scale-95 transition-all"
            >
              <Compass className="h-4 w-4" /> Browse Genres
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted active:scale-95 transition-all"
            >
              <Search className="h-4 w-4" /> Search
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
