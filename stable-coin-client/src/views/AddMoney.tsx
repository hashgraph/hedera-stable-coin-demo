import { defineComponent, ref } from "vue";
import Header from "../components/Header";
import Button from "../components/Button";
import "./AddMoney.css";
import BigNumber from "bignumber.js";
import AppSpinner from "../components/AppSpinner";
import Balance from "../components/Balance";
import { CheckCircleOutline } from "mdue";
import * as hederaStableCoinPlatform from "../service/hedera-stable-coin-platform";
import { useRoute } from "vue-router";

export default defineComponent({
    name: "AddMoney",
    methods: {
        async handleSubmit() {
            this.busy = true;

            await hederaStableCoinPlatform.issue(
                this.$store.state.address!,
                this.$store.state.network,
                this.amount
            );

            this.$store.commit("reduceMyfiatBalance", this.amount);
            await this.$store.dispatch("fetchMe");

            this.busy = false;
            this.success = true;
        },

        handleDone() {
            this.$router.push({ name: "Home" });
        },
    },
    setup() {
        const busy = ref(false);
        const success = ref(false);
        const route = useRoute();
        const amount = new BigNumber(route.query.amount as string);

        return {
            busy,
            success,
            amount,
        };
    },
    render() {
        if (this.success) {
            return (
                <>
                    <div class="AddMoney-success">
                        <CheckCircleOutline class="AddMoney-successIcon" />
                        <div class="AddMoney-successMessage">
                            You added ${this.amount.toFixed(2)} to your
                            StableCoin balance
                        </div>
                    </div>
                    <Button onClick={this.handleDone}>Done</Button>
                </>
            );
        }

        let busyNode;

        if (this.busy) {
            busyNode = (
                <>
                    <div class="AddMoney-busyOverlay" />
                    <div class="AddMoney-busy">
                        <AppSpinner />
                    </div>
                </>
            );
        }

        return (
            <>
                <Header hasBack text="Add Money" />
                <div class="AddMoney">
                    <Balance class="AddMoney-balance" amount={this.amount} />
                    <div class="AddMoney-divider" />
                    <div class="AddMoney-partyContainer">
                        <div class="AddMoney-partyLabel">From</div>
                        <div class="AddMoney-partyMain">
                            <div class="AddMoney-partyName">Fiat Account</div>
                            <div class="AddMoney-available">
                                Available: $500.00
                            </div>
                        </div>
                    </div>
                    <div class="AddMoney-divider" />
                    <div class="AddMoney-partyContainer">
                        <div class="AddMoney-partyLabel">To</div>
                        <div class="AddMoney-partyMain">
                            <div class="AddMoney-partyName">StableCoin</div>
                            <div class="AddMoney-available">
                                Available: ${this.amount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div class="AddMoney-divider" />
                </div>
                <Button onClick={this.handleSubmit}>Add to your Balance</Button>
                {busyNode}
            </>
        );
    },
});
