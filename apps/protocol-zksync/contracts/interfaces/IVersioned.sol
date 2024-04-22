// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVersioned {
  function version() external view returns (string memory);
}
