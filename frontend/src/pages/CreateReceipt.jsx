import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { Receipt, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateReceipt = () => {
  const navigate = useNavigate();
  const { 
    contract, 
    account, 
    isConnected, 
    parseEther,
    waitForTransaction 
  } = useWeb3();
  
  const [formData, setFormData] = useState({
    recipient: '',
    description: '',
    amount: '',
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
    if (!formData.recipient.trim()) {
      toast.error('Recipient address is required');
      return false;
    }
    
    // Description is now optional - no validation required
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return false;
    }
    
    // Basic ETH address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.recipient)) {
      toast.error('Invalid recipient address format');
      return false;
    }
    
    if (formData.recipient.toLowerCase() === account.toLowerCase()) {
      toast.error('Cannot create receipt for yourself');
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
      
      // Create receipt transaction
      const tx = await contract.createReceipt(
        formData.recipient,
        formData.description,
        amountInWei,
        formData.ipfsHash || 'No document attached'
      );
      
      toast.loading('Creating receipt...', { id: 'create-receipt' });
      
      // Wait for transaction confirmation
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Receipt created successfully!', { id: 'create-receipt' });
        
        // Reset form
        setFormData({
          recipient: '',
          description: '',
          amount: '',
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
      console.error('Error creating receipt:', error);
      toast.error(
        error.reason || 
        error.message || 
        'Failed to create receipt',
        { id: 'create-receipt' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Connect Your Wallet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You need to connect your wallet to create receipts.
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
          Create Receipt
        </h1>
        <p className="mt-2 text-gray-600">
          Issue a new digital receipt on the blockchain
        </p>
      </div>



      {/* Create Receipt Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Address */}
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address *
            </label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              placeholder="0x..."
              className="input"
              required
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              The Ethereum address of the receipt recipient
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter transaction description..."
              rows={3}
              className="input resize-none"
              required
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Brief description of the goods or services provided
            </p>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (ETH) *
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
              Transaction amount in Ethereum (ETH)
            </p>
          </div>

          {/* IPFS Hash (Optional) */}
          <div>
            <label htmlFor="ipfsHash" className="block text-sm font-medium text-gray-700 mb-2">
              Document Hash (Optional)
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
              IPFS hash or reference to receipt document/image
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  <span>Create Receipt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          💡 Tips for Creating Receipts
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <span>Make sure the recipient address is correct - transactions cannot be undone</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <span>Include a clear description to help with verification</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <span>The receipt will be pending until verified by the recipient</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <span>Adding a document hash helps with proof and verification</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CreateReceipt;
