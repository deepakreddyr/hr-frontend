
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Results from "./pages/Results";
import SavedProfiles from "./pages/SavedProfiles";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          <Route path="/results/:searchId" element={<Layout><Results /></Layout>} />
          <Route path="/saved-profiles" element={<Layout><SavedProfiles /></Layout>} />
          <Route path="/shortlist/:searchId" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold text-foreground">Shortlist Page</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />
          <Route path="/candidate/:id" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold text-foreground">Candidate Profile</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />
          <Route path="/joinees" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold text-foreground">Joinees</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />
          <Route path="/account" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold text-foreground">Account Settings</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />
          <Route path="/billing" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold text-foreground">Billing</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />
          <Route path="/settings" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold text-foreground">Settings</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />
          <Route path="/help" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold text-foreground">Help & Support</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
