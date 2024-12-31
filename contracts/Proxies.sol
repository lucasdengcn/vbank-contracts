// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

// import ProxyAdmin etc to make sure Hardhat knows to compile them.
// ensurre artifacts are available for Hardhat Ignition.

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
