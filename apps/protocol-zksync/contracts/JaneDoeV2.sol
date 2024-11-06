// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC1155Upgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import './interfaces/IJaneDoeV2.sol';
import './interfaces/IWrappedNative.sol';

contract JaneDoeV2 is ERC1155Upgradeable, IJaneDoeV2 {
  address private _wrappedNativeAddress;

  function initialize2(string memory uri_, address wrappedNativeAddress_) reinitializer(2) public {
    __ERC1155_init(uri_);
    _wrappedNativeAddress = wrappedNativeAddress_;
  }

  function wrappedNativeAddress() public view returns (address) {
    return _wrappedNativeAddress;
  }

  function payFrom(address from, address to, address token, uint256 amount, bytes memory paymentId) external virtual override {
    SafeERC20.safeTransferFrom(IERC20(token), from, address(this), amount);

    uint256 tokenId = _addressToId(token);
    super._mint(to, tokenId, amount, paymentId);

    emit PayFrom(block.timestamp, from, to, token, amount, paymentId);
  }

  function payNativeFrom(address from, address to, bytes memory paymentId) external payable virtual override {
    IWrappedNative(_wrappedNativeAddress).wrapTo{value: msg.value}(address(this));

    uint256 tokenId = _addressToId(_wrappedNativeAddress);
    super._mint(to, tokenId, msg.value, paymentId);

    emit PayFrom(block.timestamp, from, to, _wrappedNativeAddress, msg.value, paymentId);
  }

  function withdrawTo(address to, address token, uint256 amount) external virtual override {
    uint256 tokenId = _addressToId(token);
    super._burn(_msgSender(), tokenId, amount);

    SafeERC20.safeTransfer(IERC20(token), to, amount);

    emit WithdrawTo(block.timestamp, _msgSender(), to, token, amount);
  }

  function withdrawEthTo(address to, uint256 amount) external virtual override {
    uint256 tokenId = _addressToId(_wrappedNativeAddress);
    super._burn(_msgSender(), tokenId, amount);

    IWrappedNative(_wrappedNativeAddress).unwrapTo(to, amount);

    emit WithdrawTo(block.timestamp, _msgSender(), to, _wrappedNativeAddress, amount);
  }

  function withdrawToBatch(address[] memory accounts, address[] memory tokens, uint256[] memory amounts) external virtual override {
    require(accounts.length == tokens.length, "JaneDoe: accounts and tokens length mismatch");
    require(accounts.length == amounts.length, "JaneDoe: accounts and amounts length mismatch");

    uint256[] memory tokenIds = new uint256[](tokens.length);
    for (uint256 i = 0; i < tokens.length; ++i) {
      tokenIds[i] = _addressToId(tokens[i]);
    }

    super._burnBatch(_msgSender(), tokenIds, amounts);

    for (uint256 i = 0; i < tokens.length; ++i) {
      if (tokens[i] == _wrappedNativeAddress) {
        IWrappedNative(_wrappedNativeAddress).unwrapTo(accounts[i], amounts[i]);
      } else {
        SafeERC20.safeTransfer(IERC20(tokens[i]), accounts[i], amounts[i]);
      }
    }

    emit WithdrawToBatch(block.timestamp, _msgSender(), accounts, tokens, amounts);
  }

  receive() external payable { }

  function _addressToId(address addr) private pure returns (uint256) {
    return uint256(uint160(addr));
  }
}
