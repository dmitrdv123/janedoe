// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRangoMessageReceiver {
  enum ProcessStatus {
    SUCCESS,
    REFUND_IN_SOURCE,
    REFUND_IN_DESTINATION
  }

  struct AppMessage {
    address from;
    address to;
    bytes paymentId;
  }

  event HandleRangoMessage(uint256 dt, address from, address to, address token, uint256 amount, bytes paymentId, ProcessStatus status);

  function handleRangoMessage(address _token, uint _amount, ProcessStatus _status, bytes memory _message) external payable;
}
