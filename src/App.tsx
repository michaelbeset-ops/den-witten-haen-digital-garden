import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ReservationPopup from "@/components/ReservationPopup";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import MenuPage from "./pages/Menu";
import ReservationPage from "./pages/Reserveren";
import PrivacyPage from "./pages/Privacy";
import CookiePage from "./pages/Cookies";
import GroupsPage from "./pages/Groepen";
import LocationsPage from "./pages/Locaties";
import TeamPage from "./pages/Team";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResetWachtwoordPage from "./pages/ResetWachtwoord";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

const queryClient = new QueryClient();

// Zet VITE_COMING_SOON="true" (in de deploy-workflow) om de publieke site tijdelijk
// te vervangen door een "Binnenkort online"-pagina. De admin-routes (/login,
// /dashboard, /reset-wachtwoord) blijven altijd bereikbaar. Verwijder de flag om
// de volledige site live te zetten.
const COMING_SOON = import.meta.env.VITE_COMING_SOON === "true";

const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
    <ReservationPopup />
    <CookieBanner />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          {COMING_SOON ? (
            /* Tijdelijke "Binnenkort online"-pagina voor alle publieke routes */
            <Route path="*" element={<ComingSoon />} />
          ) : (
            /* Public routes with Navbar / Footer */
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/reserveren" element={<ReservationPage />} />
              <Route path="/groepen" element={<GroupsPage />} />
              <Route path="/locaties" element={<LocationsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          )}

          {/* Auth / admin routes — no global Navbar/Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-wachtwoord" element={<ResetWachtwoordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
