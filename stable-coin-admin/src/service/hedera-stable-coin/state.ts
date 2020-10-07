import { Ed25519PublicKey as PublicKey } from "@hashgraph/sdk";
import BigNumber from "bignumber.js";
import store from "../../store";

// TODO: Move to configuration
const hederaStableCoinAddress = () =>
    "http://" + store.state.hederaStableCoinNode;

export interface Token {
    name: string;
    symbol: string;
    decimals: number;

    totalSupply: BigNumber;

    owner: PublicKey;
    complianceManager: PublicKey;
    supplyManager: PublicKey;
    // TODO: enforcementManager: PublicKey;
}

interface BalanceResponse {
    balance: string;
}

interface TokenResponse {
    name: string;
    symbol: string;
    decimals: number;

    totalSupply: string;

    owner: string;
    complianceManager: string;
    supplyManager: string;
    // TODO: enforcementManager: string;
}

export async function getToken(): Promise<Token> {
    const rawTokenInfo: TokenResponse = await (
        await fetch(await hederaStableCoinAddress())
    ).json();

    return {
        name: rawTokenInfo.name,
        symbol: rawTokenInfo.symbol,
        decimals: rawTokenInfo.decimals,
        totalSupply: new BigNumber(rawTokenInfo.totalSupply),
        owner: PublicKey.fromString(rawTokenInfo.owner),
        supplyManager: PublicKey.fromString(rawTokenInfo.supplyManager),
        complianceManager: PublicKey.fromString(rawTokenInfo.complianceManager),
    };
}

export interface AddressResponse {
    balance: string;
    isFrozen: boolean;
    isKycPassed: boolean;
}

export async function getAddress(
    address: PublicKey | string
): Promise<AddressResponse> {
    const addressAsString =
        typeof address === "string" ? address : address.toString(true);

    const url = `${await hederaStableCoinAddress()}/${addressAsString}`;
    const response: AddressResponse = await (await fetch(url)).json();

    return response;
}

export async function getBalanceOf(
    address: PublicKey | string
): Promise<BigNumber> {
    const addressAsString =
        typeof address === "string" ? address : address.toString(true);

    const url = `${await hederaStableCoinAddress()}/${addressAsString}/balance`;
    const response: BalanceResponse = await (await fetch(url)).json();

    return new BigNumber(response.balance);
}

export interface Transaction {
    consensusAt: Date;
    callerPublicKey: string;
    transaction: string;
    status: string;
    data: object;
}

interface TransactionResponse {
    transactions: TransactionResponseItem[];
}

interface TransactionResponseItem {
    consensusAt: string;
    caller: string;
    status: string;
    transaction: string;
    data: object;
}

export async function getAllTransactions(): Promise<Transaction[]> {
    const url = `${await hederaStableCoinAddress()}/transaction`;
    const response: TransactionResponse = await (await fetch(url)).json();

    return response.transactions.map((tx) => ({
        consensusAt: new Date(Date.parse(tx.consensusAt)),
        callerPublicKey: tx.caller,
        data: tx.data,
        status: tx.status,
        transaction: tx.transaction,
    }));
}

export async function waitForConfirmation(
    transactionId: string
): Promise<void> {
    const startAt = Date.now();
    const url = `${await hederaStableCoinAddress()}/transaction/${transactionId}/receipt`;

    while (true) {
        const response = await fetch(url);

        if (response.status === 404) {
            await new Promise((resolve) => setTimeout(resolve, 500));

            continue;
        }

        break;
    }

    const elapsed = Date.now() - startAt;
    console.log(`confirmed transaction '${transactionId}' in ${elapsed}ms`);
}
