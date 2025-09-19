
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { RECEIPT_STATUS } from '../config/contract';
import Navbar from '../components/Layout/Navbar';
import { 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { contract, account, formatEther, formatAddress, waitForTransaction } = useWeb3();
  
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingReceipts, setProcessingReceipts] = useState(new Set());
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeError, setDisputeError] = useState('');

  useEffect(() => {
    if (contract && account) {
      loadReceipts();
    }
  }, [contract, account]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      console.log('Loading customer receipts for account:', account);
      if (!contract) {
        throw new Error('Contract instance not initialized');
      }

      const receiptIds = await contract.getUserReceipts(account);
      console.log('Customer receipt IDs:', receiptIds.map(id => id.toString()));
      
      const blockTimestamp = Math.floor(Date.now() / 1000);
      console.log('Current block timestamp:', blockTimestamp);

      const receiptDetails = [];
      for (let id of receiptIds) {
        try {
          const receipt = await contract.getReceipt(Number(id));
          console.log(`Raw receipt data for ${id}:`, receipt);
          console.log(`Receipt ${id}:`, {
            id: Number(receipt.id),
            issuer: receipt.issuer,
            recipient: receipt.recipient,
            status: Number(receipt.status),
            deadline: Number(receipt.deadline),
            exists: receipt.exists
          });
          if (receipt.exists && receipt.recipient && receipt.recipient.toLowerCase() === account.toLowerCase()) {
            const deadlineTimestamp = Number(receipt.deadline);
            const isExpired = receipt.status === 0 && blockTimestamp > deadlineTimestamp && deadlineTimestamp > 0;
            console.log(`Receipt ${id} isExpired:`, isExpired);
            receiptDetails.push({
              id: Number(receipt.id),
              vendorName: receipt.vendorName || '',
              description: receipt.description || '',
              amount: receipt.amount,
              status: isExpired ? 6 : Number(receipt.status),
              transactionDate: Number(receipt.transactionDate) ? new Date(Number(receipt.transactionDate) * 1000) : new Date(0),
              requestTimestamp: Number(receipt.requestTimestamp) ? new Date(Number(receipt.requestTimestamp) * 1000) : new Date(0),
              deadline: deadlineTimestamp > 0 ? new Date(deadlineTimestamp * 1000) : new Date(0),
              vendor: receipt.issuer,
              recipient: receipt.recipient,
              rejectionReason: receipt.rejectionReason || '',
              disputeReason: receipt.disputeReason || ''
            });
          } else {
            console.warn(`Skipping receipt ${id}:`, {
              exists: receipt.exists,
              recipient: receipt.recipient,
              account
            });
          }
        } catch (error) {
          console.error(`Error loading receipt ${id}:`, error);
        }
      }

      receiptDetails.sort((a, b) => b.requestTimestamp - a.requestTimestamp);
      console.log('Receipt details:', receiptDetails);
      setReceipts(receiptDetails);
    } catch (error) {
      console.error("Error loading customer receipts:", error);
      toast.error(error.reason || error.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered for account:', account);
    loadReceipts();
  };

  const handleCancel = async (receiptId) => {
    try {
      setProcessingReceipts(prev => new Set([...prev, receiptId]));
      
      const tx = await contract.cancelReceipt(receiptId);
      toast.loading('Cancelling receipt...', { id: `cancel-${receiptId}` });
      
      await waitForTransaction(tx.hash);
      
      toast.success('Receipt cancelled successfully!', { id: `cancel-${receiptId}` });
      await loadReceipts();
      setIsCancelModalOpen(false);
      setSelectedReceiptId(null);
    } catch (error) {
      console.error("Error cancelling receipt:", error);
      toast.error(`Failed to cancel receipt: ${error.reason || error.message}`, { id: `cancel-${receiptId}` });
    } finally {
      setProcessingReceipts(prev => {
        const newSet = new Set(prev);
        newSet.delete(receiptId);
        return newSet;
      });
    }
  };

  const handleDispute = async (receiptId) => {
    if (!disputeReason.trim()) {
      setDisputeError('Dispute reason cannot be empty');
      return;
    }

    try {
      setProcessingReceipts(prev => new Set([...prev, receiptId]));
      
      const tx = await contract.disputeReceipt(receiptId, disputeReason.trim());
      toast.loading('Disputing receipt...', { id: `dispute-${receiptId}` });
      
      await waitForTransaction(tx.hash);
      
      toast.success('Receipt disputed successfully!', { id: `dispute-${receiptId}` });
      await loadReceipts();
      setIsDisputeModalOpen(false);
      setSelectedReceiptId(null);
      setDisputeReason('');
      setDisputeError('');
    } catch (error) {
      console.error("Error disputing receipt:", error);
      toast.error(`Failed to dispute receipt: ${error.reason || error.message}`, { id: `dispute-${receiptId}` });
    } finally {
      setProcessingReceipts(prev => {
        const newSet = new Set(prev);
        newSet.delete(receiptId);
        return newSet;
      });
    }
  };

  const canCancel = (receipt) => {
    return receipt && receipt.status === 0 && receipt.recipient && receipt.recipient.toLowerCase() === account.toLowerCase();
  };

  const canDispute = (receipt) => {
    if (!receipt || !receipt.recipient || !account) {
      console.warn('Invalid receipt or account for dispute check:', { receipt, account });
      return false;
    }
    const can = (
      (receipt.status === 1 || receipt.status === 3) && // Approved or Verified
      receipt.recipient.toLowerCase() === account.toLowerCase()
    );
    console.log(`Can dispute receipt ${receipt.id}:`, {
      status: receipt.status,
      recipient: receipt.recipient,
      account,
      can
    });
    return can;
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

  const pendingCount = receipts.filter(r => r.status === 0).length;
  const approvedCount = receipts.filter(r => r.status === 1 || r.status === 3).length;
  const rejectedCount = receipts.filter(r => r.status === 2).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Receipt className="h-8 w-8 text-blue-600" />
              <span>Customer Dashboard</span>
            </h1>
            <p className="mt-2 text-gray-600">View and manage your receipt requests</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Wallet Address</p>
            <p className="font-mono text-sm">{formatAddress(account)}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link to="/request" className="btn-primary flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>Request New Receipt</span>
          </Link>
          <button
            onClick={handleRefresh}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Receipts</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading receipts...</p>
              </div>
            ) : (
              <>
                {receipts.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts yet</h3>
                    <p className="text-gray-600">Your receipt requests will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Request ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Requested
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Deadline
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {receipts.map((receipt) => (
                          <tr key={receipt.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{receipt.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {receipt.description || 'No description'}
                              </div>
                              {receipt.rejectionReason && (
                                <div className="text-sm text-red-600">
                                  Rejection: {receipt.rejectionReason}
                                </div>
                              )}
                              {receipt.disputeReason && (
                                <div className="text-sm text-orange-600">
                                  Dispute: {receipt.disputeReason}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-gray-900">
                                {formatAddress(receipt.vendor)}
                              </div>
                              {receipt.vendorName && (
                                <div className="text-sm text-gray-500">
                                  {receipt.vendorName}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatEther(receipt.amount)} ETH
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                                {getStatusIcon(receipt.status)}
                                <span className="ml-1">{RECEIPT_STATUS[receipt.status] || 'Unknown'}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(receipt.requestTimestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(receipt.deadline)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Link
                                to={`/receipt/${receipt.id}`}
                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </Link>
                              {canDispute(receipt) && (
                                <button
                                  onClick={() => {
                                    setSelectedReceiptId(receipt.id);
                                    setIsDisputeModalOpen(true);
                                  }}
                                  disabled={processingReceipts.has(receipt.id)}
                                  className="text-orange-600 hover:text-orange-800 flex items-center space-x-1 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                  <span>Dispute</span>
                                </button>
                              )}
                              {canCancel(receipt) && (
                                <button
                                  onClick={() => {
                                    setSelectedReceiptId(receipt.id);
                                    setIsCancelModalOpen(true);
                                  }}
                                  disabled={processingReceipts.has(receipt.id)}
                                  className="text-red-600 hover:text-red-800 flex items-center space-x-1 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span>Cancel</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Receipt #{selectedReceiptId}</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to cancel this receipt request?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setSelectedReceiptId(null);
                  }}
                  className="btn-secondary px-4 py-2 text-sm font-medium"
                >
                  No, Keep Request
                </button>
                <button
                  onClick={() => handleCancel(selectedReceiptId)}
                  disabled={processingReceipts.has(selectedReceiptId)}
                  className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isDisputeModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dispute Receipt #{selectedReceiptId}</h3>
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
                    setSelectedReceiptId(null);
                    setDisputeReason('');
                    setDisputeError('');
                  }}
                  className="btn-secondary px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDispute(selectedReceiptId)}
                  disabled={processingReceipts.has(selectedReceiptId)}
                  className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Dispute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
