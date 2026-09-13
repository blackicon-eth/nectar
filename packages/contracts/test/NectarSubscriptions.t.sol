// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {NectarSubscriptions} from "../src/NectarSubscriptions.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract NectarSubscriptionsTest is Test {
    NectarSubscriptions internal subs;
    MockERC20 internal usdc;

    address internal owner = makeAddr("owner");
    address internal treasury = makeAddr("treasury");
    address internal creator = makeAddr("creator");
    address internal subscriber = makeAddr("subscriber");

    uint256 internal constant PRICE = 5e6; // 5 USDC (6 decimals)

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC");
        vm.prank(owner);
        subs = new NectarSubscriptions(usdc, treasury);
        vm.prank(creator);
        subs.setPrice(PRICE);
    }

    function test_constructor_setsTokenAndTreasury() public view {
        assertEq(address(subs.token()), address(usdc));
        assertEq(subs.treasury(), treasury);
        assertEq(subs.owner(), owner);
    }

    function test_subscribe_splitsPayment_90_10() public {
        usdc.mint(subscriber, PRICE);
        vm.prank(subscriber);
        usdc.approve(address(subs), PRICE);

        vm.warp(1_700_000_000);

        uint256 expiresAt = 1_700_000_000 + 30 days;

        vm.expectEmit(true, true, true, true);
        emit NectarSubscriptions.SubscriptionPaid(
            subscriber,
            creator,
            expiresAt,
            PRICE
        );

        vm.prank(subscriber);
        subs.subscribe(creator);

        uint256 creatorShare = (PRICE * 9_000) / 10_000; // 4_500_000
        uint256 treasuryShare = PRICE - creatorShare; // 500_000

        assertEq(usdc.balanceOf(creator), creatorShare);
        assertEq(usdc.balanceOf(treasury), treasuryShare);
        assertEq(usdc.balanceOf(subscriber), 0);
        assertEq(creatorShare + treasuryShare, PRICE);
    }

    function test_subscribe_roundingFavorsCreator() public {
        // 1 base unit: 90% = 0, remainder (1) goes to creator.
        usdc.mint(subscriber, 1);
        vm.prank(subscriber);
        usdc.approve(address(subs), 1);

        vm.prank(creator);
        subs.setPrice(1);

        vm.prank(subscriber);
        subs.subscribe(creator);

        assertEq(usdc.balanceOf(creator), 1);
        assertEq(usdc.balanceOf(treasury), 0);
    }

    function test_subscribe_revertsWithoutPrice() public {
        address noPrice = makeAddr("noPrice");
        usdc.mint(subscriber, PRICE);
        vm.prank(subscriber);
        usdc.approve(address(subs), PRICE);

        vm.expectRevert("Nectar: no price");
        vm.prank(subscriber);
        subs.subscribe(noPrice);
    }

    function test_subscribe_revertsWithoutAllowance() public {
        usdc.mint(subscriber, PRICE);

        vm.expectRevert();
        vm.prank(subscriber);
        subs.subscribe(creator);
    }

    function test_setPrice_onlyAffectsOwnRecord() public {
        vm.prank(creator);
        subs.setPrice(10e6);

        assertEq(subs.priceOf(creator), 10e6);

        address other = makeAddr("other");
        vm.prank(other);
        subs.setPrice(1e6);

        assertEq(subs.priceOf(creator), 10e6);
        assertEq(subs.priceOf(other), 1e6);
    }

    function test_setTreasury_onlyOwner() public {
        address newTreasury = makeAddr("newTreasury");

        vm.expectRevert();
        vm.prank(creator);
        subs.setTreasury(newTreasury);

        vm.prank(owner);
        subs.setTreasury(newTreasury);
        assertEq(subs.treasury(), newTreasury);
    }

    function test_setTreasury_revertsOnZero() public {
        vm.expectRevert("Nectar: zero treasury");
        vm.prank(owner);
        subs.setTreasury(address(0));
    }
}
