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

struct UserWallet {
    string id;
    string name;
    address addr;
}

contract BankApp is Initializable, ReentrancyGuardUpgradeable, ContextUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;
    // state variables
    /// @custom:storage-location erc7201:BankApp.storage.Accounts
    struct AccountsStorage {
        // accountId => wallet address
        mapping(string => UserWallet) wallets;
        mapping(address => string) accounts;
        mapping(address => uint256) walletBalances;
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

    // accounts storage location
    // keccak256(abi.encode(uint256(keccak256("BankApp.storage.Accounts")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant AccountsStorageLocation =
        0x99c194d5da0fb73cf8183b37546c181862fea4cd0decd0982bb2c89abe454f00;

    // get accounts Storage
    function _getAccountsStorage() private pure returns (AccountsStorage storage $) {
        assembly {
            $.slot := AccountsStorageLocation
        }
    }

    // version info
    /// for detecting contract version to ensure upgrade successfully.
    function version() public pure virtual returns (string memory) {
        return "1.0.0";
    }

    // UUPS upgrade check
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // events
    event WalletBinded(address indexed addr, string indexed accountId, string name);
    event WalletDeleted(address indexed addr, string indexed accountId, string name);
    event BankReceived(address indexed from, address indexed to, uint256 value);
    event TokenExchanged(address indexed from, address indexed to, uint256 value);
    event TokenWithdraw(address indexed from, address indexed to, uint256 value);

    //errors
    error AccountAddressNotFound(address addr);

    // modifiers
    modifier AccountRequired() {
        AccountsStorage storage $ = _getAccountsStorage();
        string memory accountId = $.accounts[_msgSender()];
        if (bytes(accountId).length == 0) {
            revert AccountAddressNotFound(_msgSender());
        }
        _;
    }

    // bind wallet to account
    function bindWallet(string memory name, string memory accountId, address addr) public nonReentrant returns (bool) {
        AccountsStorage storage $ = _getAccountsStorage();
        $.wallets[accountId] = UserWallet(accountId, name, addr);
        $.accounts[addr] = accountId;
        emit WalletBinded(addr, accountId, name);
        return true;
    }

    // delete wallet from account
    function deleteWallet(string memory accountId) public nonReentrant returns (bool) {
        AccountsStorage storage $ = _getAccountsStorage();
        UserWallet memory wallet = $.wallets[accountId];
        delete $.wallets[accountId];
        delete $.accounts[wallet.addr];
        emit WalletDeleted(wallet.addr, accountId, wallet.name);
        return true;
    }

    // get wallet by account id
    function getWallet(string memory accountId) public view returns (UserWallet memory) {
        AccountsStorage storage $ = _getAccountsStorage();
        return $.wallets[accountId];
    }

    // receive transfer from users other dApps
    receive() external payable nonReentrant AccountRequired {
        AccountsStorage storage $ = _getAccountsStorage();
        address sender = _msgSender();
        uint256 balance = $.walletBalances[sender];
        balance += msg.value;
        $.walletBalances[sender] = balance;
        emit BankReceived(sender, address(this), msg.value);
    }

    // get balance
    function getBalance(address addr) public view returns (uint256) {
        AccountsStorage storage $ = _getAccountsStorage();
        return $.walletBalances[addr];
    }

    // exchange ether to bank token (1:1)
    function exchangeTokens(uint256 amount) public nonReentrant AccountRequired returns (bool) {
        AccountsStorage storage $ = _getAccountsStorage();
        uint256 balance = $.walletBalances[_msgSender()];
        require(balance >= amount, "Insufficient Wallet balance");
        $.walletBalances[_msgSender()] = balance - amount;
        // transfer token to user from bankApp not bankToken
        bankToken.safeTransfer(_msgSender(), amount);
        // emit event
        emit TokenExchanged(address(this), _msgSender(), amount);
        return true;
    }

    // token balance
    function getTokenBalance() public view returns (uint256) {
        return bankToken.balanceOf(_msgSender());
    }

    // withdraw means transfer bank token from user to contract
    // user will gain ether into wallet.
    function withdrawTokens(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public nonReentrant AccountRequired returns (bool) {
        uint256 balance = bankToken.balanceOf(_msgSender());
        require(balance >= amount, "Insufficient Token balance");
        //
        try bankTokenPermit.permit(_msgSender(), address(this), amount, deadline, v, r, s) {
            bankToken.safeTransferFrom(_msgSender(), address(this), amount);
        } catch (bytes memory data) {
            assembly {
                // skips the length field
                revert(add(data, 32), mload(data))
            }
        }
        //
        AccountsStorage storage $ = _getAccountsStorage();
        $.walletBalances[_msgSender()] += amount;
        //
        emit TokenWithdraw(_msgSender(), address(this), amount);
        return true;
    }

    // withdraw balance to wallet address
    function withdrawWallet(uint256 amount) public nonReentrant AccountRequired returns (bool) {
        AccountsStorage storage $ = _getAccountsStorage();
        uint256 balance = $.walletBalances[_msgSender()];
        require(balance >= amount, "Insufficient Wallet balance");
        $.walletBalances[_msgSender()] = balance - amount;
        payable(_msgSender()).transfer(amount);
        return true;
    }
}
