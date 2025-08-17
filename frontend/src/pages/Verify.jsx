import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { RECEIPT_STATUS, STATUS_COLORS } from '../config/contract';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const Verify = () => {
  const navigate = useNavigate();
  const { 
    contract, 
    account, 
    isConnected, 
    formatEther, 
    formatAddress,
    waitForTransaction 
  } = useWeb3();
  
  const [receiptId, setReceiptId] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const [searching, setSearching] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disputing, setDisputing] = useState(false);

  const searchReceipt = async () => {
    if (!receiptId.trim()) {
      toast.error('Please enter a receipt ID');
      return;
    }

    setSearching(true);
    try {
      const receipt = await contract.getReceipt(receiptId);
      
      if (!receipt.exists) {
        toast.error('Receipt not found');
        setReceiptData(null);
        return;
      }

      setReceiptData({
        ...receipt,
        id: receipt.id.toString(),
        amount: receipt.amount,
        timestamp: receipt.timestamp.toNumber(),
        status: receipt.status
      });
      
    } catch (error) {
      console.error('Error searching receipt:', error);
      toast.error('Receipt not found or invalid ID');
      setReceiptData(null);
    } finally {
      setSearching(false);
    }
  };

  const handleVerifyReceipt = async () => {
    if (!receiptData) return;

    setVerifying(true);
    try {
      const tx = await contract.verifyReceipt(receiptData.id);
      
      toast.loading('Verifying receipt...', { id: 'verify-receipt' });
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Receipt verified successfully!', { id: 'verify-receipt' });
        
        // Refresh receipt data
        await searchReceipt();
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error verifying receipt:', error);
      toast.error(
        error.reason || 
        error.message || 
        'Failed to verify receipt',
        { id: 'verify-receipt' }
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleDisputeReceipt = async () => {
    if (!receiptData) return;

    const confirmed = window.confirm(
      'Are you sure you want to dispute this receipt? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setDisputing(true);
    try {
      const tx = await contract.disputeReceipt(receiptData.id);
      
      toast.loading('Disputing receipt...', { id: 'dispute-receipt' });
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Receipt disputed successfully!', { id: 'dispute-receipt' });
        
        // Refresh receipt data
        await searchReceipt();
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error disputing receipt:', error);
      toast.error(
        error.reason || 
        error.message || 
        'Failed to dispute receipt',
        { id: 'dispute-receipt' }
      );
    } finally {
      setDisputing(false);
    }
  };

  const canVerify = () => {
    if (!receiptData || !account) return false;
    
    return (
      receiptData.status === 0 && // Pending
      (receiptData.recipient.toLowerCase() === account.toLowerCase() ||
       // Add logic here to check if user is authorized verifier
       false)
    );
  };

  const canDispute = () => {
    if (!receiptData || !account) return false;
    
    return (
      (receiptData.status === 0 || receiptData.status === 1) && // Pending or Verified
      (receiptData.recipient.toLowerCase() === account.toLowerCase() ||
       receiptData.issuer.toLowerCase() === account.toLowerCase())
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: // Pending
        return <AlertTriangle className="h-5 w-5 text-warning-600" />;
      case 1: // Verified
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 2: // Disputed
        return <XCircle className="h-5 w-5 text-danger-600" />;
      case 3: // Cancelled
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const statusText = RECEIPT_STATUS[status];
    const colorClass = `badge-${STATUS_COLORS[status]}`;
    
    return (
      <span className={`badge ${colorClass} flex items-center space-x-1`}>
        {getStatusIcon(status)}
        <span>{statusText}</span>
      </span>
    );
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Connect Your Wallet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You need to connect your wallet to verify receipts.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-primary-600" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Receipt Verification
        </h1>
        <p className="mt-2 text-gray-600">
          Search and verify receipt authenticity on the blockchain
        </p>
      </div>

      {/* Search Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Search Receipt
        </h2>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
              placeholder="Enter receipt ID (e.g., 1, 2, 3...)"
              className="input"
              onKeyPress={(e) => e.key === 'Enter' && searchReceipt()}
            />
          </div>
          <button
            onClick={searchReceipt}
            disabled={searching}
            className="btn-primary flex items-center space-x-2"
          >
            {searching ? (
              <>
                <div className="loading-spinner"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Receipt Details */}
      {receiptData && (
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Receipt #{receiptData.id}
              </h2>
              <p className="text-gray-600 mt-1">
                Created on {formatDate(receiptData.timestamp)}
              </p>
            </div>
            {getStatusBadge(receiptData.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Business Name</label>
                <p className="text-gray-900">{receiptData.businessName || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Issuer Address</label>
                <p className="text-gray-900 font-mono text-sm">{receiptData.issuer}</p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Recipient</label>
                <p className="text-gray-900 font-mono text-sm">{receiptData.recipient}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Amount</label>
                <p className="text-gray-900 text-lg font-semibold">
                  {formatEther(receiptData.amount)} ETH
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {receiptData.description}
            </p>
          </div>

          {/* IPFS Hash */}
          {receiptData.ipfsHash && receiptData.ipfsHash !== 'No document attached' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">Document</label>
              <div className="flex items-center space-x-2">
                <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded flex-1">
                  {receiptData.ipfsHash}
                </p>
                <button
                  onClick={() => window.open(`https://ipfs.io/ipfs/${receiptData.ipfsHash}`, '_blank')}
                  className="btn-outline flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View</span>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex space-x-4">
            {canVerify() && (
              <button
                onClick={handleVerifyReceipt}
                disabled={verifying}
                className="btn-success flex items-center space-x-2"
              >
                {verifying ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Verify Receipt</span>
                  </>
                )}
              </button>
            )}

            {canDispute() && (
              <button
                onClick={handleDisputeReceipt}
                disabled={disputing}
                className="btn-danger flex items-center space-x-2"
              >
                {disputing ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Disputing...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>Dispute Receipt</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => navigate(`/receipt/${receiptData.id}`)}
              className="btn-outline flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          🔍 How Verification Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">For Recipients</h4>
            <ul className="space-y-1">
              <li>• Search for receipts using the receipt ID</li>
              <li>• Verify receipts you've received</li>
              <li>• Dispute fraudulent or incorrect receipts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">For Businesses</h4>
            <ul className="space-y-1">
              <li>• View verification status of issued receipts</li>
              <li>• Dispute challenged receipts if necessary</li>
              <li>• Track receipt authenticity on blockchain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
