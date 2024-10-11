// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IJaneDoeV2 {
  event PayFrom(uint256 dt, address from, address indexed to, address token, uint256 amount, bytes paymentId);
  event WithdrawTo(uint256 dt, address from, address to, address token, uint256 amount, bytes paymentId);
  event WithdrawToBatch(uint256 dt, address from, address[] to, address[] tokens, uint256[] amounts, bytes paymentId);

  function payFrom(address from, address to, address token, uint256 amount, bytes memory paymentId) external;
  function payNativeFrom(address from, address to, bytes memory paymentId) external payable;
  function withdrawTo(address to, address token, uint256 amount, bytes memory paymentId) external;
  function withdrawEthTo(address to, uint256 amount, bytes memory paymentId) external;
  function withdrawToBatch(address[] memory accounts, address[] memory tokens, uint256[] memory amounts, bytes memory paymentId) external;
}
