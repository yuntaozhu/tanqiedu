import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Tools from './pages/Tools';
import Courseware from './pages/Courseware';
import Products from './pages/Products';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tools" element={<Tools />} />
        <Route path="courseware" element={<Courseware />} />
        <Route path="products" element={<Products />} />
      </Route>
    </Routes>
  );
}
