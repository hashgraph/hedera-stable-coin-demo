import proto from "@stable-coin/proto";
import UnaryAddressTransaction from "./UnaryAddressTransaction";

export default class SetKycPassedTransaction extends UnaryAddressTransaction<
    proto.ISetKycPassedTransactionData
> {
    protected _getDataCase(): keyof proto.ITransactionBody {
        return "setKycPassed";
    }

    protected _toData(): proto.ISetKycPassedTransactionData {
        return {
            address: this._address?.toBytes(),
        };
    }
}
