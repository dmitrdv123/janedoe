// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IWrappedNative {
  function wrapTo(address to) external payable;
  function unwrapTo(address to, uint256 amount) external;
}
