import {
    ChangeComplianceManagerTransaction,
    ChangeEnforcementManagerTransaction,
    ChangeSupplyManagerTransaction,
    Client,
    FreezeTransaction,
    SetKycPassedTransaction,
    UnfreezeTransaction,
    WipeTransaction,
} from "@stable-coin/sdk";
import { Ed25519PrivateKey } from "@hashgraph/sdk";
import { waitForConfirmation } from "./state";
import BigNumber from "bignumber.js";

const hederaStableCoinClient = new Client({
    hederaNetworkName: "testnet",
    hederaOperatorAccountNum: parseInt(`${process.env.VUE_APP_OPERATOR_ACCOUNT_NUM}`.replace("0.0.","")),
    paymentApiUrl: `${process.env.VUE_APP_HSC_PLATFORM}/hedera/transaction`,
});

export async function freeze(adminKey: string, address: string) {
    const key = Ed25519PrivateKey.fromString(adminKey);

    const tx = new FreezeTransaction().setAddress(address);

    // @ts-ignore
    await tx.executeWith(hederaStableCoinClient, key);

    await waitForConfirmation(tx.getTransactionId());
}

export async function unfreeze(adminKey: string, address: string) {
    const key = Ed25519PrivateKey.fromString(adminKey);

    const tx = new UnfreezeTransaction().setAddress(address);

    // @ts-ignore
    await tx.executeWith(hederaStableCoinClient, key);

    await waitForConfirmation(tx.getTransactionId());
}

export async function wipe(
    adminKey: string,
    address: string,
    amount: BigNumber
) {
    const key = Ed25519PrivateKey.fromString(adminKey);

    const tx = new WipeTransaction().setAddress(address).setAmount(amount);

    // @ts-ignore
    await tx.executeWith(hederaStableCoinClient, key);

    await waitForConfirmation(tx.getTransactionId());
}

export async function changeSupplyManager(
    adminKey: string,
    newAddress: string
) {
    const key = Ed25519PrivateKey.fromString(adminKey);

    const tx1 = new SetKycPassedTransaction().setAddress(newAddress);

    // @ts-ignore
    await tx1.executeWith(hederaStableCoinClient, key);
    await waitForConfirmation(tx1.getTransactionId());

    const tx2 = new ChangeSupplyManagerTransaction().setAddress(newAddress);

    // @ts-ignore
    await tx2.executeWith(hederaStableCoinClient, key);
    await waitForConfirmation(tx2.getTransactionId());
}

export async function changeComplianceManager(
    adminKey: string,
    newAddress: string
) {
    const key = Ed25519PrivateKey.fromString(adminKey);

    const tx1 = new SetKycPassedTransaction().setAddress(newAddress);

    // @ts-ignore
    await tx1.executeWith(hederaStableCoinClient, key);
    await waitForConfirmation(tx1.getTransactionId());

    const tx2 = new ChangeComplianceManagerTransaction().setAddress(newAddress);

    // @ts-ignore
    await tx2.executeWith(hederaStableCoinClient, key);
    await waitForConfirmation(tx2.getTransactionId());
}

export async function changeEnforcementManager(
    adminKey: string,
    newAddress: string
) {
    const key = Ed25519PrivateKey.fromString(adminKey);

    const tx1 = new SetKycPassedTransaction().setAddress(newAddress);

    // @ts-ignore
    await tx1.executeWith(hederaStableCoinClient, key);
    await waitForConfirmation(tx1.getTransactionId());

    const tx2 = new ChangeEnforcementManagerTransaction().setAddress(
        newAddress
    );

    // @ts-ignore
    await tx2.executeWith(hederaStableCoinClient, key);
    await waitForConfirmation(tx2.getTransactionId());
}
