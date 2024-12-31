// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import "./BankToken.sol";

struct UserSchedule {
    uint256 amount;
    address to;
}

contract AutoService is
    Initializable,
    ReentrancyGuardUpgradeable,
    ContextUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;
    // state variables
    /// @custom:storage-location erc7201:AutoService.storage.Allowances
    struct AllowancesStorage {
        // address => schedule
        mapping(address => UserSchedule) schedules;
    }
    // address of bank token
    address public bankTokenAddress;
    IERC20 private bankToken;
    IERC20Permit private bankTokenPermit;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // initialize function
    function initialize(address initialOwner, address _bankTokenAddress) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        bankTokenAddress = _bankTokenAddress;
        //
        bankToken = IERC20(_bankTokenAddress);
        bankTokenPermit = IERC20Permit(_bankTokenAddress);
    }

    // allowances storage location
    // keccak256(abi.encode(uint256(keccak256("AutoService.storage.Allowances")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant AllowancesStorageLocation =
        0x0a3ebe7fc18cb855cb6e260d33c096fd91033d746ac4fe36e886f200b216d000;

    // get allowances Storage
    function _getAllowancesStorage() private pure returns (AllowancesStorage storage $) {
        assembly {
            $.slot := AllowancesStorageLocation
        }
    }

    // version info
    function version() public pure virtual returns (string memory) {
        return "1.0.0";
    }

    //
    receive() external payable {
        revert("AutoService: not payable");
    }

    // upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
