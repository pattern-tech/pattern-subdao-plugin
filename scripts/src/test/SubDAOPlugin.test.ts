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
import {MULTISIG_ABI} from "../lib/abis";


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

let parentEns=`parentdao-${new Date().getTime()}.dao.eth`
let childEns1=`child1dao-${new Date().getTime()}.dao.eth`
let childEns2=`child2dao-${new Date().getTime()}.dao.eth`
console.log('parentEns:',parentEns)
console.log('childEns1:',childEns1)
console.log('childEns2:',childEns2)

let daoAddressParent: string;
let pluginAddressesParent: string[];
let daoAddressChild1: string;
let pluginAddressesChild1: string[];
let daoAddressChild2: string;
let pluginAddressesChild2: string[];
let changeVotingClientChild1:ChangeVotingSettingClient;
let changeVotingClientChild2:ChangeVotingSettingClient;
let subAdminPluginChild1;
let subAdminPluginChild2;

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
    // //---------------------------------------------
    // // Parent DAO Contract:  0x9A3aeeF82539a6c7F1A2bb712Fe11C4a6908e3BD
    // //                       0x1275caF82b4a1C6E1276Ab69C7f329BdbBD3510d
    // //                       0x01ec28d9Cdda4d96EcCFd88C1B532C50272a1CEa
    // subAdminPluginChild1=await installSubDaoPlugin(childEns1, parentEns, network);
    // console.log('subAdminPluginChild1 finished')
    // subAdminPluginChild2=await installSubDaoPlugin(childEns2, parentEns, network);
    // console.log('subAdminPluginChild2 finished')
    //---------------------------------------------
    parentEns="parentdao-1701631131156.dao.eth"
    childEns1="child1dao-1701631131156.dao.eth"
    childEns2="child2dao-1701631131156.dao.eth"
    subAdminPluginChild1="0xEAbeCe53a204ed38b4f865C5E8EA3590D01A65e0"
    subAdminPluginChild2="0x797959cCa7A896DC61CCC5744510F7D76FAF1526"


    //---------------------------------------------
    changeVotingClientChild1 = new ChangeVotingSettingClient(parentEns, childEns1,  subAdminPluginChild1, network);
    await changeVotingClientChild1.initial();
    //---------------------------------------------
    changeVotingClientChild2 = new ChangeVotingSettingClient(parentEns, childEns2,  subAdminPluginChild2, network);
    await changeVotingClientChild2.initial();

});


describe('Testing SubDAO plugin', () => {
    test('Add new multisig admin', async () => {
        const newMember="0x612A6506e7cdD093598D876d19c9e231737E72Be"
        await changeVotingClientChild2.multisigAddAddresses([newMember])
        expect(await changeVotingClientChild2.isMember(newMember,MULTISIG_ABI)).toBe(true)
    },100000);
    test('time',async()=>{
        const timeout = 20000;

        // Use a promise to create a delay using setTimeout
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // Perform some asynchronous operations or await some promises here
        // For example, you can use "await" with asynchronous functions or promises

        // Wait for the specified time using the delay function
        await delay(timeout);

    },100000);
    test('Remove old multisig admin', async () => {
        const oldMember="0x612A6506e7cdD093598D876d19c9e231737E72Be"
        await changeVotingClientChild2.multisigRemoveAddresses([oldMember])
        expect(await changeVotingClientChild2.isMember(oldMember,MULTISIG_ABI)).toBe(false)
    },100000);

});
