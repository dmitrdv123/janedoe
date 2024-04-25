// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IJaneDoe {
  event PayFrom(uint256 dt, address from, address indexed to, address token, uint256 amount, bytes paymentId);
  event WithdrawTo(uint256 dt, address to, address token, uint256 amount);
  event WithdrawToBatch(uint256 dt, address[] accounts, address[] tokens, uint256[] amounts);

  function payFrom(address from, address to, address token, uint256 amount, bytes memory paymentId) external;
  function payNativeFrom(address from, address to, bytes memory paymentId) external payable;
  function withdrawTo(address to, address token, uint256 amount) external;
  function withdrawEthTo(address to, uint256 amount) external;
  function withdrawToBatch(address[] memory accounts, address[] memory tokens, uint256[] memory amounts) external;
}
