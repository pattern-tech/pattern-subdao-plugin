// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@aragon/osx/utils/protocol/IProtocolVersion.sol";
import "@aragon/osx/utils/protocol/ProtocolVersion.sol";
import "@aragon/osx/core/dao/DAO.sol";
import "@aragon/osx/core/permission/PermissionLib.sol";
import "@aragon/osx/utils/Proxy.sol";
import "@aragon/osx/framework/plugin/repo/PluginRepo.sol";
import "@aragon/osx/framework/plugin/setup/PluginSetupProcessor.sol";
import "@aragon/osx/framework/plugin/setup/PluginSetupProcessorHelpers.sol";
import "@aragon/osx/framework/plugin/setup/IPluginSetup.sol";
import "@aragon/osx/framework/dao/DAORegistry.sol";

interface IDAOFactory {
    function daoBase() external view returns (address);
    function daoRegistry() external view returns (DAORegistry);
    function pluginSetupProcessor() external view returns (PluginSetupProcessor);

    struct DAOSettings {
        address trustedForwarder;
        string daoURI;
        string subdomain;
        bytes metadata;
    }

    struct PluginSettings {
        PluginSetupRef pluginSetupRef;
        bytes data;
    }

    function supportsInterface(bytes4 _interfaceId) external view returns (bool);
    function createDao(DAOSettings calldata _daoSettings, PluginSettings[] calldata _pluginSettings) external returns (DAO createdDao);
}

//interface IDAO is IProtocolVersion {
//    function ROOT_PERMISSION_ID() external view returns (bytes32);
//    function UPGRADE_DAO_PERMISSION_ID() external view returns (bytes32);
//    function SET_SIGNATURE_VALIDATOR_PERMISSION_ID() external view returns (bytes32);
//    function SET_TRUSTED_FORWARDER_PERMISSION_ID() external view returns (bytes32);
//    function SET_METADATA_PERMISSION_ID() external view returns (bytes32);
//    function REGISTER_STANDARD_CALLBACK_PERMISSION_ID() external view returns (bytes32);
//
//    function grant(address _entity, address _grantee, bytes32 _permissionId) external;
//    function revoke(address _entity, address _grantee, bytes32 _permissionId) external;
//    function initialize(
//        bytes calldata _metadata,
//        address _initialOwner,
//        address _trustedForwarder,
//        string calldata _daoURI
//    ) external;
//    function applySingleTargetPermissions(address _entity, PermissionLib.SingleTargetPermission[] memory _permissions) external;
//}

interface IPluginSetupProcessor {
    function APPLY_INSTALLATION_PERMISSION_ID() external view returns (bytes32);

    struct PrepareInstallationParams {
        PluginSetupRef pluginSetupRef;
        bytes data;
    }

    struct ApplyInstallationParams {
        PluginSetupRef pluginSetupRef;
        address plugin;
        bytes32[] permissions;
        bytes32[] helpers;
    }

    function prepareInstallation(address _dao, PrepareInstallationParams calldata _params) external returns (address plugin, IPluginSetup.PreparedSetupData memory preparedSetupData);
    function applyInstallation(address _dao, ApplyInstallationParams calldata _params) external;
}

// Add any other necessary interfaces from your imported contracts here
