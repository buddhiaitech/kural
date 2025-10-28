import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Constituencies from "./pages/Constituencies";
import ConstituencyList from "./pages/ConstituencyList";
import ConstituencyManage from "./pages/ConstituencyManage";
import Dashboard from "./pages/Dashboard";
import VoterManager from "./pages/VoterManager";
import FamilyManager from "./pages/FamilyManager";
import SurveyManager from "./pages/SurveyManager";
import BoothReports from "./pages/BoothReports";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/constituencies" element={<Constituencies />} />
          <Route path="/constituencies/list" element={<ConstituencyList />} />
          <Route path="/constituencies/manage" element={<ConstituencyManage />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/voter-manager/:id" element={<VoterManager />} />
          <Route path="/family-manager/:id" element={<FamilyManager />} />
          <Route path="/survey-manager/:id" element={<SurveyManager />} />
          <Route path="/booth-reports/:id" element={<BoothReports />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
export default App;