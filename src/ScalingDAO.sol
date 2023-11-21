// SPDX-License-Identifier: MIT
// SPDX-License_Identifier: APGL-3.0-or-later

pragma solidity 0.8.17;

import {PluginCloneable, IDAO} from "@aragon/osx/core/plugin/PluginCloneable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import {IDAOFactory} from "./IDAOFactory.sol";
import {DAOFactory} from "@aragon/osx/framework/dao/DAOFactory.sol";
import {DAO} from "@aragon/osx/core/dao/DAO.sol";

contract ScalingDAO is PluginCloneable {

    //TODO
    bytes32 public constant CREATE_SUB_DAO_PERMISSION_ID = keccak256('CREATE_SUB_DAO_PERMISSION_ID');
    IDAOFactory daoFactory;
    address mainDAO;

    event CreatedDAO(address indexed _daoAddress);


    /// @notice Initializes the contract.
    /// @param _dao The associated DAO.
    /// @param _mainDAO The mainDao address.
    function initialize(IDAO _dao,address _mainDAO) external initializer {
        __PluginCloneable_init(_dao);
        daoFactory=IDAOFactory(0x1E4350A3c9aFbDbd70FA30B9B2350B9E8182449a);
        mainDAO = _mainDAO;

    }



    function createSubDao(
        IDAOFactory.DAOSettings calldata _daoSettings,
        IDAOFactory.PluginSettings[] calldata _pluginSettings
    ) external auth(CREATE_SUB_DAO_PERMISSION_ID) returns (address daoAddress)
    {
        DAO createdDao = daoFactory.createDao(_daoSettings,_pluginSettings);
        daoAddress =address(createdDao);
        emit CreatedDAO(daoAddress);

        // Get Permission IDs
//        bytes32 rootPermissionID = createdDao.ROOT_PERMISSION_ID();
//
//        // Grant the temporary permissions.
//        // Grant `ROOT_PERMISSION` to `pluginSetupProcessor`.
//        createdDao.grant(address(createdDao), address(mainDAO), rootPermissionID);
//

    }

}
