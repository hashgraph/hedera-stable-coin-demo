import { defineComponent, PropType } from "vue";
import "./TransactionItem.css";
import BigNumber from "bignumber.js";
import { TransferRight } from "mdue";
import NetworkIcon from "./NetworkIcon";
import { Account } from "../service/hedera-stable-coin-platform";

export default defineComponent({
    name: "TransactionItem",
    props: {
        kind: String,
        accounts: Object as PropType<Map<string, Account>>,
        consensusAt: { type: Date as PropType<Date> },
        caller: String,
        status: String,
        data: { type: Object, required: true },
    },
    setup(props) {
        let amount = new BigNumber(0);
        let fromNetwork = "hedera";
        let toNetwork = "hedera";
        let address = null;
        let to = null;

        switch (props.kind) {
            case "mint":
                amount = new BigNumber(props.data.value);
                break;

            case "wipe":
                amount = new BigNumber(props.data.value);
                address = props.data.address;
                break;

            case "transfer":
                amount = new BigNumber(props.data.value);
                to = props.data.to;
                address = props.caller;
                break;

            case "externalTransfer":
                amount = new BigNumber(props.data.value);
                to = props.data.to;
                address = props.data.from;
                toNetwork = props.data.network.split(":")[0];
                break;

            case "externalTransferFrom":
                amount = new BigNumber(props.data.value);
                to = props.data.to;
                address = props.data.from;
                fromNetwork = props.data.network.split(":")[0];
                break;

            case "setKycPassed":
            case "unsetKycPassed":
            case "unfreeze":
            case "freeze":
            case "proposeOwner":
            case "changeSupplyManager":
            case "changeComplianceManager":
            case "changeEnforcementManager":
                address = props.data.address;
                break;
        }

        return {
            amount: amount.dividedBy(100),
            address,
            fromNetwork,
            toNetwork,
            to,
        };
    },
    render() {
        let toDisplayName = "";
        let fromDisplayName = "";

        if (this.address) {
            let fromAccount = this.accounts?.get(this.address);

            if (fromAccount) {
                fromDisplayName = fromAccount?.displayName ?? "";
            } else if (this.address.endsWith("51a4c1")) {
                fromDisplayName = "Supply Manager";
            }
        }

        if (this.to) {
            let toAccount = this.accounts?.get(this.to);

            toDisplayName = toAccount?.displayName ?? "";
        }

        return (
            <div class="TransactionItem">
                <div class="TransactionItem-main">
                    <div class="TransactionItem-kind">{this.kind}</div>
                    {this.address != null ? (
                        <>
                            <div class="TransactionItem-address">
                                {fromDisplayName} …
                                {this.address.slice(this.address.length - 6)}
                            </div>
                            <NetworkIcon network={this.fromNetwork} />
                        </>
                    ) : null}
                    {this.to != null && this.address != null ? (
                        <TransferRight class="TransactionItem-transferIcon" />
                    ) : null}
                    {this.to != null ? (
                        <>
                            <div class="TransactionItem-address">
                                {toDisplayName} …
                                {this.to.slice(this.to.length - 6)}
                            </div>
                            <NetworkIcon network={this.toNetwork} />
                        </>
                    ) : null}
                </div>
                <div class="TransactionItem-consensus">
                    {this.consensusAt?.toLocaleString()}
                </div>
                <div class="TransactionItem-amount">
                    ${this.amount.toFixed(2)}
                </div>
            </div>
        );
    },
});
