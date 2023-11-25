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

function hexStringToUint8Array(hexString: string): Uint8Array {
    // Convert hex string to array of bytes
    const bytes: number[] = hexString.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [];

    // Create Uint8Array from the array of bytes
    return new Uint8Array(bytes);
}
beforeAll(() => {
    // setup tests
});

describe('Testing SubDAO plugin', () => {
    test('Add new multisig admin', async () => {
        const DAO_ADDRESS_OR_ENS = 'testtesttesttest.dao.eth';
        const NETWORK: AllowedNetwork = 'goerli';
        const deployer = getWallet();
        const client = Client(NETWORK);
        const tokenVotingClient = TokenVotingClient(NETWORK);
        const daoDetails = await client.methods.getDao(DAO_ADDRESS_OR_ENS);
        if (!daoDetails) throw new Error('DAO not found');

        const DAO_ADDRESS = daoDetails.address;
        const VOTING_APP_ADDRESS = daoDetails.plugins[0].instanceAddress;

        log('DAO Contract: ', DAO_ADDRESS);
        log('Voting Plugin: ', VOTING_APP_ADDRESS);

        const metadataUri: string = await tokenVotingClient.methods.pinMetadata({
            title: 'Create sub dAO',
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

        const iface2 = new ethers.utils.Interface(multisigABI);
        //TODO
        const data2 = iface2.encodeFunctionData('addAddresses', ['address']);

        //TODO
        const daoActions: DaoAction[] = [
            {
                to: '0x9addb6f7c29fed19cfca4e367afc656c7d5b8856', //multidig address
                value: BigInt(0),
                data: hexStringToUint8Array(data2.slice(2)),
            },
        ];
        const daoABI = [
            {
                type: 'function',
                name: 'execute',
                inputs: [
                    {
                        type: 'bytes32',
                        name: '_callId',
                    },
                    {
                        type: 'tuple[]',
                        name: '_actions',
                        components: [
                            {
                                type: 'address',
                                name: 'to',
                            },
                            {
                                type: 'uint256',
                                name: 'value',
                            },
                            {
                                type: 'bytes',
                                name: 'data',
                            },
                        ],
                    },
                    {
                        type: 'uint256',
                        name: '_allowFailureMap',
                    },
                ],
                stateMutability: 'nonpayable', // specify the stateMutability property
                outputs: [
                    { type: 'bytes[]', name: 'execResults' }, // add the daoAddress output
                    { type: 'uint256', name: 'failureMap' },
                ],
            },
        ];

        const iface = new ethers.utils.Interface(daoABI);
        const data = iface.encodeFunctionData('execute', ['0x0', daoActions, 0]);

        //TODO
        const daoActions1: DaoAction[] = [
            {
                to: '0xc558355df029790ca55a50bdcf38c8b4b3500015',
                value: BigInt(0),
                data: hexStringToUint8Array(data.slice(2)), //update_multisig
            },
        ];

        const createProposalSteps = tokenVotingClient.methods.createProposal({
            metadataUri,
            pluginAddress: VOTING_APP_ADDRESS,
            actions: daoActions1,
            creatorVote: VoteValues.YES, // creator votes yes
            executeOnPass: true, // execute on pass
            startDate: new Date(0), // Start immediately
            endDate: new Date(0), // uses minimum voting duration
        });

        const createProposalStep1Value = await (await createProposalSteps.next()).value;
        log('Transaction Hash: ', await createProposalStep1Value.txHash);

        const createProposalStep2Value = await (await createProposalSteps.next()).value;
        log('Proposal ID: ', await createProposalStep2Value.proposalId);
    }, 100000);
});
