import { ethers } from 'ethers';

export async function getLogFromReceipt(
    receipt: ethers.providers.TransactionReceipt,
    iface: ethers.utils.Interface,
    topic: string
) {
    const eventTopic = iface.getEventTopic(topic);
    const txLog = receipt.logs.find((x) => x.topics.indexOf(eventTopic) >= 0);
    if (!txLog) throw new Error('Event not found in transaction receipt');

    return iface.parseLog(txLog).args;
}

export function hexToBytes(inputHexString: string): Uint8Array {
    let hexString = inputHexString;
    if (!hexString) return new Uint8Array();
    else if (!/^(0x)?[0-9a-fA-F]*$/.test(hexString)) {
        throw new Error('Invalid hex string');
    } else if (hexString.length % 2 !== 0) {
        throw new Error('The hex string has an odd length');
    }

    hexString = hexString.startsWith('0x') ? hexString.substring(2) : hexString;
    const bytes: number[] = [];
    for (let i = 0; i < hexString.length; i += 2) {
        bytes.push(parseInt(hexString.substring(i, i + 2), 16));
    }
    return Uint8Array.from(bytes);
}

export function getWallet() {
    const { PRIVATE_KEY, RPC_URL } = process.env;
    if (!PRIVATE_KEY || !RPC_URL) throw new Error('PRIVATE_KEY or RPC_URL not provided');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    return new ethers.Wallet(PRIVATE_KEY, provider);
}
