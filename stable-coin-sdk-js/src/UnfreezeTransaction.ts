import proto from "@stable-coin/proto";
import UnaryAddressTransaction from "./UnaryAddressTransaction";

export default class UnfreezeTransaction extends UnaryAddressTransaction<
    proto.IUnfreezeTransactionData
> {
    protected _getDataCase(): keyof proto.ITransactionBody {
        return "unfreeze";
    }

    protected _toData(): proto.IUnfreezeTransactionData {
        return {
            address: this._address?.toBytes(),
        };
    }
}
