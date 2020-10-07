import { defineComponent } from "vue";
import BigNumber from "bignumber.js";
import "./Balance.css";

export default defineComponent({
    name: "Balance",
    props: {
        amount: { type: BigNumber, required: true }
    },
    render() {
        return (
            <div class="Balance">
                <div class="Balance-dollar">$</div>
                <div class="Balance-amount">
                    {this.amount.toFormat(2)}
                </div>
            </div>
        );
    }
});
