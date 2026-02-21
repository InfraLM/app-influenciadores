import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Influencers from "./pages/Influencers";
import Ranking from "./pages/Ranking";
import Documents from "./pages/Documents";
import Contents from "./pages/Contents";
import PerformanceEvaluation from "./pages/PerformanceEvaluation";
import MyProfile from "./pages/MyProfile";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AcceptInvite from "./pages/AcceptInvite";
import AccessDenied from "./pages/AccessDenied";
import Prospecting from "./pages/Prospecting";
import MetricsAnalysis from "./pages/MetricsAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Signup />} /> {/* Redirects to /login */}
              <Route path="/aceitar-convite" element={<AcceptInvite />} />
              <Route path="/acesso-negado" element={<AccessDenied />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/influenciadores"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AppLayout>
                      <Influencers />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conteudos"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Contents />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/avaliacao"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AppLayout>
                      <PerformanceEvaluation />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ranking"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Ranking />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documentos"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Documents />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prospeccao"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AppLayout>
                      <Prospecting />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analise-metricas"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AppLayout>
                      <MetricsAnalysis />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AppLayout>
                      <Users />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meu-perfil"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <MyProfile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
