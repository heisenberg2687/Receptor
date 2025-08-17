import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { 
  Wallet, 
  Receipt, 
  Building2, 
  Shield, 
  Menu, 
  X,
  ChevronDown,
  Plus
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { 
    account, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    network 
  } = useWeb3();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Receipt },
    { name: 'Request Receipt', href: '/request', icon: Plus },
    { name: 'Vendor Dashboard', href: '/vendor', icon: Building2 },
    { name: 'Business', href: '/business', icon: Building2 },
    { name: 'Verify', href: '/verify', icon: Shield },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleConnectWallet = async () => {
    if (!isConnected) {
      await connectWallet();
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Receipt className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">
                  ReceiptVerify
                </span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Wallet connection and user menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Network indicator */}
            {network && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-600">
                  {network.name}
                </span>
              </div>
            )}

            {/* Wallet connection */}
            {!isConnected ? (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(account)}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {/* Profile dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Connected with</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {account}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setIsProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile wallet section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {!isConnected ? (
              <div className="px-3">
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Wallet className="h-4 w-4" />
                  <span>
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="px-3 space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatAddress(account)}
                    </p>
                    {network && (
                      <p className="text-xs text-gray-500">
                        {network.name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    disconnectWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full btn-outline"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
