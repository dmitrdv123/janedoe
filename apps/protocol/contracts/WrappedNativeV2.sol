// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20Upgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import './interfaces/IWrappedNative.sol';

contract WrappedNativeV2 is ERC20Upgradeable, IWrappedNative {
  uint8 private _decimals;

  function initialize1(string memory name_, string memory symbol_, uint8 decimals_) reinitializer(2) public {
    __ERC20_init(name_, symbol_);
    _decimals = decimals_;
  }

  function decimals() public view virtual override returns (uint8) {
    return _decimals;
  }

  function wrapTo(address to) external payable virtual override {
    super._mint(to, msg.value);
  }

  function unwrapTo(address to, uint256 amount) external virtual override {
    _burn(_msgSender(), amount);
    payable(to).transfer(amount);
  }

  function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
    require(amount > 0, "WrappedNative: amount should be greater than 0");
    return super.transferFrom(from, to, amount);
  }

  receive() external payable {
    super._mint(_msgSender(), msg.value);
  }
}
