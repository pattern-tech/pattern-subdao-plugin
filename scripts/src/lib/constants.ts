export const networkRPC = {
    mainnet: 'https://rpc.ankr.com/eth',
    goerli: 'https://rpc.ankr.com/eth_goerli',
    polygon: 'https://rpc.ankr.com/polygon',
    mumbai: 'https://rpc.ankr.com/polygon_mumbai',
    base: 'https://rpc.ankr.com/base',
    baseGoerli: 'https://rpc.ankr.com/base_goerli',
    local: 'http://localhost:8545',
};

export const RepoAddress = {
    // mainnet: 'https://rpc.ankr.com/eth',
    goerli: '0x44B7C01C5101bb94B4fA9A7f72c42bcAA87979Ca',
    // polygon: 'https://rpc.ankr.com/polygon',
    // mumbai: 'https://rpc.ankr.com/polygon_mumbai',
    // base: 'https://rpc.ankr.com/base',
    // baseGoerli: 'https://rpc.ankr.com/base_goerli',
    // local: 'http://localhost:8545',
};

export type AllowedNetwork = keyof typeof networkRPC;
