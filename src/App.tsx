
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/history" element={<Layout><History /></Layout>} />
            <Route path="/results/:searchId" element={<Layout><Results /></Layout>} />
            <Route path="/saved-profiles" element={<Layout><SavedProfiles /></Layout>} />
            <Route path="/shortlist/:searchId" element={<Layout><Shortlist /></Layout>} />
            <Route path="/process" element={<Layout><Process /></Layout>} />
            <Route path="/transcript/:candidateId" element={<Layout><Transcript /></Layout>} />
            <Route path="/final-selects" element={<Layout><FinalSelects /></Layout>} />
            <Route path="/candidate/:id" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold text-foreground">Candidate Profile</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />
            <Route path="/joinees" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold text-foreground">Joinees</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />
            <Route path="/account" element={<Layout><Account /></Layout>} />
            <Route path="/billing" element={<Layout><Billing /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="/help" element={<Layout><Help /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
