// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";

contract BankToken is Initializable, OwnableUpgradeable, UUPSUpgradeable, ERC20PermitUpgradeable {
    // state variables

    // constructor
    constructor() {
        _disableInitializers();
    }

    // initialize function
    function initialize(address initialOwner, uint256 amount) public initializer {
        __ERC20_init("FLIP", "FLIP");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __ERC20Permit_init("FLIP");
        // Contract holds all tokens
        _mint(address(initialOwner), amount);
    }

    // upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // version info
    function version() public pure virtual returns (string memory) {
        return "1.0.0";
    }

    //
    receive() external payable {
        revert("BankToken: not payable");
    }

    fallback() external payable {
        revert("BankToken: not payable");
    }
}
