import React, { Suspense } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const Home = React.lazy(() => import('./pages/Home'));
const CarwashLanding = React.lazy(() => import('./pages/CarwashLanding'));
const WashLanding = React.lazy(() => import('./pages/WashLanding'));
const WashRecommendation = React.lazy(() => import('./pages/WashRecommendation'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Business = React.lazy(() => import('./pages/Business'));
const Rugs = React.lazy(() => import('./pages/Rugs'));
const Careers = React.lazy(() => import('./pages/Careers'));
// Chunk name is read by scripts/prerender-meta.js to preload it; keep in step with
// `preloadChunk` in src/seo/routes.json.
const Bookkeeping = React.lazy(() => import(/* webpackChunkName: "book" */ './pages/Bookkeeping'));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-paper">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="text-ink/60">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
      <HelmetProvider>
          <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/carwash" element={<CarwashLanding/>}/>
                    <Route path="/laundry" element={<WashLanding/>}/>
                    <Route path="/laundry/recommendation" element={<WashRecommendation/>}/>
                    <Route path="/pricing" element={<Pricing/>}/>
                    <Route path="/business" element={<Business/>}/>
                    <Route path="/rugs" element={<Rugs/>}/>
                    <Route path="/careers" element={<Careers/>}/>
                    <Route path="__/book" element={<Bookkeeping/>}/>
                </Routes>
              </Suspense>
          </Router>
      </HelmetProvider>
  );
}

export default App;
