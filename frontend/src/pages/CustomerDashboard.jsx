import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { RECEIPT_STATUS, STATUS_COLORS } from '../config/contract';
import { 
  Receipt, 
  Plus, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Wallet,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { 
    contract, 
    account, 
    isConnected, 
    formatEther, 
    formatAddress,
    connectWallet
  } = useWeb3();
  
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    approvedReceipts: 0,
    pendingReceipts: 0,
    rejectedReceipts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && contract && account) {
      loadCustomerData();
    }
  }, [isConnected, contract, account]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      
      // Get customer receipts (where customer is the recipient)
      const userReceiptIds = await contract.getUserReceipts(account);
      
      let receiptDetails = [];
      let tempStats = {
        totalReceipts: 0,
        approvedReceipts: 0,
        pendingReceipts: 0,
        rejectedReceipts: 0
      };

      for (let id of userReceiptIds) {
        try {
          const receipt = await contract.getReceipt(Number(id));
          if (receipt.exists) {
            receiptDetails.push({
              id: Number(receipt.id),
              vendorName: receipt.vendorName,
              description: receipt.description,
              amount: receipt.amount,
              status: Number(receipt.status),
              transactionDate: new Date(Number(receipt.transactionDate) * 1000),
              requestTimestamp: new Date(Number(receipt.requestTimestamp) * 1000),
              issuer: receipt.issuer,
              recipient: receipt.recipient
            });

            tempStats.totalReceipts++;
            const status = Number(receipt.status);
            if (status === 0) tempStats.pendingReceipts++; // Requested
            else if (status === 1 || status === 3) tempStats.approvedReceipts++; // Approved or Verified
            else if (status === 2) tempStats.rejectedReceipts++; // Rejected
          }
        } catch (error) {
          console.error(`Error loading receipt ${id}:`, error);
        }
      }

      // Sort by request timestamp (newest first)
      receiptDetails.sort((a, b) => b.requestTimestamp - a.requestTimestamp);

      setReceipts(receiptDetails);
      setStats(tempStats);
    } catch (error) {
      console.error("Error loading customer data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return <Clock className="h-4 w-4 text-yellow-500" />;  // Requested
      case 1: return <CheckCircle className="h-4 w-4 text-blue-500" />;  // Approved
      case 2: return <AlertCircle className="h-4 w-4 text-red-500" />;  // Rejected
      case 3: return <CheckCircle className="h-4 w-4 text-green-500" />;  // Verified
      case 4: return <AlertCircle className="h-4 w-4 text-orange-500" />;  // Disputed
      case 5: return <AlertCircle className="h-4 w-4 text-gray-500" />;  // Cancelled
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: 'bg-yellow-100 text-yellow-800',  // Requested
      1: 'bg-blue-100 text-blue-800',      // Approved
      2: 'bg-red-100 text-red-800',        // Rejected
      3: 'bg-green-100 text-green-800',    // Verified
      4: 'bg-orange-100 text-orange-800',  // Disputed
      5: 'bg-gray-100 text-gray-800'       // Cancelled
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-blue-50 p-8 rounded-lg border border-blue-200 max-w-md">
          <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            To access your customer dashboard and manage receipt requests, please connect your MetaMask wallet.
          </p>
          <button 
            onClick={connectWallet}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Wallet className="h-4 w-4" />
            <span>Connect MetaMask</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Simple header for customer dashboard */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">Customer Portal</span>
            </div>
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your receipt requests and track verification status
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Connected: {formatAddress(account)}
          </p>
        </div>
        <Link to="/request" className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Request Receipt</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReceipts}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.approvedReceipts}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReceipts}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedReceipts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Receipt Requests</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading receipts...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="p-6 text-center">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No receipt requests yet</h3>
            <p className="text-gray-600 mb-4">Start by requesting a receipt verification from a business.</p>
            <Link to="/request" className="btn-primary">
              Request Your First Receipt
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt Details
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {receipt.vendorName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {receipt.description || 'No description provided'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatEther(receipt.amount)} ETH
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                        {getStatusIcon(receipt.status)}
                        <span className="ml-1">{RECEIPT_STATUS[receipt.status]}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(receipt.requestTimestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/receipt/${receipt.id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
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
    </>
  );
};

export default CustomerDashboard;
