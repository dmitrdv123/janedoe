// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { ReentrancyGuardUpgradeable } from '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';

import './interfaces/IJaneDoe.sol';
import './interfaces/IRangoMessageReceiver.sol';

contract RangoReceiver is Initializable, ReentrancyGuardUpgradeable, IRangoMessageReceiver {
  address private _janedoeAddress;

  constructor() {
    _disableInitializers();
  }

  function initialize(address janedoeAddress_) initializer public {
    _janedoeAddress = janedoeAddress_;
  }

  function janedoeAddress() public view returns (address) {
    return _janedoeAddress;
  }

  function handleRangoMessage(address _token, uint _amount, ProcessStatus _status, bytes memory _message) external payable virtual override nonReentrant {
    AppMessage memory message = abi.decode((_message), (AppMessage));

    if (_status == ProcessStatus.SUCCESS) {
      if (_token == address(0)) {
        IJaneDoe(_janedoeAddress).payNativeFrom{value: _amount}(message.from, message.to, message.paymentId);
      } else {
        IJaneDoe(_janedoeAddress).payFrom(message.from, message.to, _token, _amount, message.paymentId);
      }
    } else if (_status == ProcessStatus.REFUND_IN_SOURCE || _status == ProcessStatus.REFUND_IN_DESTINATION) {
      if (_token == address(0)) {
        (bool sent, ) = payable(message.from).call{value: _amount}("");
        require(sent, "failed to send native");
      } else {
        SafeERC20.safeTransfer(IERC20(_token), message.from, _amount);
      }
    }

    emit HandleRangoMessage(block.timestamp, message.from, message.to, _token, _amount, message.paymentId, _status);
  }

  receive() external payable { }
}
