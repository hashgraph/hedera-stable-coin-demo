import BigNumber from "bignumber.js";
import store from "../../store";

const hederaStableCoinAddress = () =>
    "http://" + store.state.hederaStableCoinNode;

interface AddressResponse {
    balance: string;
    isFrozen: boolean;
    isKycPassed: boolean;
}

export interface Address {
    balance: BigNumber;
    isFrozen: boolean;
    isKycPassed: boolean;
}

export async function getAddress(address: string): Promise<Address> {
    const url = `${await hederaStableCoinAddress()}/${address}`;
    const response: AddressResponse = await (await fetch(url)).json();

    return {
        balance: new BigNumber(response.balance),
        isFrozen: response.isFrozen,
        isKycPassed: response.isKycPassed,
    };
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

export async function getTransactions(address: string): Promise<Transaction[]> {
    const url = `${await hederaStableCoinAddress()}/${address}/transaction`;
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
