// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20Upgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import { ReentrancyGuardUpgradeable } from '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';

import './interfaces/IWrappedNative.sol';

contract WrappedNative is ERC20Upgradeable, ReentrancyGuardUpgradeable, IWrappedNative {
  uint8 private _decimals;

  constructor() {
    _disableInitializers();
  }

  function initialize(string memory name_, string memory symbol_, uint8 decimals_) initializer public {
    __ERC20_init(name_, symbol_);
    _decimals = decimals_;
  }

  function decimals() public view virtual override returns (uint8) {
    return _decimals;
  }

  function wrapTo(address to) external payable virtual override {
    super._mint(to, msg.value);
  }

  function unwrapTo(address to, uint256 amount) external virtual override nonReentrant {
    _burn(_msgSender(), amount);
    (bool success, ) = payable(to).call{value: amount}("");
    require(success, "WrappedNative: unwrap to failed");
  }

  function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
    require(amount > 0, "WrappedNative: amount should be greater than 0");
    return super.transferFrom(from, to, amount);
  }

  receive() external payable {
    super._mint(_msgSender(), msg.value);
  }
}
