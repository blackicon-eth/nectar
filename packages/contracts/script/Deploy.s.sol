// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {NectarSubscriptions} from "../src/NectarSubscriptions.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Deploy NectarSubscriptions to Avalanche Fuji.
///
/// Environment:
///   FUJI_RPC_URL        RPC endpoint for Avalanche Fuji (chain id 43113)
///   DEPLOYER_PRIVATE_KEY  deployer/owner private key
///   TREASURY_ADDRESS    Nectar treasury address (receives the 10% share)
///   USDC_ADDRESS        optional; defaults to Circle's Fuji testnet USDC
///
/// Run with:
///   forge script script/Deploy.s.sol --rpc-url fuji --broadcast --verify
contract Deploy is Script {
    // Circle's official USDC on Avalanche Fuji (6 decimals).
    address internal constant FUJI_USDC = 0x5425890298aed601595a70AB815c96711a31Bc65;

    function run() external returns (NectarSubscriptions subscriptions) {
        address usdc = vm.envOr("USDC_ADDRESS", FUJI_USDC);
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        string memory key = vm.envString("DEPLOYER_PRIVATE_KEY");
        bytes memory keyBytes = bytes(key);
        bool hasPrefix = keyBytes.length >= 2 &&
            keyBytes[0] == "0" &&
            keyBytes[1] == "x";
        uint256 deployerKey = vm.parseUint(
            hasPrefix ? key : string.concat("0x", key)
        );

        vm.startBroadcast(deployerKey);
        subscriptions = new NectarSubscriptions(IERC20(usdc), treasury);
        vm.stopBroadcast();

        console2.log("NectarSubscriptions deployed at:", address(subscriptions));
        console2.log("Payment token (USDC):", usdc);
        console2.log("Treasury:", treasury);
    }
}
