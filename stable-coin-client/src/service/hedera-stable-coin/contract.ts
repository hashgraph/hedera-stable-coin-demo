import {
    ApproveExternalTransferTransaction,
    Client,
    TransferTransaction,
} from "@stable-coin/sdk";
import { Ed25519PrivateKey } from "@hashgraph/sdk";
import BigNumber from "bignumber.js";

const hederaStableCoinClient = new Client({
    hederaNetworkName: "testnet",
    hederaOperatorAccountNum: parseInt(`${process.env.VUE_APP_OPERATOR_ACCOUNT_NUM}`.replace("0.0.","")),
    paymentApiUrl: `${process.env.VUE_APP_HSC_PLATFORM}/hedera/transaction`,
});

export async function transferTo(
    fromPrivateKey: string,
    toPublicKey: string,
    amount: BigNumber
): Promise<string> {
    const fromKey = Ed25519PrivateKey.fromString(fromPrivateKey);

    const tx = new TransferTransaction()
        .setAddress(toPublicKey)
        .setAmount(amount);

    await tx.executeWith(hederaStableCoinClient, fromKey);

    return tx.getTransactionId();
}

export async function externalTransferTo(
    fromPrivateKey: string,
    toPublicKey: string,
    toNetwork: string,
    amount: BigNumber
): Promise<string> {
    const fromKey = Ed25519PrivateKey.fromString(fromPrivateKey);

    const tx = await new ApproveExternalTransferTransaction()
        .setNetwork(toNetwork)
        .setTo(toPublicKey)
        .setAmount(amount);

    await tx.executeWith(hederaStableCoinClient, fromKey);

    return tx.getTransactionId();
}
