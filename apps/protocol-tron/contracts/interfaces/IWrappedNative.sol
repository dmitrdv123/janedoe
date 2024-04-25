// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IWrappedNative {
  function wrapTo(address to) external payable;
  function unwrapTo(address to, uint256 amount) external;
}
