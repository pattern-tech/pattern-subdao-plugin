import { describe, expect, test, beforeAll } from 'bun:test';

import {
    ApplyInstallationParams,
    DaoAction,
    MetadataAbiInput,
    PrepareInstallationParams, ProposalMetadata,
} from '@aragon/sdk-client-common';
import {
    DaoMetadata,
    MultisigPluginSettings,
    TokenVotingPluginInstall,
    VoteValues,
    VotingMode
} from '@aragon/sdk-client';
import { Client, TokenVotingClient } from '../lib/sdk';
import { getWallet } from '../lib/helpers';
import { AllowedNetwork } from '../lib/constants';
const log = console.log;

import { ethers } from 'ethers';
import { hexToBytes } from './../lib/helpers';
import {getVotingPluginAddress, installSubDaoPlugin} from './../client/installSubDAOPlugin';
import {createNewDAO} from "../client/newDao";
import {ChangeVotingSettingClient} from "../client/changeVotingSetting";


function convertTODecimal(value:number,decimal:number){
    return value*Math.pow(10,decimal);
}


const network: AllowedNetwork = 'goerli';
//TODO
const porposalMetadata:ProposalMetadata = {
    title: 'Create dao',
    summary: 'Create dao',
    description: `By installing this plugin, the plugin will grant the execution access of child da to parent`,
    resources: [
        {
            url: 'https://patterns.community',
            name: 'Pattern',
        },
    ],
    media: {
        header: 'https://assets-global.website-files.com/65410dc30116ce87ecbef5cd/654f75bc7db9aa282ca87e21_Logo%2Btext%20White.png',
        logo: 'https://assets-global.website-files.com/65410dc30116ce87ecbef5cd/654f75bc7db9aa282ca87e21_Logo%2Btext%20White.png',
    },
};
const createDAOMetadata: DaoMetadata = {
    name: "My DAO",
    description: "This is a description",
    avatar: "https://images.freeimages.com/images/large-previews/360/banana-1-1330048.jpg",
    links: [{
        name: "Web site",
        url: "https://...",
    }]
}

const tokenVotingPluginSettings:TokenVotingPluginInstall ={
    votingSettings: {
        minDuration: 60 * 60 * 24 * 2, // seconds
        minParticipation: 0.25, // 25%
        supportThreshold: 0.5, // 50%
        minProposerVotingPower: BigInt("5000"), // default 0
        votingMode: VotingMode.EARLY_EXECUTION, // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
    },
    newToken: {
        name: "Token", // the name of your token
        symbol: "TOK", // the symbol for your token. shouldn't be more than 5 letters
        decimals: 18, // the number of decimals your token uses
        //   minter: "0x...", // optional. if you don't define any, we'll use the standard OZ ERC20 contract. Otherwise, you can define your own token minter contract address.
        balances: [
            { // Defines the initial balances of the new token
                address: "0x2D5240cd92F30228bcA173431323887436295818", // address of the account to receive the newly minted tokens
                balance: BigInt(convertTODecimal(10,18)), // amount of tokens that address should receive
            },
        ],
    },
};

const multisigPluginSettings :MultisigPluginSettings={
    members:["0x2D5240cd92F30228bcA173431323887436295818"],
    votingSettings:{
        minApprovals: 1,
        onlyListed: true,
    }
}

const parentEns=`parentdao-${new Date().getTime()}.dao.eth`
const childEns1=`child1dao-${new Date().getTime()}.dao.eth`
const childEns2=`child2dao-${new Date().getTime()}.dao.eth`
console.log('parentEns:',parentEns)
console.log('childEns1:',childEns1)
console.log('childEns2:',childEns2)

let daoAddressParent: string;
let pluginAddressesParent: string[];
let daoAddressChild1: string;
let pluginAddressesChild1: string[];
let daoAddressChild2: string;
let pluginAddressesChild2: string[];

beforeAll( async() => {
    // const{daoAddress:daoParent, pluginAddresses:pluginParent}=await createNewDAO(network,createDAOMetadata,[tokenVotingPluginSettings],parentEns);
    // daoAddressParent = daoParent;
    // pluginAddressesParent = pluginParent;
    // //---------------------------------------------
    // const{daoAddress:daoChild1, pluginAddresses:pluginChild1}=await createNewDAO(network,createDAOMetadata,[tokenVotingPluginSettings],childEns1);
    // daoAddressChild1 = daoChild1;
    // pluginAddressesChild1 = pluginChild1;
    // //---------------------------------------------
    // const{daoAddress:daoChild2, pluginAddresses:pluginChild2}=await createNewDAO(network,createDAOMetadata,[multisigPluginSettings],childEns2);
    // daoAddressChild2 = daoChild2;
    // pluginAddressesChild2= pluginChild2;
    //---------------------------------------------
    // Parent DAO Contract:  0x9A3aeeF82539a6c7F1A2bb712Fe11C4a6908e3BD
    //                      0x1275caF82b4a1C6E1276Ab69C7f329BdbBD3510d
    //                      0x01ec28d9Cdda4d96EcCFd88C1B532C50272a1CEa
    await installSubDaoPlugin('child1dao-1701257361998.dao.eth', 'parentdao-1701257361998.dao.eth', network);
    await installSubDaoPlugin(childEns1, parentEns, network);
    await installSubDaoPlugin(childEns2, parentEns, network);
    //---------------------------------------------
    // const changeVotingClient = new ChangeVotingSettingClient(parentDAO, childDAO, subAdminPlugin, network);
    // await changeVotingClient.initial();


});


describe('Testing SubDAO plugin', () => {
    test('Add new multisig admin', async () => {

    },1000000);
});
