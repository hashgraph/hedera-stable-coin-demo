import BigNumber from "bignumber.js";
import { waitForConfirmation } from "./hedera-stable-coin/state";

const hederaPlatformAddress = process.env.VUE_APP_HSC_PLATFORM;

export async function register(
    displayName: string,
    network: string,
    address: string
): Promise<void> {
    const url = `${hederaPlatformAddress}/${network}/user`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            displayName,
            address: address,
        }),
    });

    if (response.status != 200) {
        throw new Error(
            `unexpected response from platform: ${response.status}`
        );
    }

    if (network === "hedera") {
        const hederaTransactionId: string = (await response.json())
            .transactionId;

        // wait for the register transaction to be confirmedc
        await waitForConfirmation(hederaTransactionId);
    } else {
        // make eth wait 15s
        await new Promise((resolve) => setTimeout(resolve, 15000));
    }
}

export async function issue(
    address: string,
    network: string,
    amount: BigNumber
): Promise<void> {
    const url = `${hederaPlatformAddress}/${network}/issue`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            amount: amount.multipliedBy(100).integerValue().toString(),
            address: address,
        }),
    });

    if (response.status != 200) {
        throw new Error(
            `unexpected response from platform: ${response.status}`
        );
    }

    if (network === "hedera") {
        const hederaTransactionId: string = (await response.json())
            .transactionId;

        // wait for the register transaction to be confirmedc
        await waitForConfirmation(hederaTransactionId);
    } else {
        // make eth wait 15s
        await new Promise((resolve) => setTimeout(resolve, 15000));
    }
}

export interface Account {
    displayName: string;
    id: number;
    network: string;
    address: string;
}

export async function getAllAccounts(): Promise<Account[]> {
    return await (await fetch(hederaPlatformAddress + "/user")).json();
}
