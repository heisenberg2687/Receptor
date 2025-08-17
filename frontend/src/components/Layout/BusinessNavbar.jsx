import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';

const BusinessNavbar = () => {
  return (
    <nav className="bg-white shadow border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Receipt Verification</span>
            </Link>
          </div>

          {/* Business Indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">Business Portal</span>
            </div>
            
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BusinessNavbar;
