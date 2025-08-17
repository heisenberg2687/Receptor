import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, CONTRACT_ABI } from '../config/contract';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize provider
  const initializeProvider = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        
        setProvider(provider);
        setNetwork(network);
        
        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          const signer = await provider.getSigner();
          setSigner(signer);
          setIsConnected(true);
          
          // Initialize contract
          initializeContract(signer);
        }
      } catch (error) {
        console.error('Failed to initialize provider:', error);
        toast.error('Failed to initialize Web3 provider');
      }
    } else {
      toast.error('MetaMask not detected. Please install MetaMask.');
    }
  };

  // Initialize contract
  const initializeContract = (signerOrProvider) => {
    try {
      const contractInstance = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signerOrProvider
      );
      setContract(contractInstance);
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      toast.error('Failed to initialize contract');
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!provider) {
      toast.error('Please install MetaMask');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const signer = await provider.getSigner();
        setSigner(signer);
        setIsConnected(true);
        
        // Initialize contract
        initializeContract(signer);
        
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  // Switch network
  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network');
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format Ether value
  const formatEther = (value) => {
    try {
      return ethers.formatEther(value);
    } catch (error) {
      return '0';
    }
  };

  // Parse Ether value
  const parseEther = (value) => {
    try {
      return ethers.parseEther(value.toString());
    } catch (error) {
      return ethers.parseEther("0");
    }
  };

  // Get transaction receipt
  const getTransactionReceipt = async (txHash) => {
    try {
      return await provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      return null;
    }
  };

  // Wait for transaction
  const waitForTransaction = async (txHash, confirmations = 1) => {
    try {
      return await provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      console.error('Failed to wait for transaction:', error);
      throw error;
    }
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          if (provider) {
            const signer = await provider.getSigner();
            setSigner(signer);
            initializeContract(signer);
          }
        }
      };

      const handleChainChanged = (chainId) => {
        window.location.reload(); // Refresh page on network change
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, provider]);

  // Initialize on mount
  useEffect(() => {
    initializeProvider();
  }, []);

  const value = {
    // State
    account,
    provider,
    signer,
    contract,
    network,
    isConnecting,
    isConnected,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    
    // Utilities
    formatAddress,
    formatEther,
    parseEther,
    getTransactionReceipt,
    waitForTransaction,
    
    // Contract info
    contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
