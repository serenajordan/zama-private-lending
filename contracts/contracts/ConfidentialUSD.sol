// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

// TODO: Re-enable FHEVM imports once version compatibility is resolved
// import "@fhevm/solidity/config/FHEVMConfig.sol";
// import "@fhevm/solidity/lib/FHE.sol";

/**
 * @title ConfidentialUSD
 * @dev A confidential ERC20-like token built on Zama fhEVM
 * All balances and transfer amounts are encrypted and private
 * 
 * NOTE: This is a simplified version for initial compilation.
 * FHEVM integration will be added once version compatibility is resolved.
 */
contract ConfidentialUSD {
    // TODO: Re-enable FHEVM types once version compatibility is resolved
    // using FHE for *;

    // State variables
    mapping(address => uint256) private _balances; // TODO: Change to euint64
    address public immutable pool;
    address public immutable owner;

    // Events
    event Transfer(address indexed from, address indexed to);

    // Error handling structure per Zama docs
    struct LastError {
        uint8 code;  // 0 = success, 1 = insufficient funds, 2 = other error
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
     * @param amount Amount to mint (temporary uint256 for compilation)
     */
    function faucet(uint256 amount) external {
        // TODO: Re-enable FHEVM validation once version compatibility is resolved
        // require(FHE.isSenderAllowed(amount), "Not allowed");
        
        // TODO: Re-enable FHEVM types once version compatibility is resolved
        // euint64 amt = FHE.fromExternal(amount, "");
        // amt.allowThis();
        // amt.allow(owner);
        
        _balances[msg.sender] += amount;
        
        // Set success error code
        _lastErrors[msg.sender] = LastError(0, block.timestamp);
        
        emit Transfer(address(0), msg.sender);
    }

    /**
     * @dev Get balance for an address
     * @param account Address to query
     * @return Balance
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Get last error for an address
     * @param account Address to query
     * @return Error code and timestamp
     */
    function getLastError(address account) external view returns (uint8, uint256) {
        LastError memory error = _lastErrors[account];
        return (error.code, error.timestamp);
    }

    /**
     * @dev Transfer amount between addresses
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transfer(address to, uint256 amount) external {
        // TODO: Re-enable FHEVM validation once version compatibility is resolved
        // require(FHE.isSenderAllowed(amount), "Not allowed");
        
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        // Set error code: 0 for success, 1 for insufficient funds
        uint8 errorCode = 0;
        _lastErrors[msg.sender] = LastError(errorCode, block.timestamp);
        
        // Update balances
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, to);
    }

    /**
     * @dev Pull tokens from an address (pool only)
     * @param from Source address
     * @param to Destination address
     * @param amt Amount to transfer
     */
    function pull(address from, address to, uint256 amt) external onlyPool {
        require(_balances[from] >= amt, "Insufficient balance");
        
        // Update balances
        _balances[from] -= amt;
        _balances[to] += amt;
        
        emit Transfer(from, to);
    }

    /**
     * @dev Push tokens to an address (pool only)
     * @param from Source address
     * @param to Destination address
     * @param amt Amount to transfer
     */
    function push(address from, address to, uint256 amt) external onlyPool {
        require(_balances[from] >= amt, "Insufficient balance");
        
        // Update balances
        _balances[from] -= amt;
        _balances[to] += amt;
        
        emit Transfer(from, to);
    }
}
