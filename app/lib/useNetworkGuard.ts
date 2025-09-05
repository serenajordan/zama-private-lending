"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useToast, toast } from "../components/Toast";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

interface NetworkState {
  isCorrectNetwork: boolean;
  currentChainId: string | null;
  isLoading: boolean;
  switchToSepolia: () => Promise<void>;
}

export function useNetworkGuard(): NetworkState {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const checkNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setIsCorrectNetwork(false);
      setCurrentChainId(null);
      setIsLoading(false);
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setCurrentChainId(chainId);
      setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
    } catch (error) {
      console.error("Error checking network:", error);
      setIsCorrectNetwork(false);
      setCurrentChainId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToSepolia = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      showToast(toast.error("Wallet Not Available", "Please install MetaMask"));
      return;
    }

    try {
      showToast(toast.info("Switching Network", "Switching to Sepolia testnet..."));
      
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      
      showToast(toast.success("Network Switched", "Successfully connected to Sepolia"));
    } catch (error: any) {
      console.error("Error switching network:", error);
      
      // If Sepolia is not added, add it
      if (error.code === 4902) {
        try {
          showToast(toast.info("Adding Network", "Adding Sepolia testnet to your wallet..."));
          
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia",
                nativeCurrency: {
                  name: "Sepolia Ether",
                  symbol: "SEP",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io/"],
              },
            ],
          });
          
          showToast(toast.success("Network Added", "Sepolia testnet added successfully"));
        } catch (addError: any) {
          console.error("Error adding network:", addError);
          showToast(toast.error("Network Error", "Failed to add Sepolia network"));
        }
      } else {
        showToast(toast.error("Network Error", "Failed to switch to Sepolia network"));
      }
    }
  };

  useEffect(() => {
    checkNetwork();

    // Listen for network changes
    if (window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        setCurrentChainId(chainId);
        setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
        
        if (chainId === SEPOLIA_CHAIN_ID) {
          showToast(toast.success("Network Connected", "Connected to Sepolia testnet"));
        } else {
          showToast(toast.warning("Wrong Network", "Please switch to Sepolia testnet"));
        }
      };

      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  return {
    isCorrectNetwork,
    currentChainId,
    isLoading,
    switchToSepolia,
  };
}
