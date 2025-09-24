// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.25;

/**
 * @title MockPriceFeed
 * @dev Simple price feed for testing on regular EVM networks
 */
contract MockPriceFeed {
    uint256 public price = 1e18; // 1.0 with 18 decimals
    
    event PriceUpdated(uint256 newPrice);
    
    function setPrice(uint256 _price) external {
        price = _price;
        emit PriceUpdated(_price);
    }
    
    function rawPrice() external view returns (bytes32) {
        return bytes32(price);
    }
}

