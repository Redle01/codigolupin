import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

// Lazy load non-critical components
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Toaster = lazy(() => 
  import("@/components/ui/toaster").then(m => ({ default: m.Toaster }))
);
const Sonner = lazy(() => 
  import("@/components/ui/sonner").then(m => ({ default: m.Toaster }))
);

const queryClient = new QueryClient();

// Minimal fallback for lazy routes
const RouteFallback = () => (
  <div className="min-h-screen bg-background" />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={null}>
      <Toaster />
      <Sonner />
    </Suspense>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={<RouteFallback />}>
              <Admin />
            </Suspense>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={
          <Suspense fallback={<RouteFallback />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
