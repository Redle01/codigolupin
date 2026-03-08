import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Toaster = lazy(() =>
  import("@/components/ui/toaster").then(m => ({ default: m.Toaster }))
);
const Sonner = lazy(() =>
  import("@/components/ui/sonner").then(m => ({ default: m.Toaster }))
);

const RouteFallback = () => (
  <div className="min-h-screen bg-background" />
);

const App = () => (
  <>
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
        <Route path="*" element={
          <Suspense fallback={<RouteFallback />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
