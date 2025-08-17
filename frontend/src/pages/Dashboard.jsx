import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { RECEIPT_STATUS, STATUS_COLORS } from '../config/contract';
import { 
  Receipt, 
  Plus, 
  Eye, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { 
    contract, 
    account, 
    isConnected, 
    formatEther, 
    formatAddress 
  } = useWeb3();
  
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    verifiedReceipts: 0,
    pendingReceipts: 0,
    disputedReceipts: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, sent, received

  useEffect(() => {
    if (isConnected && contract && account) {
      loadDashboardData();
    }
  }, [isConnected, contract, account]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user receipts (received)
      const userReceiptIds = await contract.getUserReceipts(account);
      
      // Get business receipts (sent) if user is a business
      let businessReceiptIds = [];
      try {
        businessReceiptIds = await contract.getBusinessReceipts(account);
      } catch (error) {
        // User might not be a registered business
      }
      
      // Combine all receipt IDs
      const allReceiptIds = [...new Set([...userReceiptIds, ...businessReceiptIds])];
      
      // Fetch receipt details
      const receiptPromises = allReceiptIds.map(async (id) => {
        try {
          const receipt = await contract.getReceipt(id);
          return {
            ...receipt,
            id: receipt.id.toString(),
            amount: receipt.amount,
            timestamp: receipt.timestamp.toNumber(),
            status: receipt.status,
            type: receipt.issuer.toLowerCase() === account.toLowerCase() ? 'sent' : 'received'
          };
        } catch (error) {
          console.error(`Error fetching receipt ${id}:`, error);
          return null;
        }
      });
      
      const fetchedReceipts = (await Promise.all(receiptPromises))
        .filter(receipt => receipt !== null)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      setReceipts(fetchedReceipts);
      
      // Calculate stats
      const stats = {
        totalReceipts: fetchedReceipts.length,
        verifiedReceipts: fetchedReceipts.filter(r => r.status === 1).length,
        pendingReceipts: fetchedReceipts.filter(r => r.status === 0).length,
        disputedReceipts: fetchedReceipts.filter(r => r.status === 2).length
      };
      
      setStats(stats);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReceipts = () => {
    switch (filter) {
      case 'sent':
        return receipts.filter(r => r.type === 'sent');
      case 'received':
        return receipts.filter(r => r.type === 'received');
      default:
        return receipts;
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
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Connect Your Wallet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your wallet to view your receipts and start verifying transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your receipts and track verification status
          </p>
        </div>
        <Link to="/request" className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Request Receipt</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Receipts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalReceipts}
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
              <p className="text-sm font-medium text-gray-500">Verified</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.verifiedReceipts}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pendingReceipts}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Disputed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.disputedReceipts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Receipts</h2>
          
          {/* Filter buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                filter === 'all' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                filter === 'received' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Received
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                filter === 'sent' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sent
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : getFilteredReceipts().length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No receipts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You haven't created or received any receipts yet."
                : `No ${filter} receipts found.`
              }
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <Link to="/create" className="btn-primary">
                  Create your first receipt
                </Link>
              </div>
            )}
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
                    Business/Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredReceipts().map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          #{receipt.id}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {receipt.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {receipt.businessName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {receipt.type === 'sent' 
                            ? formatAddress(receipt.recipient)
                            : formatAddress(receipt.issuer)
                          }
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatEther(receipt.amount)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(receipt.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(receipt.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        receipt.type === 'sent' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {receipt.type === 'sent' ? 'Sent' : 'Received'}
                      </span>
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

export default Dashboard;
