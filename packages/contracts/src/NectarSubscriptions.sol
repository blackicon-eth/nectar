// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title NectarSubscriptions
/// @notice Single registry that lets creators set a stablecoin subscription
///         price and subscribers pay it. Payment is split 90/10 in the same
///         transaction: 90% to the creator, 10% to the Nectar treasury.
///
///         Access is NOT tracked on-chain. A `SubscriptionPaid` event is
///         emitted and the Nectar worker indexes it into Arkiv (subscriber +
///         creator + expiration), which is the source of truth for access.
contract NectarSubscriptions is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev Access duration granted by a single payment.
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;

    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant TREASURY_BPS = 1_000; // 10%
    uint256 public constant CREATOR_BPS = 9_000; // 90%

    /// @dev Stablecoin used for subscription payments (USDC on Fuji).
    IERC20 public immutable token;

    /// @dev Nectar treasury that receives the 10% platform share.
    address public treasury;

    /// @dev Creator -> subscription price (in the token's base units).
    mapping(address creator => uint256 price) public priceOf;

    event PriceSet(address indexed creator, uint256 price);
    event TreasurySet(address indexed treasury);
    event SubscriptionPaid(
        address indexed subscriber,
        address indexed creator,
        uint256 expiresAt,
        uint256 amount
    );

    constructor(IERC20 token_, address treasury_) Ownable(msg.sender) {
        token = token_;
        treasury = treasury_;
    }

    /// @notice Owner updates the Nectar treasury address.
    function setTreasury(address treasury_) external onlyOwner {
        require(treasury_ != address(0), "Nectar: zero treasury");
        treasury = treasury_;
        emit TreasurySet(treasury_);
    }

    /// @notice Creator sets the price subscribers must pay. Only affects
    ///         future subscriptions; a price change does not alter any
    ///         existing subscription already indexed in Arkiv.
    function setPrice(uint256 price) external {
        priceOf[msg.sender] = price;
        emit PriceSet(msg.sender, price);
    }

    /// @notice Subscriber pays `creator`'s current price. The full amount is
    ///         pulled from `msg.sender` and split 90/10 in this transaction.
    function subscribe(address creator) external nonReentrant {
        uint256 amount = priceOf[creator];
        require(amount > 0, "Nectar: no price");

        token.safeTransferFrom(msg.sender, address(this), amount);

        uint256 treasuryShare = (amount * TREASURY_BPS) / BPS_DENOMINATOR;
        uint256 creatorShare = amount - treasuryShare;

        token.safeTransfer(creator, creatorShare);
        token.safeTransfer(treasury, treasuryShare);

        emit SubscriptionPaid(
            msg.sender,
            creator,
            block.timestamp + SUBSCRIPTION_DURATION,
            amount
        );
    }
}
