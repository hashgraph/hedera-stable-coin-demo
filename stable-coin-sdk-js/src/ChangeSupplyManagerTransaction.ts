import proto from "@stable-coin/proto";
import UnaryAddressTransaction from "./UnaryAddressTransaction";

export default class ChangeSupplyManagerTransaction extends UnaryAddressTransaction<
    proto.IChangeSupplyManagerTransactionData
> {
    protected _getDataCase(): keyof proto.ITransactionBody {
        return "changeSupplyManager";
    }

    protected _toData(): proto.IChangeSupplyManagerTransactionData {
        return {
            address: this._address?.toBytes(),
        };
    }
}
