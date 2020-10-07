import proto from "@stable-coin/proto";
import UnaryAddressTransaction from "./UnaryAddressTransaction";

export default class UnsetKycPassedTransaction extends UnaryAddressTransaction<
    proto.IUnsetKycPassedTransactionData
> {
    protected _getDataCase(): keyof proto.ITransactionBody {
        return "unsetKycPassed";
    }

    protected _toData(): proto.IUnsetKycPassedTransactionData {
        return {
            address: this._address?.toBytes(),
        };
    }
}
