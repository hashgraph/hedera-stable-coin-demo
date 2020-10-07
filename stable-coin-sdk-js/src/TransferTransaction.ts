import proto from "@stable-coin/proto";
import BigNumber from "bignumber.js";
import UnaryAddressTransaction from "./UnaryAddressTransaction";
import { encodeBigInteger } from "./encoding";

export default class TransferTransaction extends UnaryAddressTransaction<
    proto.ITransferTransactionData
> {
    private _value: BigNumber = new BigNumber(0);

    public setAmount(amount: BigNumber): this {
        this._value = amount;

        return this;
    }

    protected _getDataCase(): keyof proto.ITransactionBody {
        return "transfer";
    }

    protected _toData(): proto.ITransferTransactionData {
        return {
            value: encodeBigInteger(this._value),
            to: this._address?.toBytes(),
        };
    }
}
