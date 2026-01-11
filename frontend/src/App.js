import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import '@/App.css';

const Layout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-slate-900">E-Zone Computers</h1>
              </div>
              <div className="ml-10 flex space-x-1">
                <Link
                  to="/"
                  data-testid="dashboard-nav-link"
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === '/'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/stock"
                  data-testid="stock-nav-link"
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === '/stock'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Stock
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock" element={<Stock />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;