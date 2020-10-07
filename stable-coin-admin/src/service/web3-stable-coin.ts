import { web3 } from "./web3";
import { AddressResponse } from "./hedera-stable-coin/state";
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
        inputs: [],
        name: "totalSupply",
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
];

const contractInstance = new web3.eth.Contract(contractABI, contractAddress);

export async function getTotalSupply(): Promise<BigNumber> {
    const totalSupplyResponse = await contractInstance.methods
        .totalSupply()
        .call();

    return new BigNumber(totalSupplyResponse as string);
}

export async function getAddress(address: string): Promise<AddressResponse> {
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
        balance: balanceResponse as string,
        isFrozen: isFrozenResponse as boolean,
        isKycPassed: isKycPassedResponse as boolean,
    };
}
