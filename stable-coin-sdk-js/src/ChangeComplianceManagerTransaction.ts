import proto from "@stable-coin/proto";
import UnaryAddressTransaction from "./UnaryAddressTransaction";

export default class ChangeComplianceManagerTransaction extends UnaryAddressTransaction<
    proto.IChangeComplianceManagerTransactionData
> {
    protected _getDataCase(): keyof proto.ITransactionBody {
        return "changeComplianceManager";
    }

    protected _toData(): proto.IChangeComplianceManagerTransactionData {
        return {
            address: this._address?.toBytes(),
        };
    }
}
