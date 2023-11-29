# 🌟 Project Title: Pattern SubDAO Plugin


## 📜 Introduction
🔍 This plugin is designed to enable the creation of sub-DAOs within a parent DAO, effectively allowing one decentralized autonomous organization (DAO) to act as a sub-entity of another. It's built on the Aragon platform, leveraging its robust framework for DAO operations. This functionality is crucial for complex governance structures, enabling hierarchical management and modular organization of decentralized communities or projects.

🎥 **Watch our tiny Demo Here:** [Watch the Demo](https://www.youtube.com/watch?v=BYl0o2nzeVU)


## 🚀 Features
🔥 The Pattern SubDAO Plugin offers a range of functionalities tailored for efficient DAO management and integration. Key features include:
- **Create New DAO:** Facilitates the creation of new DAOs .
- **SubDAO Integration:** Enables one DAO to become a subdao of another.
- **Compatibility with Plugins:** Works in conjunction with both the official token voting plugin and the multisig plugin.
- **Plugin Settings Management:** Allows for the update and management of settings in the mentioned plugins.
- **Integration Tests as Examples:** Comes with integration tests that not only ensure reliability but also serve as practical examples for developers during coding.



## ⚙️ Installation
👣 Follow these steps to install and set up the Pattern SubDAO Plugin:

1. **Navigate to the Scripts Directory:**
   Change your current directory to `./scripts` in your terminal.
   ```bash
   cd ./scripts
   ```
2. **Environment Setup:**
   Rename the `.env.example` file to `.env` and update it with your specific details.
   ```bash
   mv .env.example .env
   # Edit the .env file with your detail
   ```
3. **Install Dependencies:**
   Use `bun` to install necessary dependencies.
   ```bash
   bun install
   ```
4. **Run Plugin Installation:**
   Execute the plugin installation command with the required parameters.
   ```bash
   bun plugininstall -n [NETWORK] -c [CHILD_DAO_ADDRESS_OR_ENS] -p [PARENT_DAO_ADDRESS_OR_ENS]
   ```
   Replace `[NETWORK]`, `[CHILD_DAO_ADDRESS_OR_ENS]`, and `[PARENT_DAO_ADDRESS_OR_ENS]` with the appropriate values for your setup.
   The pluginRepo has already been registered on Goerli, Mumbai and Polygon networks and you can use these network without any additonal steps.
   | Network        | Plugin Repo Address                              |
   |----------------|--------------------------------------------------|
   | goerli         | `0x44B7C01C5101bb94B4fA9A7f72c42bcAA87979Ca`       |
   | polygon        | `0x927273f4a0f1eb268c6a11c63882a57ce404f1c0`       |
   | polygonMumbai  | `0x1a8A1fcF888bB053da7baeF3F4c1C8129987CeCc`       |

   To use the contract on other networks take the following steps:
   1. **Navigate to the subdao-plugin directory**
   2. **Run `yarn install`**
   3. **Rename `.env.example` to `.env`**
   4. **Update the `.env` file with your credentials**
   5. **Add hardhat config per your need**
   6. **Add your plugin repo and rpc details to `/src/lib/constants.ts`**  
   7. **Run `yarn deploy --network [NETWORK_NAME]`**  


## 📚 How to Use 

1. **Creating a DAO:**
   Find the test script that demonstrates how to create a new DAO or simply create your DAO through Aragon interface. 

2. **Making a DAO SubDAO of Another DAO:**
   Run plugininstallation as mentioned in the Installation section. 

3. **Add Approver to Multisig Plugin:**
    ```bash
   bun changevotingsetting -c [CHILD_DAO_ADDRESS_OR_ENS] -p [PARENT_DAO_ADDRESS_OR_ENS] -n [NETWORK] -s [SUB_DAO_PLUGIN_ADDRESS] -f multisigAddAddresses '["NEW_MEMBER_ADDRESS_1","NEW_MEMBER_ADDRESS_2,...]'
   ```
4. **Remove Approvers from Multisig Plugin:**
   ```bash
   bun changevotingsetting -c [CHILD_DAO_ADDRESS_OR_ENS] -p [PARENT_DAO_ADDRESS_OR_ENS] -n [NETWORK] -s [SUB_DAO_PLUGIN_ADDRESS] -f multisigRemoveAddresses '[NEW_MEMBER_ADDRESS_1,NEW_MEMBER_ADDRESS_2,...]'
   ```
   Replace `[NETWORK]`, `[CHILD_DAO_ADDRESS_OR_ENS]`, `[PARENT_DAO_ADDRESS_OR_ENS]`, `[SUB_DAO_PLUGIN_ADDRESS]` and `NEW_MEMBER_ADDRESS_$` with the appropriate values for your setup.

4. **Add Approver to Token Voting Plugin:**
    ```bash
   bun changevotingsetting -c [CHILD_DAO_ADDRESS_OR_ENS] -p [PARENT_DAO_ADDRESS_OR_ENS] -n [NETWORK] -s [SUB_DAO_PLUGIN_ADDRESS] -f tokenVotingIncreaseAddressVotingPower '[NEW_MEMBER_ADDRESS_1,NEW_MEMBER_ADDRESS_2,...]' '[AMOUNT_1, AMOUNT_2,...]'
   ```
   Replace `[NETWORK]`, `[CHILD_DAO_ADDRESS_OR_ENS]`, `[PARENT_DAO_ADDRESS_OR_ENS]`, `[SUB_DAO_PLUGIN_ADDRESS]`, `NEW_MEMBER_ADDRESS_$` and `AMOUNT_$` with the appropriate values for your setup.

To understand how to interact with the contracts, navigate to the `./scripts/tests` directory. Each test script serves as a practical guide, providing real code examples for these operations. Make sure to read through these scripts to get a clear understanding of how to effectively use the Pattern SubDAO Plugin's contract functionalities.

