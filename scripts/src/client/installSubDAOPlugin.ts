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
import { ethers } from 'ethers';

const log = console.log;

// ======================= *** CONFIG *** =====================

// ***NOTE***: The configured Private Key must be Able to create proposals on the DAO
const childDAOAddress = "daoyeman.dao.eth";
const NETWORK: AllowedNetwork = "goerli";
const adminRepoAddress = '0x44B7C01C5101bb94B4fA9A7f72c42bcAA87979Ca'

// ============================================================
// 0. Setup: Get all the addresses and contracts
// ============================================================
// ***0a. Setup Aragon stuff***
const deployer = getWallet();
const client = Client(NETWORK);
const tokenVotingClient = TokenVotingClient(NETWORK);

// We are going to use the admin repo because its super simple and deploying our own repo can already be done with the cli
// const adminRepoAddress = activeContractsList[NETWORK]["admin-repo"];

// get the dao details
const daoDetails = await client.methods.getDao(childDAOAddress);
if (!daoDetails) throw new Error("DAO not found");

const DAO_ADDRESS = daoDetails.address;
const VOTING_APP_ADDRESS = daoDetails.plugins[0].instanceAddress;

log("DAO Contract: ", DAO_ADDRESS);
log("Voting Plugin: ", VOTING_APP_ADDRESS);
log(daoDetails.plugins)

// ==============================================================
// 1. PrepareInstallation: Using the PluginSetupProcessor, prepare the installation
// https://github.com/aragon/osx/blob/a52bbae69f78e74d6a17647370ccfa2f2ea9bbf0/packages/contracts/src/framework/plugin/setup/PluginSetupProcessor.sol#L287-L288
// ==============================================================

// 1a. ***Prepare the installation metadata***
// This is the metadata that is needed to initialize the plugin. Its the the same thing that is encoded in the setup contract
// https://devs.aragon.org/docs/osx/how-to-guides/plugin-development/publication/metadata
const adminSetupAbiMetadata: MetadataAbiInput[] = [
    {
        "internalType": "address",
        "name": "_childDAO",
        "type": "address",
        description:"description"
    },
    {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes",
        description:"description"
    }
];

// 1b. ***Prepare the installation params***
const adminAddress = ethers.utils.defaultAbiCoder.encode(
    ['address'],
    ["0x796f24671a61431851411864d8abd1cb9b3d60f6"]
);
const adminSetupParams = [DAO_ADDRESS, adminAddress];

// 1c. ***Prepare the installation***
const prepareInstallParams: PrepareInstallationParams = {
    daoAddressOrEns: DAO_ADDRESS,
    pluginRepo: adminRepoAddress,
    installationAbi: adminSetupAbiMetadata,
    installationParams: adminSetupParams,
};

log("Prepare Installation...");
// 1d. ***Call the prepareInstallation() on the SDK **
// This returns an async generator that will return the steps as they are completed
const prepareSteps =
    client.methods.prepareInstallation(prepareInstallParams);

// 1e. ***Iterate through the steps***
const prepareInstallStep1 = await (await prepareSteps.next()).value;
log("Transaction Hash: ", prepareInstallStep1.txHash);

const prepareInstallStep2 = await (await prepareSteps.next()).value;
log("Installation Data: ", prepareInstallStep2);

// this is already an object that has all the data we need to apply the installation. it also has the Key from the iterator but we dont need that
const installdata = prepareInstallStep2 satisfies ApplyInstallationParams;

// ==============================================================
// 2. Create Proposal to Apply install: Using the PluginSetupProcessor, use the SDK to get the set of actions and create a proposal
// https://github.com/aragon/osx/blob/a52bbae69f78e74d6a17647370ccfa2f2ea9bbf0/packages/contracts/src/framework/plugin/setup/PluginSetupProcessor.sol#L287-L288
// ==============================================================

// 2a. ***Encode the actions***
// Here we use the client to create the encoded actions. This creates 3 actions,
// [0] Grants the PSP permission to install,
// [1] Installs the plugin,
// [2] Removes the PSP permission to install
const daoActions: DaoAction[] = client.encoding.applyInstallationAction(
    DAO_ADDRESS,
    installdata,
);

// 2b. ***Pin the metadata***
const metadataUri: string = await tokenVotingClient.methods.pinMetadata({
    title: "Test metadata",
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

// 2c. ***Create the proposal***
// this returns an export generator that will create the proposal
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
