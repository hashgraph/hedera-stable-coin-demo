import { defineComponent, PropType } from "vue";
import "./TransactionItem.css";
import BigNumber from "bignumber.js";
import NetworkIcon from "./NetworkIcon";
import { Account } from "../service/hedera-stable-coin-platform";

export default defineComponent({
    name: "TransactionItem",
    props: {
        kind: String,
        accounts: Object as PropType<Map<string, Account>>,
        consensusAt: { type: Date as PropType<Date> },
        caller: String,
        transaction: String,
        status: String,
        data: { type: Object, required: true },
    },
    render() {
        let address = "";
        let amount = new BigNumber(0);
        let network = "hedera";
        let negative = false;
        let displayName = "StableCoin";

        switch (this.transaction) {
            case "transfer":
                amount = new BigNumber(this.data.value);
                address = `${this.data.to}`;
                if (this.$store.state.address == this.data.to) {
                    address = this.caller!;
                } else {
                    negative = true;
                    address = this.data.to;
                }
                break;

            case "wipe":
                amount = new BigNumber(this.data.value);
                address = this.caller!;
                negative = true;
                displayName = "Clawback";
                break;

            case "externalTransfer":
                amount = new BigNumber(this.data.value);
                address = `${this.data.to}`;
                negative = true;
                network = this.data.network.split(":")[0];
                break;

            case "externalTransferFrom":
                amount = new BigNumber(this.data.value);
                address = `${this.data.from}`;
                network = this.data.network.split(":")[0];
                break;
        }

        let addressAccount: Account | undefined;
        let addressImage: string | null = null;

        if (address != null) {
            addressAccount = this.accounts?.get(address);

            if (addressAccount != null) {
                displayName = addressAccount.displayName;
                addressImage = `https://avatars.dicebear.com/api/avataaars/${address}.svg`;
            }
        }

        return (
            <div class="TransactionItem">
                <div class="TransactionItem-icon">
                    {addressImage != null ? (
                        <img
                            class="TransactionItem-avatar"
                            src={addressImage}
                        />
                    ) : null}
                    <NetworkIcon
                        class="TransactionItem-networkIcon"
                        network={network}
                    />
                </div>
                <div class="TransactionItem-main">
                    <div class="TransactionItem-title">{displayName}</div>
                    <div class="TransactionItem-consensus">
                        {this.consensusAt?.toLocaleDateString()}
                    </div>
                    <div class="TransactionItem-description">
                        <div class="TransactionItem-address">
                            …{address.slice(address.length - 6)}
                        </div>
                    </div>
                </div>
                <div class={["TransactionItem-amount", { negative }]}>
                    {negative ? "- " : ""}${amount.dividedBy(100).toFixed(2)}
                </div>
            </div>
        );
    },
});
