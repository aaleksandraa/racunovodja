import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import MapView from "./pages/MapView";
import Search from "./pages/Search";
import ServiceCategory from "./pages/ServiceCategory";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CityPage from "./pages/CityPage";
import ServiceCityPage from "./pages/ServiceCityPage";

const queryClient = new QueryClient();

// Sitemap redirect component
const SitemapRedirect = () => {
  window.location.href = 'https://puamysvniaiggrcunnod.supabase.co/functions/v1/sitemap';
  return null;
};

// RSS redirect component
const RSSRedirect = () => {
  window.location.href = 'https://puamysvniaiggrcunnod.supabase.co/functions/v1/rss';
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GoogleAnalytics />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mapa" element={<MapView />} />
            <Route path="/search" element={<Search />} />
            <Route path="/usluge/:categoryId" element={<ServiceCategory />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/registracija" 
              element={
                <ProtectedRoute>
                  <Registration />
                </ProtectedRoute>
              } 
            />
            <Route path="/profil/:slug" element={<Profile />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/lokacije/:citySlug" element={<CityPage />} />
            <Route path="/usluge/:serviceSlug/:citySlug" element={<ServiceCityPage />} />
            <Route path="/sitemap.xml" element={<SitemapRedirect />} />
            <Route path="/rss.xml" element={<RSSRedirect />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
