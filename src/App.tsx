import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import JaranowLanding from './pages/JaranowLanding';
import WashLanding from './pages/WashLanding';
import Deck from "./pages/Deck";

function App() {
  return (
      <HelmetProvider>
          <Router>
              <Routes>
                  <Route path="/" element={<JaranowLanding/>}/>
                  <Route path="/wash" element={<WashLanding/>}/>
                  <Route path="/pitch-deck" element={<Deck/>}/>
              </Routes>
          </Router>
      </HelmetProvider>
  );
}

export default App;
