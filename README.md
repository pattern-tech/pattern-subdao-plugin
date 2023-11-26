# 🌟 Project Title: Pattern SubDAO Plugin

## 📜 Introduction
🔍 This plugin is designed to enable the creation of sub-DAOs within a parent DAO, effectively allowing one decentralized autonomous organization (DAO) to act as a sub-entity of another. It's built on the Aragon platform, leveraging its robust framework for DAO operations. This functionality is crucial for complex governance structures, enabling hierarchical management and modular organization of decentralized communities or projects.


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

## 📚 How to Use 
To understand how to interact with the contracts, navigate to the `./scripts/tests` directory. Here, you will find examples and tests for each of the following functionalities:

1. **Creating a DAO:**
   Find the test script that demonstrates how to create a new DAO. This script walks you through the process of initializing and deploying a DAO contract.

2. **Making a DAO SubDAO of Another DAO:**
   Explore the script that shows how to designate one DAO as a subdao of another. This is useful for establishing hierarchical governance structures.

3. **Add/Remove Approver from Multisig Plugin:**
   Look for the test that illustrates how to add or remove an approver from the multisig plugin. This is key for managing multisig permissions and governance.

4. **Add/Remove Approver from Token Voting Plugin:**
   Review the test that covers the addition or removal of an approver in the token voting plugin. This helps in adjusting the governance model based on token voting.

Each test script serves as a practical guide, providing real code examples for these operations. Make sure to read through these scripts to get a clear understanding of how to effectively use the Pattern SubDAO Plugin's contract functionalities.

