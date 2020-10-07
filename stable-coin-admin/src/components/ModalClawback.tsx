import { defineComponent, PropType } from "vue";
import "./ModalClawback.css";
import ModalConfirm from "./ModalConfirm";
import BigNumber from "bignumber.js";

export default defineComponent({
    name: "ModalClawback",
    props: {
        isOpen: Boolean,
        balance: String,
        displayName: String,
        onSubmit: Function as PropType<
            (value: BigNumber, adminKey: string) => void
        >,
        onDismiss: Function as PropType<() => void>,
    },
    data() {
        return {
            currentAdminKey: "",
            amount: null as BigNumber | null,
        };
    },
    methods: {
        handleChangeCurrentAdminKey(value: string) {
            this.currentAdminKey = value;
        },

        handleFullBalance() {
            this.amount = new BigNumber(this.balance ?? "0");
        },

        handleInputAmount(event: Event) {
            const target = event.target as HTMLInputElement;
            const value = target.value.trim();

            if (!value.endsWith(".") && value.length > 0) {
                const newAmount = new BigNumber(value);

                if (!newAmount.isNaN()) {
                    this.amount = new BigNumber(value).decimalPlaces(2);
                }

                target.value = this.amount?.toString() ?? "";
            }
        },
    },
    render() {
        if (!this.isOpen) return null;

        return (
            <ModalConfirm
                onChange={this.handleChangeCurrentAdminKey}
                value={this.currentAdminKey}
                isOpen={this.isOpen}
                title={
                    "How much of " +
                    this.displayName +
                    "'s balance would you like to clawback?"
                }
                confirmLabel="Enter Current Admin Private Key to Confirm"
                submitText="Clawback"
                onSubmit={() =>
                    this.onSubmit?.(this.amount!, this.currentAdminKey)
                }
                onDismiss={this.onDismiss}
            >
                <div class="ModalClawback-balance">
                    Balance: ${this.balance}
                </div>
                <div
                    class="ModalClawback-fullBalance"
                    onClick={this.handleFullBalance}
                >
                    Clawback Full Amount
                </div>
                <label for="ModalClawback-amount" class="ModalConfirm-label">
                    Clawback Amount
                </label>
                <input
                    id="ModalClawback-amount"
                    class="ModalConfirm-input"
                    type="text"
                    value={this.amount?.toString()}
                    onInput={this.handleInputAmount}
                />
            </ModalConfirm>
        );
    },
});
