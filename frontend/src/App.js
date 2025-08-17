import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './contexts/Web3Context';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import BusinessPortal from './pages/BusinessPortal';
import CreateReceipt from './pages/CreateReceipt';
import RequestReceipt from './pages/RequestReceipt';
import VendorDashboard from './pages/VendorDashboard';
import Business from './pages/Business';
import Verify from './pages/Verify';
import ReceiptDetails from './pages/ReceiptDetails';
import './index.css';

const AppContent = () => {
  const location = useLocation();
  const showNavbar = !['/', '/business-portal', '/customer'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      
      <main className={showNavbar ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/business-portal" element={<BusinessPortal />} />
          <Route path="/create" element={<CreateReceipt />} />
          <Route path="/request" element={<RequestReceipt />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/business" element={<Business />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/receipt/:id" element={<ReceiptDetails />} />
        </Routes>
      </main>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#22c55e',
              secondary: 'black',
            },
          },
          error: {
            duration: 5000,
            theme: {
              primary: '#ef4444',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Web3Provider>
      <Router>
        <AppContent />
      </Router>
    </Web3Provider>
  );
}

export default App;
