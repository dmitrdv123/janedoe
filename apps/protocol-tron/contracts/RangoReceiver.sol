// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import './interfaces/IJaneDoe.sol';
import './interfaces/IRangoMessageReceiver.sol';

contract RangoReceiver is Initializable, IRangoMessageReceiver {
  address private _janedoeAddress;

  function initialize(address janedoeAddress_) initializer public {
    _janedoeAddress = janedoeAddress_;
  }

  function janedoeAddress() public view returns (address) {
    return _janedoeAddress;
  }

  function handleRangoMessage(address _token, uint _amount, ProcessStatus _status, bytes memory _message) external payable virtual override {
    AppMessage memory message = abi.decode((_message), (AppMessage));

    if (_token == address(0)) {
      IJaneDoe(_janedoeAddress).payNativeFrom{value: _amount}(message.from, message.to, message.paymentId);
    } else {
      IJaneDoe(_janedoeAddress).payFrom(message.from, message.to, _token, _amount, message.paymentId);
    }

    emit HandleRangoMessage(block.timestamp, message.from, message.to, _token, _amount, message.paymentId, _status);
  }

  receive() external payable { }
}
