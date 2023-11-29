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
    polygon: '0x927273f4a0f1eb268c6a11c63882a57ce404f1c0',
    polygonMumbai: '0x1a8A1fcF888bB053da7baeF3F4c1C8129987CeCc',
    // base: '0x00',
    // baseGoerli: '0x00',
    // local: '0x00',
};

export type AllowedNetwork = keyof typeof networkRPC;
