// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import {Clones} from '@openzeppelin/contracts/proxy/Clones.sol';

import {PermissionLib} from '@aragon/osx/core/permission/PermissionLib.sol';
import {PluginSetup, IPluginSetup} from '@aragon/osx/framework/plugin/setup/PluginSetup.sol';
import {SubDAOPlugin} from './SubDAOPlugin.sol';
import { IDAO } from "@aragon/osx/core/plugin/Plugin.sol";
import { DAO } from "@aragon/osx/core/dao/DAO.sol";



contract SubDAOPluginSetup is PluginSetup {
  using Clones for address;

  /// @notice The address of `SubDAOPlugin` plugin logic contract to be cloned.
  address private immutable subDAOPluginImplementation;


  /// @notice The constructor setting the `Admin` implementation contract to clone from.
  constructor() {
    subDAOPluginImplementation = address(new SubDAOPlugin());
  }

  /// @inheritdoc IPluginSetup
  function prepareInstallation(
    address _childDAO,
    bytes calldata _data
  ) external returns (address plugin, PreparedSetupData memory preparedSetupData) {
    // Decode `_data` to extract the params needed for cloning and initializing the `SubDAO` plugin.
    address parentDAO = abi.decode(_data, (address));

    if (parentDAO == address(0)) {
      revert("The parentDAO address can not be zero");
    }

    // Clone plugin contract.
    plugin = subDAOPluginImplementation.clone();

    // Initialize cloned plugin contract.
    SubDAOPlugin(plugin).initialize(IDAO(_childDAO), parentDAO);


    // Prepare permissions
    PermissionLib.MultiTargetPermission[]
      memory permissions = new PermissionLib.MultiTargetPermission[](2);

    // Grant the `ADMIN_EXECUTE_PERMISSION` of the plugin to the parentDAO.
    permissions[0] = PermissionLib.MultiTargetPermission({
      operation: PermissionLib.Operation.Grant,
      where: plugin,
      who: parentDAO,
      condition: PermissionLib.NO_CONDITION,
      permissionId: SubDAOPlugin(plugin).PARENT_PERMISSION_ID()
    });

    // Grant the `EXECUTE_PERMISSION` on the DAO to the plugin.
    permissions[1] = PermissionLib.MultiTargetPermission({
      operation: PermissionLib.Operation.Grant,
      where: _childDAO,
      who: plugin,
      condition: PermissionLib.NO_CONDITION,
      permissionId: DAO(payable(_childDAO)).EXECUTE_PERMISSION_ID()
    });

    preparedSetupData.permissions = permissions;
  }

  /// @inheritdoc IPluginSetup
  function prepareUninstallation(
    address _childDAO,
    SetupPayload calldata _payload
  ) external view returns (PermissionLib.MultiTargetPermission[] memory permissions) {
    // Collect addresses
    address plugin = _payload.plugin;
    address parentDAO = SubDAOPlugin(plugin).parentDAO();

    // Prepare permissions
    permissions = new PermissionLib.MultiTargetPermission[](2);

    permissions[0] = PermissionLib.MultiTargetPermission({
      operation: PermissionLib.Operation.Revoke,
      where: plugin,
      who: parentDAO,
      condition: PermissionLib.NO_CONDITION,
      permissionId: SubDAOPlugin(plugin).PARENT_PERMISSION_ID()
    });

    permissions[1] = PermissionLib.MultiTargetPermission({
      operation: PermissionLib.Operation.Revoke,
      where: _childDAO,
      who: plugin,
      condition: PermissionLib.NO_CONDITION,
      permissionId: DAO(payable(_childDAO)).EXECUTE_PERMISSION_ID()
    });
  }

  /// @inheritdoc IPluginSetup
  function implementation() external view returns (address) {
    return subDAOPluginImplementation;
  }
}
