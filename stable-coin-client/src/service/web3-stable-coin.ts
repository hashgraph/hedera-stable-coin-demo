import { web3 } from "./web3";
import { Address } from "./hedera-stable-coin/state";
import { AbiItem } from "web3-utils";
import BigNumber from "bignumber.js";

const contractAddress = process.env.VUE_APP_ETH_CONTRACT_ADDRESS;

const contractABI: AbiItem[] = [
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "isKycPassed",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "isFrozen",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "transfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "networkURI",
                type: "string",
            },
            {
                internalType: "bytes",
                name: "externalAddress",
                type: "bytes",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "approveExternalTransfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];

const contractInstance = new web3.eth.Contract(contractABI, contractAddress);

export async function getAddress(address: string): Promise<Address> {
    const balanceResponse = await contractInstance.methods
        .balanceOf(address)
        .call();

    const isKycPassedResponse = await contractInstance.methods
        .isKycPassed(address)
        .call();

    const isFrozenResponse = await contractInstance.methods
        .isFrozen(address)
        .call();

    return {
        balance: new BigNumber(balanceResponse as string),
        isFrozen: isFrozenResponse as boolean,
        isKycPassed: isKycPassedResponse as boolean,
    };
}

export async function transferTo(
    address: string,
    amount: BigNumber
): Promise<void> {
    await contractInstance.methods.transfer(address, amount.toString()).send();
}

export async function externalTransferTo(
    fromPrivateKey: string,
    fromAddress: string,
    toAddress: string,
    toNetwork: string,
    amount: BigNumber
): Promise<void> {
    // const { topicId } = await import("./hedera-stable-coin/contract");

    // const nonce = await web3.eth.getTransactionCount(fromAddress);

    const gasPrice = await web3.eth.getGasPrice();

    const toAddressBytes = new TextEncoder().encode(toAddress);

    const txData = contractInstance.methods
        .approveExternalTransfer(toNetwork, toAddressBytes, amount.toString())
        .encodeABI();

    // debugger;

    const tx = await web3.eth.accounts.signTransaction(
        {
            to: contractAddress,
            data: txData,
            from: fromAddress,
            gasPrice,
            gas: "100000",
        },
        fromPrivateKey
    );

    console.log(tx.rawTransaction);

    const v = await web3.eth.sendSignedTransaction(tx.rawTransaction!);
    // });

    console.log(v);

    // .send({
    //     from: fromAddress,
    // });
}
