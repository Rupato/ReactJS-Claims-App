import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ClaimsDashboard from './features/claims-management/components/ClaimsDashboard';
import { LoadingSkeleton } from './shared/ui/LoadingSkeleton';
import { ToastProvider } from './shared/ui/ToastContext';
import ToastContainer from './shared/ui/ToastContainer';

// Lazy load the CreateClaimForm for better performance
const CreateClaimForm = lazy(
  () => import('./features/claims-management/components/CreateClaimForm')
);

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClaimsDashboard />} />
          <Route
            path="/create"
            element={
              <Suspense fallback={<LoadingSkeleton viewMode="cards" />}>
                <CreateClaimForm />
              </Suspense>
            }
          />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
