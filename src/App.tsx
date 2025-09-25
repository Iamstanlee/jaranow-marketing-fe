import React, { Suspense } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const JaranowLanding = React.lazy(() => import('./pages/JaranowLanding'));
const WashLanding = React.lazy(() => import('./pages/WashLanding'));
const Deck = React.lazy(() => import("./pages/Deck"));

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
                    <Route path="/" element={<JaranowLanding/>}/>
                    <Route path="/wash" element={<WashLanding/>}/>
                    <Route path="/pitch-deck" element={<Deck/>}/>
                </Routes>
              </Suspense>
          </Router>
      </HelmetProvider>
  );
}

export default App;
