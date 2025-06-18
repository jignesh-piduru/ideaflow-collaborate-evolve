import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import IdeaManagement from "./components/IdeaManagement";
import IdeaDetails from "./pages/IdeaDetails";
import ProgressTracking from "./components/ProgressTracking";
import DatabaseTracker from "./pages/DatabaseTracker";
import ApiDevelopment from "./pages/ApiDevelopment";
import Deployment from "./pages/Deployment";
import Evidence from "./pages/Evidence";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => {
  // For testing purposes, we'll set the user role as admin
  const userRole = 'admin' as const;

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/ideas"
              element={
                <Layout userRole={userRole}>
                  <IdeaManagement userRole={userRole} />
                </Layout>
              }
            />
            <Route
              path="/ideas/:id"
              element={
                <Layout userRole={userRole}>
                  <IdeaDetails userRole={userRole} />
                </Layout>
              }
            />
            <Route
              path="/progress"
              element={
                <Layout userRole={userRole}>
                  <ProgressTracking userRole={userRole} />
                </Layout>
              }
            />
            <Route
              path="/database"
              element={
                <Layout userRole={userRole}>
                  <DatabaseTracker userRole={userRole} />
                </Layout>
              }
            />
            <Route
              path="/api"
              element={
                <Layout userRole={userRole}>
                  <ApiDevelopment userRole={userRole} />
                </Layout>
              }
            />
            <Route
              path="/deployment"
              element={
                <Layout userRole={userRole}>
                  <Deployment userRole={userRole} />
                </Layout>
              }
            />
            <Route
              path="/evidence"
              element={
                <Layout userRole={userRole}>
                  <Evidence userRole={userRole} />
                </Layout>
              }
            />
            <Route
              path="/assignments"
              element={
                <Layout userRole={userRole}>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Assignment Management</h2>
                    <p className="text-gray-600">Advanced assignment features coming soon with enhanced workflow management.</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout userRole={userRole}>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
