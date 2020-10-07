import { defineComponent, PropType } from "vue";
import "./AmountInput.css";
import BigNumber from "bignumber.js";

export default defineComponent({
    name: "AmountInput",
    props: {
        onChange: Function as PropType<(value: BigNumber) => void>,
    },
    methods: {
        handleAmountInput(event: Event) {
            const target = event.target! as HTMLInputElement;

            const amountText = target.value.replaceAll(/\D/g, "").slice(0, 6);

            const amountNum = new BigNumber(amountText).dividedBy(100);

            this.amount = "$" + amountNum.toFixed(2);
            this.onChange?.(amountNum);

            target.value = this.amount;
        },
    },
    data() {
        return {
            amount: "$0.00",
        };
    },
    render() {
        return (
            <div class="AmountInput">
                <input
                    class="AmountInput-input"
                    autofocus
                    value={this.amount}
                    onInput={this.handleAmountInput}
                />
                <div class="AmountInput-chip">StableCoin</div>
            </div>
        );
    },
});
