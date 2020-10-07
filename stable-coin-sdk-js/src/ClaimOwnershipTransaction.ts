import Transaction from "./Transaction";
import proto from "@stable-coin/proto";

export default class ClaimOwnershipTransaction extends Transaction<
    proto.IClaimOwnershipTransactionData
> {
    protected _getDataCase(): keyof proto.ITransactionBody {
        return "claimOwnership";
    }

    protected _toData(): proto.IClaimOwnershipTransactionData {
        return {};
    }
}
