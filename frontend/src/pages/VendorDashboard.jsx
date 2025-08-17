import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { RECEIPT_STATUS, STATUS_COLORS } from '../config/contract';
import { 
  Receipt, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const { 
    contract, 
    account, 
    isConnected, 
    formatEther, 
    formatAddress,
    waitForTransaction 
  } = useWeb3();
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allReceipts, setAllReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (isConnected && contract && account) {
      loadVendorData();
    }
  }, [isConnected, contract, account]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      
      // Get all receipt requests for this vendor
      const receiptIds = await contract.getBusinessReceipts(account);
      
      // Fetch receipt details
      const receiptPromises = receiptIds.map(async (id) => {
        try {
          const receipt = await contract.getReceipt(id);
          return {
            ...receipt,
            id: receipt.id.toString(),
            amount: receipt.amount,
            transactionDate: receipt.transactionDate.toNumber(),
            requestTimestamp: receipt.requestTimestamp.toNumber(),
            status: receipt.status
          };
        } catch (error) {
          console.error(`Error fetching receipt ${id}:`, error);
          return null;
        }
      });
      
      const fetchedReceipts = (await Promise.all(receiptPromises))
        .filter(receipt => receipt !== null)
        .sort((a, b) => b.requestTimestamp - a.requestTimestamp);
      
      // Separate pending requests from all receipts
      const pending = fetchedReceipts.filter(r => r.status === 0); // Requested
      
      setPendingRequests(pending);
      setAllReceipts(fetchedReceipts);
      
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (receiptId) => {
    setProcessingId(receiptId);
    try {
      const tx = await contract.approveReceipt(receiptId);
      
      toast.loading('Approving receipt request...', { id: 'approve-receipt' });
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Receipt request approved!', { id: 'approve-receipt' });
        await loadVendorData(); // Reload data
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error approving receipt:', error);
      toast.error(
        error.reason || error.message || 'Failed to approve receipt',
        { id: 'approve-receipt' }
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (receiptId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled
    
    setProcessingId(receiptId);
    try {
      const tx = await contract.rejectReceipt(receiptId, reason || 'No reason provided');
      
      toast.loading('Rejecting receipt request...', { id: 'reject-receipt' });
      
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Receipt request rejected!', { id: 'reject-receipt' });
        await loadVendorData(); // Reload data
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Error rejecting receipt:', error);
      toast.error(
        error.reason || error.message || 'Failed to reject receipt',
        { id: 'reject-receipt' }
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusText = RECEIPT_STATUS[status];
    const colorClass = `badge-${STATUS_COLORS[status]}`;
    
    return (
      <span className={`badge ${colorClass}`}>
        {statusText}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: // Requested
        return <Clock className="h-4 w-4 text-warning-600" />;
      case 1: // Approved
        return <CheckCircle className="h-4 w-4 text-primary-600" />;
      case 2: // Rejected
        return <XCircle className="h-4 w-4 text-danger-600" />;
      case 3: // Verified
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 4: // Disputed
        return <AlertCircle className="h-4 w-4 text-danger-600" />;
      case 5: // Cancelled
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Connect Your Wallet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your wallet to manage receipt requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage incoming receipt requests from customers
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-lg">
          <Building2 className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-primary-900">
            {formatAddress(account)}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-900">
                {pendingRequests.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Receipts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allReceipts.length}
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
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allReceipts.filter(r => r.status === 1 || r.status === 3).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allReceipts.filter(r => r.status === 2).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-warning-600" />
            <span>Pending Receipt Requests</span>
            <span className="badge-warning">{pendingRequests.length}</span>
          </h2>

          <div className="space-y-4">
            {pendingRequests.map((receipt) => (
              <div key={receipt.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        Receipt Request #{receipt.id}
                      </h3>
                      {getStatusBadge(receipt.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Customer:</p>
                        <p className="font-medium">{formatAddress(receipt.recipient)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount:</p>
                        <p className="font-medium">{formatEther(receipt.amount)} ETH</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Transaction Date:</p>
                        <p className="font-medium">{formatDate(receipt.transactionDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Requested:</p>
                        <p className="font-medium">{formatDate(receipt.requestTimestamp)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-gray-500 text-sm">Description:</p>
                      <p className="text-gray-900">{receipt.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApproveRequest(receipt.id)}
                      disabled={processingId === receipt.id}
                      className="btn-success flex items-center space-x-1"
                    >
                      {processingId === receipt.id ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => handleRejectRequest(receipt.id)}
                      disabled={processingId === receipt.id}
                      className="btn-danger flex items-center space-x-1"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    
                    <Link
                      to={`/receipt/${receipt.id}`}
                      className="btn-outline flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Receipts */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">All Receipt Requests</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : allReceipts.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No receipt requests found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Customers haven't requested any receipts from you yet.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Date
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(receipt.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            #{receipt.id}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {receipt.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAddress(receipt.recipient)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatEther(receipt.amount)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(receipt.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(receipt.transactionDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/receipt/${receipt.id}`}
                        className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
