"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useToast, toast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  const checkNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setIsCorrectNetwork(false);
      setCurrentChainId(null);
      setIsLoading(false);
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" }) as string;
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
      toast({
        title: "Wallet Not Available",
        description: "Please install MetaMask",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Switching Network",
        description: "Switching to Sepolia testnet...",
      });
      
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      
      toast({
        title: "Network Switched",
        description: "Successfully connected to Sepolia",
      });
    } catch (error: any) {
      console.error("Error switching network:", error);
      
      // If Sepolia is not added, add it
      if (error.code === 4902) {
        try {
          toast({
            title: "Adding Network",
            description: "Adding Sepolia testnet to your wallet...",
          });
          
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
          
          toast({
            title: "Network Added",
            description: "Sepolia testnet added successfully",
          });
        } catch (addError: any) {
          console.error("Error adding network:", addError);
          toast({
            title: "Network Error",
            description: "Failed to add Sepolia network",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Network Error",
          description: "Failed to switch to Sepolia network",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    checkNetwork();

    // Listen for network changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        setCurrentChainId(chainId);
        setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
        
        if (chainId === SEPOLIA_CHAIN_ID) {
          toast({
            title: "Network Connected",
            description: "Connected to Sepolia testnet",
          });
        } else {
          toast({
            title: "Wrong Network",
            description: "Please switch to Sepolia testnet",
            variant: "destructive",
          });
        }
      };

      window.ethereum.on?.("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
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
