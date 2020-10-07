import proto from "@stable-coin/proto";
import Transaction from "./Transaction";
import BigNumber from "bignumber.js";
import { encodeBigInteger } from "./encoding";

export default class ApproveExternalTransferTransaction extends Transaction<
    proto.IApproveExternalTransferTransactionData
> {
    private _value: BigNumber = new BigNumber(0);

    protected _to?: string;

    protected _network?: string;

    public setAmount(amount: BigNumber): this {
        this._value = amount;

        return this;
    }

    public setTo(to: string): this {
        this._to = to;

        return this;
    }

    public setNetwork(network: string): this {
        this._network = network;

        return this;
    }

    protected _getDataCase(): keyof proto.ITransactionBody {
        return "approveExternalTransfer";
    }

    protected _toData(): proto.IApproveExternalTransferTransactionData {
        return {
            amount: encodeBigInteger(this._value),
            to: new TextEncoder().encode(this._to ?? ""),
            networkURI: this._network,
        };
    }
}
