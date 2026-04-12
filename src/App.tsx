import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import NovelDetailPage from "@/pages/NovelDetailPage";
import ChaptersPage from "@/pages/ChaptersPage";
import ReaderPage from "@/pages/ReaderPage";
import RankingsPage from "@/pages/RankingsPage";
import LibraryPage from "@/pages/LibraryPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/novel/:detailPath" element={<NovelDetailPage />} />
              <Route path="/novel/:detailPath/chapters" element={<ChaptersPage />} />
              <Route path="/read/:chapterId" element={<ReaderPage />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
