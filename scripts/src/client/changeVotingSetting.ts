//class which initial with parentAddressOrEns, childAddressOrEns, subDaoPluginAddress
import {Client, MultisigClient, TokenVotingClient} from "../lib/sdk";
import {AllowedNetwork} from "../lib/constants";
import {DaoDetails} from "@aragon/sdk-client";
import {
    getVotingPluginAddress,
    installSubDaoPlugin,
    iterateSteps,
    MULTISIG_PLUGIN_ID,
    TOKEN_VOTING_PLUGIN_ID
} from "./installSubDAOPlugin";
import {
    DAOABI,
    getABIEntry,
    GovernanceERC20ABI,
    MULTISIGABI,
    queryABIEntry,
    SUBDAOADMINABI,
    TOKENVOTINGABI
} from '../lib/abis'
import {getWallet, hexToBytes} from "../lib/helpers";
import {ethers} from "ethers";
import {DaoAction} from "@aragon/sdk-client-common";
import {toBytes} from "../../../subdao-plugin/utils/helpers";
import { parse, ArgumentConfig } from 'ts-command-line-args';

const meta = import.meta as any;

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
    votingToken:string;


    constructor(parentAddressOrEns:string,childAddressOrEns:string,subDaoPluginAddress:string,network:AllowedNetwork) {
        //initial values
        this.parentAddressOrEns=parentAddressOrEns;
        this.childAddressOrEns=childAddressOrEns;
        this.subDaoPluginAddress=subDaoPluginAddress;
        this.network=network;
        this.client = Client(network);
        // console.log("constructor finished");

    }

    private async getVotingToken(){
        const deployer=getWallet();
        const Contract=this.connectContract(deployer,this.childVotingPluginContractAddress,TOKENVOTINGABI);
        try {
            const result = await Contract["getVotingToken"]();
            return result;
        } catch (error) {
            console.error('Error calling contract function:', error);
        }

    }

    async initial(){
        //get parent
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
        if(childVotingPluginType===TOKEN_VOTING_PLUGIN_ID){
            this.votingToken=await this.getVotingToken();
        }
        this.initialized=true;
        // console.log("initial finished");
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

    private async isMember(address:string,votingAbi:any){
        const deployer=getWallet();
        const Contract=this.connectContract(deployer,this.childVotingPluginContractAddress,votingAbi);
        try {
            const result = await Contract["isMember"](address);
            return result;
        } catch (error) {
            console.error('Error calling contract function:', error);
        }
    }

    private async checkIsAnyRepetetive(newApprovers:string[],votingAbi:any){
        for (let approver of newApprovers) {
            let isMember=await this.isMember(approver,votingAbi)
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
        return  contractInterface.encodeFunctionData(functionFragment, values);
    }

    async multisigAddAddresses(newApprovers:string[]){
        if (!this.initialized) throw new Error('This instance has not initialized yet, first call initial() method');
        if (newApprovers.length==0) throw new Error('There is not any approver to add');
        await this.checkIsAnyRepetetive(newApprovers,MULTISIGABI);
        //porposal parent -> subdaoadminplugin -> childvoting(multisig)
        const encodedFunctionDataMultisig=this.encodedFunctionData(MULTISIGABI,'addAddresses',[newApprovers])
        const updateVotingSettingDaoAction: DaoAction[] = [
            {
                to: this.childVotingPluginContractAddress,
                value: BigInt(0),
                data: hexToBytes(encodedFunctionDataMultisig),
            },
        ];

        const encodedFunctionDataSubDAOAdmin=this.encodedFunctionData(SUBDAOADMINABI,'execute',[updateVotingSettingDaoAction])
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
            summary: 'Add new member to the multisig',
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


    async checkAreAllMember(formerapprovers:string[],votingAbi:any){
        for (let approver of formerapprovers) {
            let isMember=await this.isMember(approver,votingAbi)
            if(!isMember) throw new Error(`this former approver: ${approver} is already not a member `);
        }
    }
    async multisigRemoveAddresses(formerapprovers:string[]){
        if (!this.initialized) throw new Error('This instance has not initialized yet, first call initial() method');
        if (formerapprovers.length==0) throw new Error('There is not any formerapprover to remove');
        await this.checkAreAllMember(formerapprovers,MULTISIGABI);
        //porposal parent -> subdaoadminplugin -> childvoting(multisig)
        const encodedFunctionDataMultisig=this.encodedFunctionData(MULTISIGABI,'removeAddresses',[formerapprovers])
        const updateVotingSettingDaoAction: DaoAction[] = [
            {
                to: this.childVotingPluginContractAddress,
                value: BigInt(0),
                data: hexToBytes(encodedFunctionDataMultisig),
            },
        ];

        const encodedFunctionDataSubDAOAdmin=this.encodedFunctionData(SUBDAOADMINABI,'execute',[updateVotingSettingDaoAction])
        const executeSubDAOAdminDaoAction: DaoAction[] = [
            {
                to: this.subDaoPluginAddress,
                value: BigInt(0),
                data: hexToBytes(encodedFunctionDataSubDAOAdmin),
            },
        ];
        //TODO
        const proposalMetadata = {
            title: 'Remove former members',
            summary: 'Remove some member of this multisig',
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

    async tokenVotingIncreaseAddressVotingPower(newApprovers:string[],amounts:number[]){
        if (!this.initialized) throw new Error('This instance has not initialized yet, first call initial() method');
        if (newApprovers.length==0) throw new Error('There is not any approver to add');
        if (newApprovers.length!=amounts.length) throw new Error('Length of newApprovers and howMuch must be equal ');
        // await this.checkIsAnyRepetetive(newApprovers,TOKENVOTINGABI);
        // parent porposal -> subdao plugin -> Token address
        const mintDaoAction: DaoAction[]=[]
        for (let indexOfApprovers in newApprovers){
            let encodedFunctionDataERC20=this.encodedFunctionData(GovernanceERC20ABI,'mint',[newApprovers[indexOfApprovers],amounts[indexOfApprovers]])
            let daoActionToken:DaoAction={
                to:this.votingToken,
                value:BigInt(0),
                data:hexToBytes(encodedFunctionDataERC20),
            };
            mintDaoAction.push(daoActionToken);
        }
        const encodedFunctionDataSubDAOAdmin=this.encodedFunctionData(SUBDAOADMINABI,'execute',[mintDaoAction])
        const executeSubDAOAdminDaoAction: DaoAction[] = [
            {
                to: this.subDaoPluginAddress,
                value: BigInt(0),
                data: hexToBytes(encodedFunctionDataSubDAOAdmin),
            },
        ];
        //TODO
        const proposalMetadata = {
            title: 'mint the token for ',
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
if (meta.main) {
    interface MyArgs {
        childDaoAddress: string;
        parentDaoAddress: string;
        network: string;
        subDaoPluginAddress:string;
        func:string;
        otherArgs: string[];
    }

    const config: ArgumentConfig<MyArgs> = {
        childDaoAddress: {
            type: String,
            alias: 'c',
            description: 'The child dao address or ENS',
        },
        parentDaoAddress: {
            type: String,
            alias: 'p',
            description: 'The parent dao address or ENS',
        },
        network: {
            type: String,
            alias: 'n',
            description: 'The network, can be one of [mainnet, goerli, polygon, mumbai, base, baseGoerli, local]',
        },
        subDaoPluginAddress:{
            type: String,
            alias: 's',
            description: 'The Subdao-plugin that installed on child dao address'
        },
        func:{
            type: String,
            alias: 'f',
            description: 'The function that you want do on subdao'
        },
        otherArgs: {
            type: String,
            multiple: true,
            defaultOption: true,
        },
    };
    const args = parse<MyArgs>(config);

    const childDAO = args.childDaoAddress;
    const parentDAO = args.parentDaoAddress;
    const network: AllowedNetwork = args.network as AllowedNetwork;
    const subAdminPlugin:string =  args.subDaoPluginAddress;
    const func:string=args.func;

    const changeVotingClient = new ChangeVotingSettingClient(parentDAO, childDAO, subAdminPlugin, network);
    await changeVotingClient.initial();
    switch (func) {
        case "multisigAddAddresses":
            if (args.otherArgs.length!=1) throw new Error('inputs is not compatible');
            let newaddresses: string[]=args.otherArgs[0].slice(1, -1).split(',');
            await changeVotingClient.multisigAddAddresses(newaddresses)
            break;
        case "multisigRemoveAddresses":
            if (args.otherArgs.length!=1) throw new Error('inputs is not compatible');
            let formeraddresses: string[] = args.otherArgs[0].slice(1, -1).split(',');
            await changeVotingClient.multisigRemoveAddresses(formeraddresses)
            break;
        case "tokenVotingIncreaseAddressVotingPower":
            if (args.otherArgs.length!=2) throw new Error('inputs is not compatible');
            let addresses: string[] = args.otherArgs[0].slice(1, -1).split(',');
            let amount:number[]=args.otherArgs[1].slice(1, -1).split(',').map(Number);
            await changeVotingClient.tokenVotingIncreaseAddressVotingPower(addresses,amount)
            break;
    }


// const changeVotingClient=new ChangeVotingSettingClient('parentdaotest.dao.eth','childmultisig3.dao.eth','0xFf8353c4a56B39824bDd2C6Eea4d25bCA03Dd5Ed','goerli')


// multisigAddAddresses
// await changeVotingClient.multisigAddAddresses(['0x612A6506e7cdD093598D876d19c9e231737E72Be'])
// bun changevotingsetting -c childmultisig3.dao.eth -p parentdaotest.dao.eth -n goerli -s 0xFf8353c4a56B39824bDd2C6Eea4d25bCA03Dd5Ed -f multisigAddAddresses '["0x612A6506e7cdD093598D876d19c9e231737E72Be"]'

// multisigRemoveAddresses
// await changeVotingClient.multisigRemoveAddresses(['0x612A6506e7cdD093598D876d19c9e231737E72Be']);
// bun changevotingsetting -c childmultisig3.dao.eth -p parentdaotest.dao.eth -n goerli -s 0xFf8353c4a56B39824bDd2C6Eea4d25bCA03Dd5Ed -f multisigRemoveAddresses '["0x612A6506e7cdD093598D876d19c9e231737E72Be"]'

// tokenVotingIncreaseAddressVotingPower
// await changeVotingClient.tokenVotingIncreaseAddressVotingPower(['0x612A6506e7cdD093598D876d19c9e231737E72Be'],[1])//
// bun changevotingsetting -c childdaotokenvoting.dao.eth -p parentdaotest.dao.eth -n goerli -s 0xFf8353c4a56B39824bDd2C6Eea4d25bCA03Dd5Ed -f tokenVotingIncreaseAddressVotingPower "['0x612A6506e7cdD093598D876d19c9e231737E72Be']" "[1]"
}