import {
    CreateDaoParams,
    DaoCreationSteps,
    DaoMetadata,
    TokenVotingClient,
    TokenVotingPluginInstall,
    VotingMode,
    MultisigClient,
    MultisigPluginSettings,
    MultisigVotingSettings

} from '@aragon/sdk-client';
import { GasFeeEstimation } from '@aragon/sdk-client-common';
import { Client } from '../lib/sdk';

// Instantiate the general purpose client from the Aragon OSx SDK context.
const NETWORK = 'goerli';
const client = Client(NETWORK);

const metadata: DaoMetadata = {
    name: 'My DAO',
    description: 'This is a description',
    avatar: 'image-url',
    links: [
        {
            name: 'Web site',
            url: 'https://...',
        },
    ],
};

const metadataUri = await client.methods.pinMetadata(metadata);

const tokenVotingPluginInstallParams: TokenVotingPluginInstall = {
    votingSettings: {
        minDuration: 60 * 60 * 24 * 2, // seconds
        minParticipation: 0.25, // 25%
        supportThreshold: 0.5, // 50%
        minProposerVotingPower: BigInt('5000'), // default 0
        votingMode: VotingMode.EARLY_EXECUTION, // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
    },
    newToken: {
        name: 'Token', // the name of your token
        symbol: 'TOK', // the symbol for your token. shouldn't be more than 5 letters
        decimals: 18, // the number of decimals your token uses
        //   minter: "0x...", // optional. if you don't define any, we'll use the standard OZ ERC20 contract. Otherwise, you can define your own token minter contract address.
        balances: [
            {
                // Defines the initial balances of the new token
                address: '0x47d80912400ef8f8224531EBEB1ce8f2ACf4b75a', // address of the account to receive the newly minted tokens
                balance: BigInt(10), // amount of tokens that address should receive
            },
        ],
    },
};

const multisigPluginSettings :MultisigPluginSettings={
    members:['0x1A6cD894065F36bb921e97cE286CB83c3fd14cE0'],
    votingSettings:{
        minApprovals: 1,
        onlyListed: true,
    }
}

// Creates a TokenVoting plugin client with the parameteres defined above (with an existing token).
const tokenVotingInstallItem = TokenVotingClient.encoding.getPluginInstallItem(tokenVotingPluginInstallParams, NETWORK);

const multisigInstallItem =MultisigClient.encoding.getPluginInstallItem(multisigPluginSettings,NETWORK)

const createDaoParams: CreateDaoParams = {
    metadataUri,
    ensSubdomain: `my-org-4i89123234298-${new Date().getTime()}`, // my-org.dao.eth
    plugins: [tokenVotingInstallItem,multisigInstallItem], // plugin array cannot be empty or the transaction will fail. you need at least one governance mechanism to create your DAO.
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(createDaoParams);
console.log({ avg: estimatedGas.average, maximum: estimatedGas.max });

// Create the DAO.
const steps = client.methods.createDao(createDaoParams);

for await (const step of steps) {
    try {
        switch (step.key) {
            case DaoCreationSteps.CREATING:
                console.log({ txHash: step.txHash });
                break;
            case DaoCreationSteps.DONE:
                console.log({
                    daoAddress: step.address,
                    pluginAddresses: step.pluginAddresses,
                });
                break;
        }
    } catch (err) {
        console.error(err);
    }
}
