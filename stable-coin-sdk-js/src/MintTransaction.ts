import Transaction from "./Transaction";
import proto from "@stable-coin/proto";
import BigNumber from "bignumber.js";
import { encodeBigInteger } from "./encoding";

export default class MintTransaction extends Transaction<
    proto.IMintTransactionData
> {
    private _value: BigNumber = new BigNumber(0);

    public setAmount(amount: BigNumber): this {
        this._value = amount;

        return this;
    }

    protected _getDataCase(): keyof proto.ITransactionBody {
        return "mint";
    }

    protected _toData(): proto.IMintTransactionData {
        return {
            value: encodeBigInteger(this._value),
        };
    }
}
