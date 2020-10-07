import proto from "@stable-coin/proto";
import UnaryAddressTransaction from "./UnaryAddressTransaction";

export default class ProposeOwnerTransaction extends UnaryAddressTransaction<
    proto.IProposeOwnerTransactionData
> {
    protected _getDataCase(): keyof proto.ITransactionBody {
        return "proposeOwner";
    }

    protected _toData(): proto.IProposeOwnerTransactionData {
        return {
            address: this._address?.toBytes(),
        };
    }
}
