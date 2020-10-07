import proto from "@stable-coin/proto";
import BigNumber from "bignumber.js";
import UnaryAddressTransaction from "./UnaryAddressTransaction";
import { encodeBigInteger } from "./encoding";

export default class WipeTransaction extends UnaryAddressTransaction<
    proto.IWipeTransactionData
> {
    private _value: BigNumber = new BigNumber(0);

    public setAmount(amount: BigNumber): this {
        this._value = amount;

        return this;
    }

    protected _getDataCase(): keyof proto.ITransactionBody {
        return "wipe";
    }

    protected _toData(): proto.IWipeTransactionData {
        return {
            value: encodeBigInteger(this._value),
            address: this._address?.toBytes(),
        };
    }
}
