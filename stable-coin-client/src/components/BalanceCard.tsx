import { defineComponent, PropType } from "vue";
import BigNumber from "bignumber.js";
import Balance from "./Balance";
import "./BalanceCard.css";

export default defineComponent({
    name: "BalanceCard",
    props: {
        onClick: Function as PropType<() => void>,
        isFrozen: Boolean,
        kind: { type: String, required: true },
        amount: { type: BigNumber, required: true },
    },
    render() {
        let frozenRow;

        if (this.isFrozen) {
            frozenRow = (
                <div class="BalanceCard-frozen">
                    Your StableCoin is currently frozen
                </div>
            );
        }

        return (
            <div class="BalanceCard" onClick={this.onClick}>
                {frozenRow}
                <div class="BalanceCard-main">
                    <div class="BalanceCard-title">{this.kind} balance</div>
                    <Balance amount={this.amount} />
                    <div class="BalanceCard-available">
                        Available in your {this.kind} account
                    </div>
                </div>
            </div>
        );
    },
});
