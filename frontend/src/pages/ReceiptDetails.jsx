
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { RECEIPT_STATUS } from '../config/contract';
import Navbar from '../components/Layout/Navbar';
import { 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReceiptDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, account, formatEther, formatAddress, waitForTransaction } = useWeb3();
  
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeError, setDisputeError] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (contract) {
      loadReceipt();
    }
  }, [contract]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      console.log(`Loading receipt ${id} for account:`, account);
      const receiptData = await contract.getReceipt(Number(id));
      console.log(`Raw receipt data for ${id}:`, receiptData);
      console.log(`Receipt ${id}:`, {
        id: Number(receiptData.id),
        issuer: receiptData.issuer,
        recipient: receiptData.recipient,
        status: Number(receiptData.status),
        deadline: Number(receiptData.deadline),
        exists: receiptData.exists
      });

      if (!receiptData.exists || !receiptData.recipient) {
        console.warn(`Invalid receipt ${id}:`, { exists: receiptData.exists, recipient: receiptData.recipient });
        throw new Error('Receipt does not exist or has invalid data');
      }

      const blockTimestamp = Math.floor(Date.now() / 1000);
      const isExpired = receiptData.status === 0 && blockTimestamp > Number(receiptData.deadline) && Number(receiptData.deadline) > 0;
      
      setReceipt({
        id: Number(receiptData.id),
        vendorName: receiptData.vendorName,
        description: receiptData.description,
        amount: receiptData.amount,
        status: isExpired ? 6 : Number(receiptData.status),
        transactionDate: Number(receiptData.transactionDate) ? new Date(Number(receiptData.transactionDate) * 1000) : new Date(0),
        requestTimestamp: Number(receiptData.requestTimestamp) ? new Date(Number(receiptData.requestTimestamp) * 1000) : new Date(0),
        deadline: Number(receiptData.deadline) > 0 ? new Date(Number(receiptData.deadline) * 1000) : new Date(0),
        issuer: receiptData.issuer,
        recipient: receiptData.recipient,
        rejectionReason: receiptData.rejectionReason || '',
        disputeReason: receiptData.disputeReason || ''
      });
    } catch (error) {
      console.error('Error loading receipt:', error);
      toast.error(error.reason || error.message || 'Failed to load receipt');
      navigate('/'); // Redirect to home if receipt not found
    } finally {
      setLoading(false);
    }
  };

  const canDispute = () => {
    if (!receipt || !receipt.recipient || !account) {
      console.warn('Invalid receipt or account for dispute check:', { receipt, account });
      return false;
    }
    const can = (
      (receipt.status === 1 || receipt.status === 3) && // Approved or Verified
      (
        receipt.issuer.toLowerCase() === account.toLowerCase() ||
        receipt.recipient.toLowerCase() === account.toLowerCase()
      )
    );
    console.log(`Can dispute receipt ${receipt.id}:`, {
      status: receipt.status,
      issuer: receipt.issuer,
      recipient: receipt.recipient,
      account,
      can
    });
    return can;
  };

  const canCancel = () => {
    if (!receipt || !receipt.recipient || !account) {
      console.warn('Invalid receipt or account for cancel check:', { receipt, account });
      return false;
    }
    return (
      receipt.status === 0 && // Requested
      receipt.recipient.toLowerCase() === account.toLowerCase()
    );
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      setDisputeError('Dispute reason cannot be empty');
      return;
    }

    try {
      setProcessing(true);
      const tx = await contract.disputeReceipt(receipt.id, disputeReason.trim());
      toast.loading('Disputing receipt...', { id: `dispute-${receipt.id}` });
      
      await waitForTransaction(tx.hash);
      
      toast.success('Receipt disputed successfully!', { id: `dispute-${receipt.id}` });
      await loadReceipt();
      setIsDisputeModalOpen(false);
      setDisputeReason('');
      setDisputeError('');
    } catch (error) {
      console.error('Error disputing receipt:', error);
      toast.error(`Failed to dispute receipt: ${error.reason || error.message}`, { id: `dispute-${receipt.id}` });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setProcessing(true);
      const tx = await contract.cancelReceipt(receipt.id);
      toast.loading('Cancelling receipt...', { id: `cancel-${receipt.id}` });
      
      await waitForTransaction(tx.hash);
      
      toast.success('Receipt cancelled successfully!', { id: `cancel-${receipt.id}` });
      await loadReceipt();
      setIsCancelModalOpen(false);
    } catch (error) {
      console.error('Error cancelling receipt:', error);
      toast.error(`Failed to cancel receipt: ${error.reason || error.message}`, { id: `cancel-${receipt.id}` });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime()) || date.getTime() === 0) {
      return 'N/A';
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return <Clock className="h-4 w-4 text-yellow-600" />;
      case 1: return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 2: return <XCircle className="h-4 w-4 text-red-600" />;
      case 3: return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 4: return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 5: return <XCircle className="h-4 w-4 text-gray-600" />;
      case 6: return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: 'bg-yellow-100 text-yellow-800',
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-red-100 text-red-800',
      3: 'bg-green-100 text-green-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-gray-100 text-gray-800',
      6: 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading receipt details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Receipt not found</h3>
            <p className="text-gray-600">The requested receipt does not exist.</p>
            <Link to="/" className="mt-4 btn-primary inline-flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Customer Dashboard</span>
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Receipt className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Receipt #{receipt.id}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                {getStatusIcon(receipt.status)}
                <span className="ml-1">{RECEIPT_STATUS[receipt.status]}</span>
              </span>
            </div>
            <div className="flex space-x-3">
              {canDispute() && (
                <button
                  onClick={() => setIsDisputeModalOpen(true)}
                  disabled={processing}
                  className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Dispute</span>
                </button>
              )}
              {canCancel() && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={processing}
                  className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Vendor</p>
              <p className="font-mono text-sm">{formatAddress(receipt.issuer)}</p>
              {receipt.vendorName && (
                <p className="text-sm text-gray-900">{receipt.vendorName}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-mono text-sm">{formatAddress(receipt.recipient)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-lg font-semibold">{formatEther(receipt.amount)} ETH</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Transaction Date</p>
              <p>{formatDate(receipt.transactionDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Requested</p>
              <p>{formatDate(receipt.requestTimestamp)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deadline</p>
              <p>{formatDate(receipt.deadline)}</p>
            </div>
            {receipt.description && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900">{receipt.description}</p>
              </div>
            )}
            {receipt.rejectionReason && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Rejection Reason</p>
                <p className="text-red-600">{receipt.rejectionReason}</p>
              </div>
            )}
            {receipt.disputeReason && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Dispute Reason</p>
                <p className="text-orange-600">{receipt.disputeReason}</p>
              </div>
            )}
          </div>
        </div>

        {isDisputeModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dispute Receipt #{receipt.id}</h3>
              <div className="mb-4">
                <label htmlFor="disputeReason" className="block text-sm font-medium text-gray-700">
                  Reason for Dispute
                </label>
                <textarea
                  id="disputeReason"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  rows="4"
                  value={disputeReason}
                  onChange={(e) => {
                    setDisputeReason(e.target.value);
                    setDisputeError('');
                  }}
                  placeholder="Enter the reason for disputing this receipt"
                />
                {disputeError && (
                  <p className="mt-2 text-sm text-red-600">{disputeError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsDisputeModalOpen(false);
                    setDisputeReason('');
                    setDisputeError('');
                  }}
                  className="btn-secondary px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispute}
                  disabled={processing}
                  className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Dispute
                </button>
              </div>
            </div>
          </div>
        )}

        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Receipt #{receipt.id}</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to cancel this receipt request?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-sm font-medium"
                >
                  No, Keep Request
                </button>
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptDetails;
