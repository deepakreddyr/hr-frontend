import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Results from "./pages/Results";
import SavedProfiles from "./pages/SavedProfiles";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Shortlist from "./pages/Shortlist";
import Process from "./pages/Process";
import Transcript from "./pages/Transcript";
import FinalSelects from "./pages/FinalSelects";
import Account from "./pages/Account";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Loading from "./pages/Loading";
import PrivateRoute from "./routes/PrivateRoute";
import CreateTask from "./pages/CreateTask";
import TaskDrawer from "./pages/TaskInBox";
import ShortlistSimple from "./pages/ShortlistSimple";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/loading" element={<Loading />} />

            {/* Redirect root → dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout><Dashboard /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <Layout><History /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/results/:searchId"
              element={
                <PrivateRoute>
                  <Layout><Results /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/saved-profiles"
              element={
                <PrivateRoute>
                  <Layout><SavedProfiles /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/simple-shortlist"
              element={
                <PrivateRoute>
                  <Layout><ShortlistSimple /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/simple-shortlist/:searchId"
              element={
                <PrivateRoute>
                  <Layout><TaskDrawer /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/shortlist/:searchId"
              element={
                <PrivateRoute>
                  <Layout><Shortlist /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/shortlist"
              element={
                <PrivateRoute>
                  <Layout><Shortlist /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/process/:searchId"
              element={
                <PrivateRoute>
                  <Layout><Process /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/transcript/:candidateId"
              element={
                <PrivateRoute>
                  <Layout><Transcript /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/final-selects"
              element={
                <PrivateRoute>
                  <Layout><FinalSelects /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/candidate/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold text-foreground">Candidate Profile</h1>
                      <p className="text-muted-foreground">Coming Soon</p>
                    </div>
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/joinees"
              element={
                <PrivateRoute>
                  <Layout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold text-foreground">Joinees</h1>
                      <p className="text-muted-foreground">Coming Soon</p>
                    </div>
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Layout><Account /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <PrivateRoute>
                  <Layout><Billing /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Layout><Settings /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/help"
              element={
                <PrivateRoute>
                  <Layout><Help /></Layout>
                </PrivateRoute>
              }
            />
             <Route
              path="/create-task"
              element={
                <PrivateRoute>
                  <Layout><CreateTask /></Layout>
                </PrivateRoute>
              }
            />
             <Route
              path="/inbox"
              element={
                <PrivateRoute>
                  <Layout><TaskDrawer /></Layout>
                </PrivateRoute>
              }
            />
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
