import { defineComponent, ref } from "vue";
import Header from "../components/Header";
import Button from "../components/Button";
import BigNumber from "bignumber.js";
import AmountInput from "../components/AmountInput";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
    name: "SendEnterAmount",
    setup() {
        const router = useRouter();
        const route = useRoute();
        const amount = ref(new BigNumber(0));

        function handleNext() {
            void router.push({
                name: "SendConfirm",
                query: {
                    amount: amount.value.toString(),
                    ...route.query,
                },
            });
        }

        function handleAmountChange(value: BigNumber) {
            amount.value = value;
        }

        return {
            amount,
            handleAmountChange,
            handleNext,
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
