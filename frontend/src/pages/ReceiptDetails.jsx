import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { RECEIPT_STATUS, STATUS_COLORS } from '../config/contract';
import { 
  Receipt, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Building2,
  User,
  Calendar,
  DollarSign,
  Hash,
  ExternalLink,
  Download,
  Share
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReceiptDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    contract, 
    account, 
    isConnected, 
    formatEther, 
    formatAddress,
    waitForTransaction 
  } = useWeb3();
  
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isConnected && contract && id) {
      loadReceiptData();
    }
  }, [isConnected, contract, id]);

  const loadReceiptData = async () => {
    try {
      setLoading(true);
      const receipt = await contract.getReceipt(id);
      
      if (!receipt.exists) {
        toast.error('Receipt not found');
        navigate('/');
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
      console.error('Error loading receipt:', error);
      toast.error('Failed to load receipt');
      navigate('/');
    } finally {
      setLoading(false);
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
        await loadReceiptData();
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error verifying receipt:', error);
      toast.error(
        error.reason || error.message || 'Failed to verify receipt',
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
        await loadReceiptData();
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error disputing receipt:', error);
      toast.error(
        error.reason || error.message || 'Failed to dispute receipt',
        { id: 'dispute-receipt' }
      );
    } finally {
      setDisputing(false);
    }
  };

  const handleCancelReceipt = async () => {
    if (!receiptData) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel this receipt? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setCancelling(true);
    try {
      const tx = await contract.cancelReceipt(receiptData.id);
      
      toast.loading('Cancelling receipt...', { id: 'cancel-receipt' });
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Receipt cancelled successfully!', { id: 'cancel-receipt' });
        await loadReceiptData();
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error cancelling receipt:', error);
      toast.error(
        error.reason || error.message || 'Failed to cancel receipt',
        { id: 'cancel-receipt' }
      );
    } finally {
      setCancelling(false);
    }
  };

  const canVerify = () => {
    if (!receiptData || !account) return false;
    
    return (
      receiptData.status === 0 && // Pending
      receiptData.recipient.toLowerCase() === account.toLowerCase()
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

  const canCancel = () => {
    if (!receiptData || !account) return false;
    
    return (
      receiptData.status === 0 && // Pending
      receiptData.issuer.toLowerCase() === account.toLowerCase()
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: // Pending
        return <AlertTriangle className="h-6 w-6 text-warning-600" />;
      case 1: // Verified
        return <CheckCircle className="h-6 w-6 text-success-600" />;
      case 2: // Disputed
        return <XCircle className="h-6 w-6 text-danger-600" />;
      case 3: // Cancelled
        return <XCircle className="h-6 w-6 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const statusText = RECEIPT_STATUS[status];
    const colorClass = `badge-${STATUS_COLORS[status]}`;
    
    return (
      <span className={`badge ${colorClass} flex items-center space-x-2 text-base px-4 py-2`}>
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
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Receipt link copied to clipboard!');
  };

  const handleDownload = () => {
    // Create a simple text representation of the receipt
    const receiptText = `
BLOCKCHAIN RECEIPT
==================

Receipt ID: ${receiptData.id}
Business: ${receiptData.businessName || 'N/A'}
Description: ${receiptData.description}
Amount: ${formatEther(receiptData.amount)} ETH
Status: ${RECEIPT_STATUS[receiptData.status]}
Date: ${formatDate(receiptData.timestamp)}

Issuer: ${receiptData.issuer}
Recipient: ${receiptData.recipient}

Verified on blockchain at: ${window.location.origin}
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Connect Your Wallet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You need to connect your wallet to view receipt details.
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

  if (!receiptData) {
    return (
      <div className="text-center py-12">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Receipt Not Found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The requested receipt could not be found.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Receipt #{receiptData.id}
            </h1>
            <p className="text-gray-600">
              Blockchain-verified digital receipt
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="btn-outline flex items-center space-x-2"
          >
            <Share className="h-4 w-4" />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="btn-outline flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="flex justify-center">
        {getStatusBadge(receiptData.status)}
      </div>

      {/* Receipt Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Business Information</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Business Name</label>
              <p className="text-lg text-gray-900 mt-1">
                {receiptData.businessName || 'N/A'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Issuer Address</label>
              <p className="text-gray-900 font-mono text-sm mt-1 break-all">
                {receiptData.issuer}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Customer Information</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Recipient</label>
              <p className="text-gray-900 font-mono text-sm mt-1 break-all">
                {receiptData.recipient}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Your Role</label>
              <p className="text-lg text-gray-900 mt-1">
                {receiptData.issuer.toLowerCase() === account?.toLowerCase() 
                  ? 'Issuer (Business)' 
                  : receiptData.recipient.toLowerCase() === account?.toLowerCase()
                  ? 'Recipient (Customer)'
                  : 'Third Party'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Transaction Details</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Amount</label>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatEther(receiptData.amount)} ETH
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Date & Time</label>
            <div className="flex items-center space-x-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-lg text-gray-900">
                {formatDate(receiptData.timestamp)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-900 whitespace-pre-wrap">
            {receiptData.description}
          </p>
        </div>
      </div>

      {/* Document/IPFS Hash */}
      {receiptData.ipfsHash && receiptData.ipfsHash !== 'No document attached' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Hash className="h-5 w-5" />
            <span>Attached Document</span>
          </h2>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900 font-mono text-sm break-all flex-1 mr-4">
              {receiptData.ipfsHash}
            </p>
            <button
              onClick={() => window.open(`https://ipfs.io/ipfs/${receiptData.ipfsHash}`, '_blank')}
              className="btn-outline flex items-center space-x-2 flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Document</span>
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
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

          {canCancel() && (
            <button
              onClick={handleCancelReceipt}
              disabled={cancelling}
              className="btn-secondary flex items-center space-x-2"
            >
              {cancelling ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Cancel Receipt</span>
                </>
              )}
            </button>
          )}
        </div>
        
        {!canVerify() && !canDispute() && !canCancel() && (
          <p className="text-gray-500 text-sm">
            No actions available for this receipt.
          </p>
        )}
      </div>

      {/* Blockchain Info */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          🔗 Blockchain Information
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>This receipt is permanently stored on the Ethereum blockchain</p>
          <p>Receipt ID: #{receiptData.id}</p>
          <p>Status: {RECEIPT_STATUS[receiptData.status]}</p>
          <p>All transactions are immutable and publicly verifiable</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetails;
