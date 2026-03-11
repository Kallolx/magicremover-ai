
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import BanglaConverter from './pages/BanglaConverter';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/bangla" element={<BanglaConverter />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
