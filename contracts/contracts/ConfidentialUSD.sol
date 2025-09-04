// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import "@fhevm/solidity/lib/FHE.sol";

/**
 * @title ConfidentialUSD
 * @dev A confidential ERC20-like token built on Zama fhEVM
 * All balances and transfer amounts are encrypted and private
 */
contract ConfidentialUSD {
    using FHE for *;

    // State variables
    mapping(address => euint64) private _balances;
    address public immutable pool;
    address public immutable owner;

    // Events
    event Transfer(address indexed from, address indexed to);

    // Error handling structure per Zama docs
    struct LastError {
        euint8 code;  // 0 = success, 1 = insufficient funds, 2 = other error
        uint256 timestamp;
    }
    
    mapping(address => LastError) private _lastErrors;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyPool() {
        require(msg.sender == pool, "Not pool");
        _;
    }

    constructor(address _pool) {
        pool = _pool;
        owner = msg.sender;
    }

    /**
     * @dev Faucet function to mint tokens for testing
     * @param amount Encrypted amount to mint
     */
    function faucet(externalEuint64 calldata amount) external {
        require(FHE.isSenderAllowed(amount), "Not allowed");
        
        euint64 amt = FHE.fromExternal(amount, "");
        amt.allowThis();
        amt.allow(owner);
        
        _balances[msg.sender] = FHE.add(_balances[msg.sender], amt);
        _balances[msg.sender].allowThis();
        _balances[msg.sender].allow(msg.sender);
        
        // Set success error code
        _lastErrors[msg.sender] = LastError(FHE.asEuint8(0), block.timestamp);
        
        emit Transfer(address(0), msg.sender);
    }

    /**
     * @dev Get encrypted balance for an address
     * @param account Address to query
     * @return Encrypted balance
     */
    function balanceOf(address account) external view returns (euint64) {
        return _balances[account];
    }

    /**
     * @dev Get last error for an address
     * @param account Address to query
     * @return Error code and timestamp
     */
    function getLastError(address account) external view returns (euint8, uint256) {
        LastError memory error = _lastErrors[account];
        return (FHE.decrypt(error.code), error.timestamp);
    }

    /**
     * @dev Transfer encrypted amount between addresses
     * @param to Recipient address
     * @param encAmt Encrypted amount to transfer
     * @param proof Zero-knowledge proof for the amount
     */
    function transferEncrypted(
        address to,
        externalEuint64 calldata encAmt,
        bytes calldata proof
    ) external {
        require(FHE.isSenderAllowed(encAmt), "Not allowed");
        
        euint64 amt = FHE.fromExternal(encAmt, proof);
        amt.allowThis();
        amt.allow(to);
        
        // Check if sender has sufficient balance
        ebool canTransfer = FHE.le(amt, _balances[msg.sender]);
        
        // Set error code: 0 for success, 1 for insufficient funds
        euint8 errorCode = FHE.select(canTransfer, FHE.asEuint8(0), FHE.asEuint8(1));
        _lastErrors[msg.sender] = LastError(errorCode, block.timestamp);
        
        // Conditional transfer using FHE.select
        euint64 transferAmount = FHE.select(canTransfer, amt, FHE.asEuint64(0));
        
        // Update recipient balance
        _balances[to] = FHE.add(_balances[to], transferAmount);
        _balances[to].allowThis();
        _balances[to].allow(to);
        
        // Update sender balance
        _balances[msg.sender] = FHE.sub(_balances[msg.sender], transferAmount);
        _balances[msg.sender].allowThis();
        _balances[msg.sender].allow(owner);
        
        emit Transfer(msg.sender, to);
    }

    /**
     * @dev Pull tokens from an address (pool only)
     * @param from Source address
     * @param to Destination address
     * @param amt Amount to transfer
     */
    function pull(address from, address to, euint64 amt) external onlyPool {
        ebool canPull = FHE.le(amt, _balances[from]);
        
        euint64 pullAmount = FHE.select(canPull, amt, FHE.asEuint64(0));
        
        // Update balances conditionally
        _balances[from] = FHE.sub(_balances[from], pullAmount);
        _balances[from].allowThis();
        _balances[from].allow(owner);
        
        _balances[to] = FHE.add(_balances[to], pullAmount);
        _balances[to].allowThis();
        _balances[to].allow(to);
        
        if (FHE.decrypt(canPull)) {
            emit Transfer(from, to);
        }
    }

    /**
     * @dev Push tokens to an address (pool only)
     * @param from Source address
     * @param to Destination address
     * @param amt Amount to transfer
     */
    function push(address from, address to, euint64 amt) external onlyPool {
        ebool canPush = FHE.le(amt, _balances[from]);
        
        euint64 pushAmount = FHE.select(canPush, amt, FHE.asEuint64(0));
        
        // Update balances conditionally
        _balances[from] = FHE.sub(_balances[from], pushAmount);
        _balances[from].allowThis();
        _balances[from].allow(owner);
        
        _balances[to] = FHE.add(_balances[to], pushAmount);
        _balances[to].allowThis();
        _balances[to].allow(to);
        
        if (FHE.decrypt(canPush)) {
            emit Transfer(from, to);
        }
    }
}
