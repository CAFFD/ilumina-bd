import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import CitizenPortal from "./pages/CitizenPortal";
import TrackOccurrence from "./pages/TrackOccurrence";
import Dashboard from "./pages/Dashboard";
import OccurrencesList from "./pages/OccurrencesList";
import OperatorArea from "./pages/OperatorArea";
import PostesManagement from "./pages/PostesManagement";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/cidadao" element={<CitizenPortal />} />
            <Route path="/acompanhar" element={<TrackOccurrence />} />
            <Route path="/postes/:codigoPublico" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Rotas protegidas (operador+admin) */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="operator">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ocorrencias" element={
              <ProtectedRoute requiredRole="operator">
                <OccurrencesList />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/operadores" element={
              <ProtectedRoute requiredRole="admin">
                <OperatorArea />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/postes" element={
              <ProtectedRoute requiredRole="operator">
                <PostesManagement />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/relatorios" element={
              <ProtectedRoute requiredRole="operator">
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
