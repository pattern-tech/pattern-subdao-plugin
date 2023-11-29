import { describe, expect, test, beforeAll } from 'bun:test';

import {
    ApplyInstallationParams,
    DaoAction,
    MetadataAbiInput,
    PrepareInstallationParams,
} from '@aragon/sdk-client-common';
import { VoteValues } from '@aragon/sdk-client';
import { Client, TokenVotingClient } from '../lib/sdk';
import { getWallet } from '../lib/helpers';
import { AllowedNetwork } from '../lib/constants';
const log = console.log;

import { ethers } from 'ethers';
import { hexToBytes } from './../lib/helpers';
import { getVotingPluginAddress } from './../client/installSubDAOPlugin';

beforeAll(() => {
    // setup tests
});


describe('Testing SubDAO plugin', () => {
    test('Add new multisig admin', async () => {
        const parent = 'parentdao.dao.eth'; // parent
        const child = 'mehrdadchilddao.dao.eth';
        const NETWORK: AllowedNetwork = 'goerli';
        const deployer = getWallet();
        const client = Client(NETWORK);
        const tokenVotingClient = TokenVotingClient(NETWORK);

        const parentDaoDetails = await client.methods.getDao(parent);
        if (!parentDaoDetails) throw new Error('DAO not found');
        const childDaoDetails = await client.methods.getDao(child);
        if (!childDaoDetails) throw new Error('DAO not found');

        const subdaoPluginContractAddress = '0xaC80199F6392609c58b6A4AF22a73b3EaBE37dcc';
        const toBeAddedApprovers = ['0x00f3eE67e37dE62b8122EC512B3eB484f9C947cF'];

        const childContractAddress = childDaoDetails.address;

        const parentContractAddress = parentDaoDetails.address;
        const { votingPluginAddress: parentVotingPluginContractAddress, votingPluginType: parentVotingPluginType } =
            getVotingPluginAddress(parentDaoDetails);
        const { votingPluginAddress: childVotingPluginContractAddress, votingPluginType: childVotingPluginType } =
            getVotingPluginAddress(childDaoDetails);

        log('Parent DAO Contract: ', parentContractAddress);
        log('Parent Voting Plugin: ', parentVotingPluginContractAddress);
        log('Parent Voting type: ', parentVotingPluginType);
        log('Child DAO Contract: ', childContractAddress);
        log('Child Voting Plugin: ', childVotingPluginContractAddress);
        log('Child Voting type: ', childVotingPluginType);
        log('SubDAO plugin address: ', subdaoPluginContractAddress);
        log('New approvers we want to add: ', toBeAddedApprovers)
        log('Child DAO plugins: ', childDaoDetails.plugins)
        //addAddresses
        const multisigABI = [
            {
                type: 'function',
                name: 'addAddresses',
                inputs: [
                    {
                        type: 'address[]',
                        name: '_members',
                    },
                ],
                stateMutability: 'nonpayable', // specify the stateMutability property
                outputs: [],
            },
        ];

        const multisigPluginInterface = new ethers.utils.Interface(multisigABI);
        //TODO
        const multisigUpdateData = multisigPluginInterface.encodeFunctionData('addAddresses', [toBeAddedApprovers]);

        //TODO
        const updateVotingSettingDaoAction: DaoAction[] = [
            {
                to: childVotingPluginContractAddress, //multidig address
                value: BigInt(0),
                data: hexToBytes(multisigUpdateData),
            },
        ];
        const subdaoPluginAbi = [
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'dao',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'where',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'who',
                        type: 'address',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'permissionId',
                        type: 'bytes32',
                    },
                ],
                name: 'DaoUnauthorized',
                type: 'error',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint8',
                        name: 'version',
                        type: 'uint8',
                    },
                ],
                name: 'Initialized',
                type: 'event',
            },
            {
                inputs: [],
                name: 'PARENT_PERMISSION_ID',
                outputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'dao',
                outputs: [
                    {
                        internalType: 'contract IDAO',
                        name: '',
                        type: 'address',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [
                    {
                        components: [
                            {
                                internalType: 'address',
                                name: 'to',
                                type: 'address',
                            },
                            {
                                internalType: 'uint256',
                                name: 'value',
                                type: 'uint256',
                            },
                            {
                                internalType: 'bytes',
                                name: 'data',
                                type: 'bytes',
                            },
                        ],
                        internalType: 'struct IDAO.Action[]',
                        name: '_actions',
                        type: 'tuple[]',
                    },
                ],
                name: 'execute',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'contract IDAO',
                        name: '_childDAO',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: '_parentDAO',
                        type: 'address',
                    },
                ],
                name: 'initialize',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                inputs: [],
                name: 'parentDAO',
                outputs: [
                    {
                        internalType: 'address',
                        name: '',
                        type: 'address',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'pluginType',
                outputs: [
                    {
                        internalType: 'enum IPlugin.PluginType',
                        name: '',
                        type: 'uint8',
                    },
                ],
                stateMutability: 'pure',
                type: 'function',
            },
            {
                inputs: [
                    {
                        internalType: 'bytes4',
                        name: '_interfaceId',
                        type: 'bytes4',
                    },
                ],
                name: 'supportsInterface',
                outputs: [
                    {
                        internalType: 'bool',
                        name: '',
                        type: 'bool',
                    },
                ],
                stateMutability: 'view',
                type: 'function',
            },
        ];


        const daoInterface = new ethers.utils.Interface(subdaoPluginAbi);
        const data = daoInterface.encodeFunctionData('execute', [updateVotingSettingDaoAction]);

        //TODO
        const daoActions1: DaoAction[] = [
            {
                to: subdaoPluginContractAddress,
                value: BigInt(0),
                data: hexToBytes(data), //update_multisig
            },
        ];


        const metadataUri: string = await tokenVotingClient.methods.pinMetadata({
            title: 'Add multisig address',
            summary: 'This is a test proposal',
            description: 'This is the description of a long test proposal',
            resources: [
                {
                    url: 'https://thforumurl.com',
                    name: 'Forum',
                },
            ],
            media: {
                header: 'https://fileserver.com/header.png',
                logo: 'https://fileserver.com/logo.png',
            },
        });
        const createProposalSteps = tokenVotingClient.methods.createProposal({
            metadataUri,
            pluginAddress: parentVotingPluginContractAddress,
            actions: daoActions1,
            creatorVote: VoteValues.YES, // creator votes yes
            executeOnPass: true, // execute on pass
            startDate: new Date(0), // Start immediately
            endDate: new Date(0), // uses minimum voting duration
        });

        const createProposalStep1Value = await (await createProposalSteps.next()).value;
        log('Transaction Hash: ', await createProposalStep1Value.txHash);

        const createProposalStep2Value = await (await createProposalSteps.next()).value;

        log("Proposal ID: ", await createProposalStep2Value.proposalId);

    },1000000);
});
