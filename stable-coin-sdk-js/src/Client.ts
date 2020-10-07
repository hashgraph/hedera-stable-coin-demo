import { Client as HederaClient } from "@hashgraph/sdk";

export interface Configuration {
    // url for the payment API
    paymentApiUrl: string;

    // hedera operator ID for the client
    hederaOperatorAccountNum: number;

    // network name for the client
    hederaNetworkName: "mainnet" | "testnet" | "previewnet";
}

export default class Client {
    _paymentApiUrl: string;

    _hederaOperatorAccountNum: number;

    _hederaClient: HederaClient;

    constructor(config: Configuration) {
        this._paymentApiUrl = config.paymentApiUrl;
        this._hederaOperatorAccountNum = config.hederaOperatorAccountNum;

        switch (config.hederaNetworkName) {
            case "mainnet":
                this._hederaClient = HederaClient.forMainnet();
                break;

            case "testnet":
                this._hederaClient = HederaClient.forTestnet();
                break;

            case "previewnet":
                this._hederaClient = HederaClient.forPreviewnet();
                break;
        }
    }
}
