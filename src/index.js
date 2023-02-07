import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import TestPage from './TestPage';

const Root = () => (
  <Router>
    <Routes>
      <Route exact path="/" element={ <App/> } />
      <Route path="/test" element={ <TestPage/> } />
    </Routes>
  </Router>
);

createRoot(document.getElementById('root')).render(<Root />);