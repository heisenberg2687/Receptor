import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { CONTRACT_CONFIG } from '../config/contract';
import { Receipt, Upload, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const RequestReceipt = () => {
  const navigate = useNavigate();
  const { 
    contract, 
    account, 
    isConnected, 
    parseEther,
    waitForTransaction 
  } = useWeb3();
  
  const [formData, setFormData] = useState({
    vendorAddress: CONTRACT_CONFIG.DEFAULT_VENDOR.address,
    vendorName: CONTRACT_CONFIG.DEFAULT_VENDOR.name,
    description: '',
    amount: '',
    transactionDate: '',
    ipfsHash: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.vendorAddress.trim()) {
      toast.error('Vendor address is required');
      return false;
    }
    
    if (!formData.vendorName.trim()) {
      toast.error('Vendor name is required');
      return false;
    }
    
    // Description is now optional - no validation required
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return false;
    }

    if (!formData.transactionDate) {
      toast.error('Transaction date is required');
      return false;
    }
    
    // Basic ETH address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.vendorAddress)) {
      toast.error('Invalid vendor address format');
      return false;
    }
    
    if (formData.vendorAddress.toLowerCase() === account?.toLowerCase()) {
      toast.error('Cannot request receipt from yourself');
      return false;
    }

    // Check if transaction date is not in the future
    const selectedDate = new Date(formData.transactionDate);
    const now = new Date();
    if (selectedDate > now) {
      toast.error('Transaction date cannot be in the future');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert amount to wei
      const amountInWei = parseEther(formData.amount);
      
      // Convert transaction date to timestamp
      const transactionTimestamp = Math.floor(new Date(formData.transactionDate).getTime() / 1000);
      
      // Request receipt transaction
      const tx = await contract.requestReceipt(
        formData.vendorAddress,
        formData.vendorName,
        formData.description || '',
        amountInWei,
        transactionTimestamp,
        formData.ipfsHash || ''
      );
      
      toast.loading('Requesting receipt...', { id: 'request-receipt' });
      
      // Wait for transaction confirmation
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Receipt request sent successfully!', { id: 'request-receipt' });
        
        // Reset form
        setFormData({
          vendorAddress: '',
          vendorName: '',
          description: '',
          amount: '',
          transactionDate: '',
          ipfsHash: ''
        });
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error requesting receipt:', error);
      toast.error(
        error.reason || 
        error.message || 
        'Failed to request receipt',
        { id: 'request-receipt' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for input (YYYY-MM-DDTHH:MM)
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Connect Your Wallet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You need to connect your wallet to request receipts.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Receipt className="mx-auto h-12 w-12 text-primary-600" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Request Receipt
        </h1>
        <p className="mt-2 text-gray-600">
          Request a digital receipt from a vendor for your transaction
        </p>
      </div>

      {/* Request Receipt Form */}
      <div className="card">
        {/* Default Vendor Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-900">Using Default Test Vendor</h3>
          </div>
          <p className="mt-1 text-sm text-blue-700">
            For testing purposes, all receipt requests will be sent to: <span className="font-mono">{CONTRACT_CONFIG.DEFAULT_VENDOR.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Address - Read Only */}
          <div>
            <label htmlFor="vendorAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Address *
            </label>
            <input
              type="text"
              id="vendorAddress"
              name="vendorAddress"
              value={formData.vendorAddress}
              className="input bg-gray-50 cursor-not-allowed"
              required
              disabled={true}
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">
              Default test vendor address (hardcoded for testing)
            </p>
          </div>

          {/* Vendor Name - Read Only */}
          <div>
            <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Name *
            </label>
            <input
              type="text"
              id="vendorName"
              name="vendorName"
              value={formData.vendorName}
              className="input bg-gray-50 cursor-not-allowed"
              required
              disabled={true}
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">
              Default test vendor name (hardcoded for testing)
            </p>
          </div>

          {/* Transaction Date */}
          <div>
            <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Date & Time *
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="transactionDate"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleInputChange}
                max={getCurrentDateTime()}
                className="input pr-12"
                required
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              When did this transaction occur?
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description of Goods/Services (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you purchased... (optional)"
              rows={3}
              className="input resize-none"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Brief description of the goods or services purchased (optional)
            </p>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount Paid (ETH) *
            </label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.000001"
                min="0"
                className="input pr-12"
                required
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 text-sm">ETH</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Amount you paid for this transaction in Ethereum (ETH)
            </p>
          </div>

          {/* IPFS Hash (Optional) */}
          <div>
            <label htmlFor="ipfsHash" className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Documents (Optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="ipfsHash"
                name="ipfsHash"
                value={formData.ipfsHash}
                onChange={handleInputChange}
                placeholder="IPFS hash or document reference..."
                className="input flex-1"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="btn-outline flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              IPFS hash or reference to any supporting documents (receipts, photos, etc.)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Requesting...</span>
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  <span>Request Receipt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          💡 How Receipt Requests Work
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">1.</span>
            <span>You submit a receipt request with transaction details</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">2.</span>
            <span>The vendor receives a notification about your request</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">3.</span>
            <span>Vendor can approve or reject your request</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">4.</span>
            <span>Once approved, you can verify the receipt to make it official</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <span>Make sure all transaction details are accurate before submitting</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RequestReceipt;
