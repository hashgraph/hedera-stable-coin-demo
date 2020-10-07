import { defineComponent } from "vue";
import Header from "../components/Header";
import Button from "../components/Button";
import BigNumber from "bignumber.js";
import AmountInput from "../components/AmountInput";

export default defineComponent({
    name: "EnterTheAmount",
    methods: {
        handleNext() {
            this.$router.push({
                name: "AddMoney",
                query: {
                    amount: this.amount.toString(),
                },
            });
        },

        handleAmountChange(value: BigNumber) {
            this.amount = value;
        },
    },
    data() {
        return {
            amount: new BigNumber(0),
        };
    },
    render() {
        return (
            <>
                <Header hasBack text="Enter the amount" />
                <AmountInput onChange={this.handleAmountChange} />
                <Button
                    onClick={this.handleNext}
                    disabled={this.amount.isZero()}
                >
                    Next
                </Button>
            </>
        );
    },
});
