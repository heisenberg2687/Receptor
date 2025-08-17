import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Building2, 
  CheckCircle, 
  Plus,
  TrendingUp,
  Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';

const Business = () => {
  const { 
    contract, 
    account, 
    isConnected, 
    waitForTransaction 
  } = useWeb3();
  
  const [businessData, setBusinessData] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (isConnected && contract && account) {
      loadBusinessData();
    }
  }, [isConnected, contract, account]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const business = await contract.businesses(account);
      
      if (business.isActive) {
        setBusinessData(business);
        setIsRegistered(true);
        setFormData({
          name: business.name,
          description: business.description
        });
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Business name is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Business description is required');
      return false;
    }
    
    return true;
  };

  const handleRegisterBusiness = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const tx = await contract.registerBusiness(
        formData.name,
        formData.description
      );
      
      toast.loading('Registering business...', { id: 'register-business' });
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Business registered successfully!', { id: 'register-business' });
        await loadBusinessData(); // Reload business data
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error registering business:', error);
      toast.error(
        error.reason || 
        error.message || 
        'Failed to register business',
        { id: 'register-business' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Connect Your Wallet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You need to connect your wallet to manage your business.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Building2 className="mx-auto h-12 w-12 text-primary-600" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Business Management
        </h1>
        <p className="mt-2 text-gray-600">
          {isRegistered 
            ? 'Manage your registered business and view statistics'
            : 'Register your business to start issuing receipts'
          }
        </p>
      </div>

      {isRegistered ? (
        <div className="space-y-8">
          {/* Business Status Card */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {businessData.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {businessData.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-sm text-gray-500">
                      Owner: {account}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Receipt className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Receipts</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {businessData.totalReceipts?.toString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Registration Status</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {businessData.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Business Status</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {businessData.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => window.location.href = '/create'}
                className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Plus className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">Create New Receipt</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Receipt className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">View All Receipts</span>
              </button>
            </div>
          </div>


        </div>
      ) : (
        /* Registration Form */
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Register Your Business
            </h2>
            
            <form onSubmit={handleRegisterBusiness} className="space-y-6">
              {/* Business Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                  className="input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Business Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your business and services"
                  rows={4}
                  className="input resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4" />
                    <span>Register Business</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Benefits of Registration */}
          <div className="card bg-primary-50 border-primary-200 mt-8">
            <h3 className="text-lg font-medium text-primary-900 mb-4">
              🎯 Benefits of Business Registration
            </h3>
            <ul className="space-y-2 text-sm text-primary-800">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary-600 mt-0.5" />
                <span>Issue digital receipts on the blockchain</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary-600 mt-0.5" />
                <span>Build trust with customers through transparency</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary-600 mt-0.5" />
                <span>Track and manage all issued receipts</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary-600 mt-0.5" />
                <span>Reduce disputes with transparent verification</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Business;
