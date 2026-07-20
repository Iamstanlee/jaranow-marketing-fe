import React, { Suspense } from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const Home = React.lazy(() => import('./pages/Home'));
const CarwashLanding = React.lazy(() => import('./pages/CarwashLanding'));
const WashLanding = React.lazy(() => import('./pages/WashLanding'));
const WashRecommendation = React.lazy(() => import('./pages/WashRecommendation'));
const Deck = React.lazy(() => import("./pages/Deck"));
const Pricing = React.lazy(() => import('./pages/Pricing'));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      <p className="text-gray-600">Loading...</p>
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
                    {/* Legacy /wash routes redirect to /laundry */}
                    <Route path="/wash" element={<Navigate to="/laundry" replace/>}/>
                    <Route path="/wash/recommendation" element={<Navigate to="/laundry/recommendation" replace/>}/>
                    <Route path="/pricing" element={<Pricing/>}/>
                    <Route path="/pitch-deck" element={<Deck/>}/>
                </Routes>
              </Suspense>
          </Router>
      </HelmetProvider>
  );
}

export default App;
