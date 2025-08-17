import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { RECEIPT_STATUS } from '../config/contract';
import BusinessNavbar from '../components/Layout/BusinessNavbar';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  AlertCircle,
  TrendingUp,
  Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessPortal = () => {
  const { 
    contract, 
    formatEther, 
    formatAddress,
    waitForTransaction
  } = useWeb3();
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingRequests, setProcessingRequests] = useState(new Set());

  // For testing purposes, we'll use a hardcoded business address
  // In a real scenario, this would be dynamically determined
  const BUSINESS_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Account #1 from Hardhat

  useEffect(() => {
    if (contract) {
      loadBusinessData();
    }
  }, [contract]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Get pending requests for this business
      const pendingIds = await contract.getPendingRequests(BUSINESS_ADDRESS);
      
      // Get all business receipts
      const allReceiptIds = await contract.getBusinessReceipts(BUSINESS_ADDRESS);
      
      // Load pending request details
      const pendingDetails = [];
      for (let id of pendingIds) {
        try {
          const receipt = await contract.getReceipt(Number(id));
          if (receipt.exists) {
            pendingDetails.push({
              id: Number(receipt.id),
              vendorName: receipt.vendorName,
              description: receipt.description,
              amount: receipt.amount,
              status: Number(receipt.status),
              transactionDate: new Date(Number(receipt.transactionDate) * 1000),
              requestTimestamp: new Date(Number(receipt.requestTimestamp) * 1000),
              customer: receipt.recipient
            });
          }
        } catch (error) {
          console.error(`Error loading pending request ${id}:`, error);
        }
      }

      // Load all request details
      const allDetails = [];
      for (let id of allReceiptIds) {
        try {
          const receipt = await contract.getReceipt(Number(id));
          if (receipt.exists) {
            allDetails.push({
              id: Number(receipt.id),
              vendorName: receipt.vendorName,
              description: receipt.description,
              amount: receipt.amount,
              status: Number(receipt.status),
              transactionDate: new Date(Number(receipt.transactionDate) * 1000),
              requestTimestamp: new Date(Number(receipt.requestTimestamp) * 1000),
              customer: receipt.recipient
            });
          }
        } catch (error) {
          console.error(`Error loading request ${id}:`, error);
        }
      }

      // Sort by request timestamp (newest first)
      pendingDetails.sort((a, b) => b.requestTimestamp - a.requestTimestamp);
      allDetails.sort((a, b) => b.requestTimestamp - a.requestTimestamp);

      setPendingRequests(pendingDetails);
      setAllRequests(allDetails);
    } catch (error) {
      console.error("Error loading business data:", error);
      toast.error("Failed to load business data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (receiptId) => {
    try {
      setProcessingRequests(prev => new Set([...prev, receiptId]));
      
      const tx = await contract.approveReceipt(receiptId);
      toast.loading('Approving receipt...', { id: `approve-${receiptId}` });
      
      await waitForTransaction(tx.hash);
      
      toast.success('Receipt approved successfully!', { id: `approve-${receiptId}` });
      
      // Reload data
      await loadBusinessData();
    } catch (error) {
      console.error("Error approving receipt:", error);
      toast.error(`Failed to approve receipt: ${error.reason || error.message}`, { id: `approve-${receiptId}` });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(receiptId);
        return newSet;
      });
    }
  };

  const handleReject = async (receiptId, reason = "Request rejected by business") => {
    try {
      setProcessingRequests(prev => new Set([...prev, receiptId]));
      
      const tx = await contract.rejectReceipt(receiptId, reason);
      toast.loading('Rejecting receipt...', { id: `reject-${receiptId}` });
      
      await waitForTransaction(tx.hash);
      
      toast.success('Receipt rejected successfully!', { id: `reject-${receiptId}` });
      
      // Reload data
      await loadBusinessData();
    } catch (error) {
      console.error("Error rejecting receipt:", error);
      toast.error(`Failed to reject receipt: ${error.reason || error.message}`, { id: `reject-${receiptId}` });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(receiptId);
        return newSet;
      });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return <Clock className="h-4 w-4 text-yellow-500" />;
      case 1: return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 2: return <XCircle className="h-4 w-4 text-red-500" />;
      case 3: return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: 'bg-yellow-100 text-yellow-800',
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-red-100 text-red-800',
      3: 'bg-green-100 text-green-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const pendingCount = pendingRequests.length;
  const approvedCount = allRequests.filter(r => r.status === 1 || r.status === 3).length;
  const rejectedCount = allRequests.filter(r => r.status === 2).length;

  return (
    <>
      <BusinessNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span>Business Portal</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Review and verify customer receipt requests
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-500">Verified Business - Pre-approved Status</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Business Address</p>
          <p className="font-mono text-sm">{formatAddress(BUSINESS_ADDRESS)}</p>
        </div>
      </div>

      {/* Stats Cards */}
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
              <p className="text-2xl font-bold text-gray-900">{allRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Requests ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Requests ({allRequests.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading requests...</p>
            </div>
          ) : (
            <>
              {activeTab === 'pending' && (
                <>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                      <p className="text-gray-600">All receipt requests have been processed.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                  Receipt Request #{request.id}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                  {getStatusIcon(request.status)}
                                  <span className="ml-1">{RECEIPT_STATUS[request.status]}</span>
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-gray-600">Customer</p>
                                  <p className="font-mono text-sm">{formatAddress(request.customer)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Amount</p>
                                  <p className="text-lg font-semibold">{formatEther(request.amount)} ETH</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Transaction Date</p>
                                  <p>{formatDate(request.transactionDate)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Requested</p>
                                  <p>{formatDate(request.requestTimestamp)}</p>
                                </div>
                              </div>
                              
                              {request.description && (
                                <div className="mb-4">
                                  <p className="text-sm text-gray-600">Description</p>
                                  <p className="text-gray-900">{request.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 mt-4">
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={processingRequests.has(request.id)}
                              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={processingRequests.has(request.id)}
                              className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'all' && (
                <>
                  {allRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                      <p className="text-gray-600">Customer receipt requests will appear here.</p>
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
                              Customer
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
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allRequests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  #{request.id}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {request.description || 'No description'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-mono text-gray-900">
                                  {formatAddress(request.customer)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatEther(request.amount)} ETH
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                  {getStatusIcon(request.status)}
                                  <span className="ml-1">{RECEIPT_STATUS[request.status]}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(request.requestTimestamp)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default BusinessPortal;
