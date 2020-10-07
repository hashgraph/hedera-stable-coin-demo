import proto from "@stable-coin/proto";
import UnaryAddressTransaction from "./UnaryAddressTransaction";

export default class FreezeTransaction extends UnaryAddressTransaction<
    proto.IFreezeTransactionData
> {
    protected _getDataCase(): keyof proto.ITransactionBody {
        return "freeze";
    }

    protected _toData(): proto.IFreezeTransactionData {
        return {
            address: this._address?.toBytes(),
        };
    }
}
