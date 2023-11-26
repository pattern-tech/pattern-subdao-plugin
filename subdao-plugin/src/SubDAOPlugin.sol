// SPDX-License-Identifier: MIT 
// SPDX-License_Identifier: APGL-3.0-or-later

pragma solidity ^0.8.0;

import {PluginCloneable, IDAO} from '@aragon/osx/core/plugin/PluginCloneable.sol';

contract SubDAOPlugin is PluginCloneable {
  /// @notice The ID of the permission required to call the `execute` function.
  bytes32 public constant PARENT_PERMISSION_ID = keccak256('PARENT_PERMISSION_ID');

  address public parentDAO;

  /// @notice Initializes the contract.
  /// @param _childDAO The associated DAO.
  /// @param _parentDAO The address of the parent DAO.
  function initialize(IDAO _childDAO, address _parentDAO) external initializer {
    __PluginCloneable_init(_childDAO);
    parentDAO = _parentDAO;
  }

  /// @notice Executes actions in the associated DAO.
  /// @param _actions The actions to be executed by the DAO.
  function execute(IDAO.Action[] calldata _actions) external auth(PARENT_PERMISSION_ID) {
    dao().execute({_callId: 0x0, _actions: _actions, _allowFailureMap: 0});
  }
}