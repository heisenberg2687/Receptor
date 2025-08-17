import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Receipt,
  Wallet
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="text-center pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Receipt className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Receipt Verification System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure, blockchain-based receipt verification for transparent transactions between businesses and customers
          </p>
        </div>
      </div>

      {/* User Type Selection */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Role</h2>
          <p className="text-lg text-gray-600">
            Select how you want to use the Receipt Verification System
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Customer Option */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer</h3>
              
              <p className="text-gray-600 mb-6">
                Request receipt verification from businesses for your purchases. 
                Connect your wallet to get started.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Request receipt verification</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Track verification status</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Manage your receipts</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Wallet className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  <span>Requires MetaMask connection</span>
                </div>
              </div>

              <Link 
                to="/customer" 
                className="btn-primary w-full flex items-center justify-center space-x-2 group"
              >
                <span>Continue as Customer</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Business Option */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Business (Verifier)</h3>
              
              <p className="text-gray-600 mb-6">
                Verify customer receipt requests and manage your business transactions. 
                Pre-verified business access.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Review receipt requests</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Approve or reject requests</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Manage business receipts</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  <span>Pre-verified business status</span>
                </div>
              </div>

              <Link 
                to="/business-portal" 
                className="btn-secondary w-full flex items-center justify-center space-x-2 group"
              >
                <span>Continue as Business</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-6 max-w-3xl mx-auto shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How It Works</h3>
            <p className="text-gray-600">
              Customers request receipt verification from businesses by providing transaction details. 
              Businesses review and verify the authenticity of these requests. All transactions are 
              recorded on the blockchain for transparency and immutability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
