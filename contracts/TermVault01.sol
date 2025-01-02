// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ForwarderUpgradeable.sol";

import "./BankToken.sol";

struct UserVault {
    uint256 amount;
    uint256 term;
    uint256 createdAt;
}

// private a term vault service
// customer would gain interest after a period of time by depositing digistal assessts.
contract TermVault01 is
    Initializable,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;
    // state variables
    struct VaultStorage {
        // address => UserVault
        mapping(address => UserVault) accounts;
    }
    // address of bank token
    address public tokenAddress;
    string public assetName;
    uint256 public minTerm;
    uint256 public interestRate;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ERC2771ForwarderUpgradeable trustedForwarder) ERC2771ContextUpgradeable(address(trustedForwarder)) {}

    // initialize function
    // assetName: name of the asset, e.g. USDT, USDC, DAI
    // minTerm: period of time in days.
    // interestRate: interest rate in percentage in a day.
    function initialize(
        address initialOwner,
        address _tokenAddress,
        string calldata _assetName,
        uint256 _minTerm,
        uint256 _interestRate
    ) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        tokenAddress = _tokenAddress;
        assetName = _assetName;
        minTerm = _minTerm;
        interestRate = _interestRate;
    }

    // vault storage location
    // keccak256(abi.encode(uint256(keccak256("BankApp.storage.TermVault01")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant VaultStorageLocation = 0xbe588fb8a745fc64f47674ff7264bde31c4d1110322bcbc6d9c7faa9ea911300;

    // get vault Storage
    function _getVaultStorage() private pure returns (VaultStorage storage $) {
        assembly {
            $.slot := VaultStorageLocation
        }
    }

    // upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // version info
    function version() public pure virtual returns (string memory) {
        return "1.0.0";
    }

    // _msgSender() override
    function _msgSender()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    // _msgData() override
    function _msgData() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (bytes calldata) {
        return ERC2771ContextUpgradeable._msgData();
    }

    // _contextSuffixLength() override
    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }

    // events
    event TermVaultRegistered(string indexed assetName, address indexed account, uint256 amount, uint256 term);

    // register a vault account
    function register(
        uint256 term,
        uint256 amount,
        string calldata _assetName,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public nonReentrant {
        require(term >= minTerm, "TermVault01: term is too short");
        require(amount > 0, "TermVault01: amount is too small");
        require(
            keccak256(abi.encodePacked(_assetName)) == keccak256(abi.encodePacked(assetName)),
            "TermVault01: asset name is not correct"
        );
        //
        VaultStorage storage $ = _getVaultStorage();
        require($.accounts[_msgSender()].amount == 0, "TermVault01: account already registered");
        // transfer 1 token to this contract
        IERC20Permit token = IERC20Permit(tokenAddress);
        //
        try token.permit(_msgSender(), address(this), amount, deadline, v, r, s) {
            $.accounts[_msgSender()] = UserVault({ amount: amount, term: term, createdAt: block.timestamp });
            IERC20(tokenAddress).safeTransferFrom(_msgSender(), address(this), amount);
            emit TermVaultRegistered(_assetName, _msgSender(), amount, term);
        } catch (bytes memory data) {
            assembly {
                // skips the length field
                revert(add(data, 32), mload(data))
            }
        }
    }

    event TermVaultWithdraw(
        string indexed assetName,
        address indexed account,
        uint256 amount,
        uint256 term,
        uint256 interest
    );

    // withdraw means transfer token from contract to user
    function withdraw() public nonReentrant {
        VaultStorage storage $ = _getVaultStorage();
        UserVault storage vault = $.accounts[_msgSender()];
        require(vault.amount > 0, "TermVault01: account not registered");
        require(block.timestamp >= vault.createdAt + vault.term * 1 days, "TermVault01: term not reached");
        // reset vault
        delete $.accounts[_msgSender()];
        // calculate interest
        uint256 numberOfDays = (block.timestamp - vault.createdAt) / 1 days;
        uint256 interest = (vault.amount * interestRate * numberOfDays) / 100;
        // transfer token to user
        IERC20(tokenAddress).safeTransfer(_msgSender(), vault.amount + interest);
        //
        emit TermVaultWithdraw(assetName, _msgSender(), vault.amount, vault.term, interest);
    }
}
