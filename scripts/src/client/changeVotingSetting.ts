//class which initial with parentAddressOrEns, childAddressOrEns, subDaoPluginAddress
import {Client, MultisigClient, TokenVotingClient} from "../lib/sdk";
import {AllowedNetwork} from "../lib/constants";
import {DaoDetails} from "@aragon/sdk-client";
import {getVotingPluginAddress, iterateSteps, MULTISIG_PLUGIN_ID, TOKEN_VOTING_PLUGIN_ID} from "./installSubDAOPlugin";
import {DAOABI, getABIEntry, MULTISIGABI, queryABIEntry, SUBDAOADMINABI} from '../lib/abis'
import {getWallet, hexToBytes} from "../lib/helpers";
import {ethers} from "ethers";
import {DaoAction} from "@aragon/sdk-client-common";
import {toBytes} from "../../../subdao-plugin/utils/helpers";
export class ChangeVotingSettingClient {
    readonly parentAddressOrEns:string;
    readonly childAddressOrEns:string;
    readonly subDaoPluginAddress:string;
    readonly network: AllowedNetwork;
    readonly client:object;
    private initialized:boolean=false;
    parentDaoDetails:DaoDetails;
    childDaoDetails:DaoDetails;
    childContractAddress:string;
    parentContractAddress:string;
    parentVotingPluginContractAddress:any;
    parentVotingPluginType:any;
    childVotingPluginContractAddress:any;
    childVotingPluginType:any;
    parentVotingClient:object;


    constructor(parentAddressOrEns:string,childAddressOrEns:string,subDaoPluginAddress:string,network:AllowedNetwork) {
        //initial values
        this.parentAddressOrEns=parentAddressOrEns;
        this.childAddressOrEns=childAddressOrEns;
        this.subDaoPluginAddress=subDaoPluginAddress;
        this.network=network;
        this.client = Client(network);

    }

    async initial(){
        //get parent detail
        this.parentDaoDetails = await this.client.methods.getDao(this.parentAddressOrEns);
        if (!this.parentDaoDetails) throw new Error('DAO not found');
        //get child detail
        this.childDaoDetails = await this.client.methods.getDao(this.childAddressOrEns);
        if (!this.childDaoDetails) throw new Error('DAO not found');
        this.childContractAddress = this.childDaoDetails.address;
        this.parentContractAddress = this.parentDaoDetails.address;
        //parentVotingPluginType
        const { votingPluginAddress: parentVotingPluginContractAddress, votingPluginType: parentVotingPluginType } =
            getVotingPluginAddress(this.parentDaoDetails);
        this.parentVotingPluginContractAddress=parentVotingPluginContractAddress;
        this.parentVotingPluginType=parentVotingPluginType;
        //childVotingPluginType
        const { votingPluginAddress: childVotingPluginContractAddress, votingPluginType: childVotingPluginType } =
            getVotingPluginAddress(this.childDaoDetails);
        this.childVotingPluginContractAddress=childVotingPluginContractAddress;
        this.childVotingPluginType=childVotingPluginType;
        if (parentVotingPluginType=== TOKEN_VOTING_PLUGIN_ID){
            this.parentVotingClient = TokenVotingClient(this.network);
        }
        else if(parentVotingPluginType === MULTISIG_PLUGIN_ID){
            this.parentVotingClient = MultisigClient(this.network);
        }
        this.initialized=true;
    }

    private connectContract(deployer:ethers.Wallet,votingPluginAddress,contractABI){
        return new ethers.Contract(votingPluginAddress, contractABI, deployer);
    }
    private async isMemberMultisig(address:string){
        const deployer=getWallet();
        const multisigContract=this.connectContract(deployer,this.childVotingPluginContractAddress,MULTISIGABI);
        try {
            const result = await multisigContract["isMember"](address);
            console.log('Function result:', result);
            return result;
        } catch (error) {
            console.error('Error calling contract function:', error);
        }
    }

    private async checkIsAnyRepetetive(newapprovers:string[]){
        for (let approver of newapprovers) {
            let isMember=await this.isMemberMultisig(approver)
            if(isMember) throw new Error(`this new approver: ${approver} is already a member `);
        }

    }

    private async sendProposal(proposalMetadata,daoActions:DaoAction[]){

        const metadataUri: string = await this.parentVotingClient.methods.pinMetadata(proposalMetadata);
        const createProposalSteps=this.parentVotingClient.methods.createProposal({
            metadataUri,
            pluginAddress: this.parentVotingPluginContractAddress,
            actions: daoActions,
            approve: true,
            tryExecution: true,
            startDate: new Date(0), // Start immediately
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)), // uses minimum voting duration
        });
        await iterateSteps(createProposalSteps);

    }


    private encodedFunctionData(contractABI,functionFragment:string,values:ReadonlyArray<any>){
        const contractABIFormated=getABIEntry(contractABI);
        const contractInterface = new ethers.utils.Interface(contractABIFormated);
        console.log(values);
        return  contractInterface.encodeFunctionData(functionFragment, values);
    }

    async multisigAddAddresses(newapprovers:string[]){
        if (!this.initialized) throw new Error('This instance has not initialized yet, first call initial() method');
        if (newapprovers.length==0) throw new Error('There is not any approver to add');
        await this.checkIsAnyRepetetive(newapprovers);
        //porposal parent -> subdaoadminplugin -> childdao -> childvoting(multisig)
        const encodedFunctionDataMultisig=this.encodedFunctionData(MULTISIGABI,'addAddresses',[newapprovers])
        console.log(this.childVotingPluginContractAddress)
        const updateVotingSettingDaoAction: DaoAction[] = [
            {
                to: this.childVotingPluginContractAddress,
                value: BigInt(0),
                data: hexToBytes(encodedFunctionDataMultisig),
            },
        ];

        // const encodedFunctionDataChildDAO=this.encodedFunctionData(DAOABI,'execute',['0x0000000000000000000000000000000000000000000000000000000000000001',updateVotingSettingDaoAction,0])
        // console.log(encodedFunctionDataChildDAO)
        // const executeChildDDaoAction: DaoAction[] = [
        //     {
        //         to: this.childContractAddress,
        //         value: BigInt(0),
        //         data: hexToBytes(encodedFunctionDataChildDAO),
        //     },
        // ];
        const encodedFunctionDataSubDAOAdmin=this.encodedFunctionData(SUBDAOADMINABI,'execute',[updateVotingSettingDaoAction])
        console.log(encodedFunctionDataSubDAOAdmin)
        const executeSubDAOAdminDaoAction: DaoAction[] = [
            {
                to: this.subDaoPluginAddress,
                value: BigInt(0),
                data: hexToBytes(encodedFunctionDataSubDAOAdmin),
            },
        ];
        //TODO
        const proposalMetadata = {
            title: 'Add new members',
            summary: 'Granting parent DAO execution permission on child dao',
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
        await this.sendProposal(proposalMetadata,executeSubDAOAdminDaoAction);

    }


}

const changeVotingClient=new ChangeVotingSettingClient('parentdaotest.dao.eth','childmultisig3.dao.eth','0xFf8353c4a56B39824bDd2C6Eea4d25bCA03Dd5Ed','goerli')
await changeVotingClient.initial();
await changeVotingClient.multisigAddAddresses(['0x612A6506e7cdD093598D876d19c9e231737E72Be'])
