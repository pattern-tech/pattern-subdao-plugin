import { activeContractsList } from "@aragon/osx-ethers";
import {
    ApplyInstallationParams,
    DaoAction,
    MetadataAbiInput,
    PrepareInstallationParams,
} from "@aragon/sdk-client-common";
import { VoteValues } from "@aragon/sdk-client";
import { Client, TokenVotingClient } from "../lib/sdk";
import { getWallet } from "../lib/helpers";
import { AllowedNetwork } from "../lib/constants";
const log = console.log;

import { ethers } from 'ethers';

function hexStringToUint8Array(hexString: string): Uint8Array {
    // Convert hex string to array of bytes
    const bytes: number[] = hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];

    // Create Uint8Array from the array of bytes
    return new Uint8Array(bytes);
}

// ======================= *** CONFIG *** =====================

// ***NOTE***: The configured Private Key must be Able to create proposals on the DAO
const DAO_ADDRESS_OR_ENS = "testtesttesttest.dao.eth";
const NETWORK: AllowedNetwork = "goerli";

// ============================================================
// 0. Setup: Get all the addresses and contracts
// ============================================================
// ***0a. Setup Aragon stuff***
const deployer = getWallet();
const client = Client(NETWORK);
const tokenVotingClient = TokenVotingClient(NETWORK);

// get the dao details
const daoDetails = await client.methods.getDao(DAO_ADDRESS_OR_ENS);
if (!daoDetails) throw new Error("DAO not found");

const DAO_ADDRESS = daoDetails.address;
const VOTING_APP_ADDRESS = daoDetails.plugins[0].instanceAddress;

log("DAO Contract: ", DAO_ADDRESS);
log("Voting Plugin: ", VOTING_APP_ADDRESS);

const metadataUri: string = await tokenVotingClient.methods.pinMetadata({
    title: "Create sub dAO",
    summary: "This is a test proposal",
    description: "This is the description of a long test proposal",
    resources: [
        {
            url: "https://thforumurl.com",
            name: "Forum",
        },
    ],
    media: {
        header: "https://fileserver.com/header.png",
        logo: "https://fileserver.com/logo.png",
    },
});

// we want to creat e porposal to call createSubDao
// 0x7e8DC27d3BEc04Aea5E24eA3A20D960f84183050
// ABI for IDAOFactory
const daoFactoryABI = [
    {
        type: 'function',
        name: 'createSubDao',
        inputs: [
            {
                type: 'tuple',
                name: 'DAOSettings',
                components: [
                    { type: 'address', name: 'trustedForwarder' },
                    { type: 'string', name: 'daoURI' },
                    { type: 'string', name: 'subdomain' },
                    { type: 'bytes', name: 'metadata' },
                ],
            },
            {
                type: 'tuple[]',
                name: 'PluginSettings',
                components: [
                    {
                        type: 'tuple',
                        name: 'pluginSetupRef',
                        components: [
                            {
                                type: 'tuple',
                                name: 'versionTag',
                                components: [
                                    { type: 'uint8', name: 'release' },
                                    { type: 'uint16', name: 'build' },
                                ],
                            },
                            { type: 'address', name: 'pluginSetupRepo' },
                        ],
                    },
                    { type: 'bytes', name: 'data' },
                ],
            },
        ],
        stateMutability: 'nonpayable', // specify the stateMutability property
        outputs: [
            { type: 'address', name: 'daoAddress' }, // add the daoAddress output
        ],
    },
];


// Sample values

const daoSettings = {
    trustedForwarder: "0x0000000000000000000000000000000000000000",
    daoURI: '',
    subdomain: 'testtesttesttestkgdgfagdkjafganfdkldjkljkdsfa',
    metadata: '0x697066733a2f2f516d55423775676d6542614b6169674c4b686f326750485438725033317a4263576a737148755a4b536353597170',
};
//Token voting
const pluginSettings = [
    {
        pluginSetupRef: {
            versionTag: {
                release: 1,
                build: 2,
            },
            pluginSetupRepo: '0xFCc843C48BD44e5dA5976a2f2d85772D59C5959E',
        },
        data:
            '0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000007a12000000000000000000000000000000000000000000000000000000000000249f000000000000000000000000000000000000000000000000000000000000151800000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000047269616c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034952520000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000030000000000000000000000002d5240cd92f30228bca1734313238874362958180000000000000000000000001a6cd894065f36bb921e97ce286cb83c3fd14ce0000000000000000000000000612a6506e7cdd093598d876d19c9e231737e72be00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000de0b6b3a7640000',
    },
    // Add more plugin settings if needed
];

// Define the parameters you want to encode
//(address[], Multisig.MultisigSettings)
//struct MultisigSettings {
//         bool onlyListed;
//         uint16 minApprovals;
//     }
const parameters = [
    ['0x2D5240cd92F30228bcA173431323887436295818'],// address[]
    true,               // bool
    1                     // uint16
];

// Encode the parameters
const encodedData1 = ethers.utils.defaultAbiCoder.encode(
    ['address[]', 'bool', 'uint16'], // Types of the parameters
    parameters                                // Values of the parameters
);
//0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000002d5240cd92f30228bca173431323887436295818
console.log(encodedData1)

const parameters2 = [
    ['0x2D5240cd92F30228bcA173431323887436295818','0x1A6cD894065F36bb921e97cE286CB83c3fd14cE0'],// address[]
    true,               // bool
    2                   // uint16
];

// Encode the parameters
const encodedData2 = ethers.utils.defaultAbiCoder.encode(
    ['address[]', 'bool', 'uint16'], // Types of the parameters
    parameters2                                // Values of the parameters
);
console.log(encodedData2)

const pluginSettings1 = [
    //multisig 0x4D599adC92fC3266673Cd804cE761Fb103Af8991
    {
        pluginSetupRef: {
            versionTag: {
                release: 1,
                build: 2,
            },
            pluginSetupRepo: '0x92C090cffC592B1bC321aCfAF735057B876375F8',
        },
        data:
         encodedData1,
    },
    //multisig 0xcF72551270bbde7d7d0B185aC039ff17A961987E
    {
        pluginSetupRef: {
            versionTag: {
                release: 1,
                build: 2,
            },
            pluginSetupRepo: '0x92C090cffC592B1bC321aCfAF735057B876375F8',
        },
        data:

        encodedData2,
    },
    // Add more plugin settings if needed
];




// Encode function data
const iface = new ethers.utils.Interface(daoFactoryABI);
log('here1')
const data = iface.encodeFunctionData('createSubDao', [daoSettings, pluginSettings1]);
log('here2')

const daoActions: DaoAction[] =[
    {
        to: "0x824a338e9905d3EAdd3c629c19A53624003D4aA5",
        value: BigInt(0),
        data: hexStringToUint8Array(data.slice(2)),
    }
];

log(daoActions)


const createProposalSteps = tokenVotingClient.methods.createProposal({
    metadataUri,
    pluginAddress: VOTING_APP_ADDRESS,
    actions: daoActions,
    creatorVote: VoteValues.YES, // creator votes yes
    executeOnPass: true, // execute on pass
    startDate: new Date(0), // Start immediately
    endDate: new Date(0), // uses minimum voting duration
});

// 2d. ***Iterate through the steps***
const createProposalStep1Value = await (await createProposalSteps.next()).value;
log("Transaction Hash: ", await createProposalStep1Value.txHash);

const createProposalStep2Value = await (await createProposalSteps.next()).value;
log("Proposal ID: ", await createProposalStep2Value.proposalId);

