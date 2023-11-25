import { Wallet } from "@ethersproject/wallet";
import {
    ContextParams,
    Client as Client_,
    Context as Context_,
    MultisigClient as MultisigClient_,
    TokenVotingClient as TokenVotingClient_,
    AddresslistVotingClient as AddresslistVotingClient_,
} from "@aragon/sdk-client";
import { AllowedNetwork, networkRPC } from "./constants";
import { activeContractsList } from "@aragon/osx-ethers";


const getContectParams = (network: AllowedNetwork): ContextParams => {
    const IPFS_API_KEY = process.env.IPFS_API_KEY
    const PRIVATE_KEY = process.env.PRIVATE_KEY

    if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not provided");
    if (!IPFS_API_KEY) throw new Error("IPFS_API_KEY not provided");


    const RPC_URL: string = networkRPC[network];
    if (!RPC_URL) throw new Error(`RPC_URL not found for network: ${network}`);


    return {
        network,
        signer: new Wallet(PRIVATE_KEY),
        daoFactoryAddress: activeContractsList[network]?.DAOFactory || "",
        web3Providers: [RPC_URL],
        ipfsNodes: [
            {
                url: "https://test.ipfs.aragon.network/api/v0",
                headers: { "X-API-KEY": IPFS_API_KEY || "" },
            },
        ],
        // Optional. By default it will use Aragon's provided endpoints.
        // They will switch depending on the network (production, development)
        graphqlNodes: [
            {
                url: "https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/version/v1.3.1/api",
            },
        ],
    }
}

export const Context = (network: AllowedNetwork) => new Context_(getContectParams(network));
export const Client = (network: AllowedNetwork) => new Client_(Context(network));
export const MultisigClient = (network: AllowedNetwork) => new MultisigClient_(Context(network));
export const TokenVotingClient = (network: AllowedNetwork) => new TokenVotingClient_(Context(network));
export const AddressListVotingClient = (network: AllowedNetwork) => new AddresslistVotingClient_(Context(network));
