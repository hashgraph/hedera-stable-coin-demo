import proto from "@stable-coin/proto";
import UnaryAddressTransaction from "./UnaryAddressTransaction";

export default class ChangeEnforcementManagerTransaction extends UnaryAddressTransaction<
    proto.IChangeEnforcementManagerTransactionData
> {
    protected _getDataCase(): keyof proto.ITransactionBody {
        return "changeEnforcementManager";
    }

    protected _toData(): proto.IChangeEnforcementManagerTransactionData {
        return {
            address: this._address?.toBytes(),
        };
    }
}
