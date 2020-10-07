import BigNumber from "bignumber.js";

export const availableNodes = JSON.parse((process.env.VUE_APP_APP_NET_NODES === undefined) ? '[{"address": "localhost:8080",}]' : process.env.VUE_APP_APP_NET_NODES);

export interface State {
    displayName: string | null;
    privateKey: string | null;
    balance: BigNumber;
    address: string | null;
    fiatBalance: BigNumber;
    network: string;
    isFrozen: boolean;
    isKycPassed: boolean;
    hederaStableCoinNode: string;
}

const maybePrivateKey = window.localStorage.getItem("stableCoinPrivateKey");

const maybeAddress = window.localStorage.getItem("stableCoinAddress");

export default {
    displayName: window.localStorage.getItem("stableCoinDisplayName"),
    address: maybeAddress,
    privateKey: maybePrivateKey,
    hederaStableCoinNode:
        availableNodes[Math.floor(Math.random() * 100) % availableNodes.length]
            .address,
    balance: new BigNumber(0),
    fiatBalance: new BigNumber(500),
    isFrozen: false,
    network: window.localStorage.getItem("stableCoinNetwork") ?? "hedera",
    isKycPassed: false,
} as State;
