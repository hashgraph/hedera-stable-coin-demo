import { computed, defineComponent, ref } from "vue";
import Header from "../components/Header";
import Button from "../components/Button";
import BigNumber from "bignumber.js";
import AppSpinner from "../components/AppSpinner";
import Balance from "../components/Balance";
import { CheckCircleOutline } from "mdue";
import * as hederaStableCoin from "../service/hedera-stable-coin/contract";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import * as ethStableCoin from "../service/web3-stable-coin";
import { State } from "../store/state";
import { waitForConfirmation } from "../service/hedera-stable-coin/state";

export default defineComponent({
    name: "SendConfirm",
    setup() {
        const busy = ref(false);
        const success = ref(false);
        const route = useRoute();
        const router = useRouter();
        const store = useStore<State>();
        const amount = new BigNumber(route.query.amount as string);
        const toName = route.query.toName;
        const toPublicKey = route.query.toPublicKey;
        const toNetwork = route.query.toNetwork as string;

        async function handleSubmit() {
            busy.value = true;

            // TODO: ethereum --> ethereum

            if (
                toNetwork.startsWith(store.state.network) &&
                store.state.network === "hedera"
            ) {
                // hedera --> hedera
                const transactionId = await hederaStableCoin.transferTo(
                    store.state.privateKey!,
                    toPublicKey as string,
                    amount.multipliedBy(100).integerValue()
                );

                await waitForConfirmation(transactionId);
            } else if (
                store.state.network === "ethereum" &&
                toNetwork.startsWith("hedera:")
            ) {
                // ethereum --> hedera
                console.log(
                    "initiate stable coin transfer from ethereum to hedera"
                );

                await ethStableCoin.externalTransferTo(
                    store.state.privateKey!,
                    store.state.address!,
                    toPublicKey as string,
                    toNetwork,
                    amount.multipliedBy(100).integerValue()
                );

                // wait for 15s to let the network settle
                await new Promise((resolve) => setTimeout(resolve, 15000));
            } else if (
                store.state.network === "hedera" &&
                toNetwork.startsWith("ethereum:")
            ) {
                // hedera --> ethereum
                console.log(
                    "initiate stable coin transfer from hedera to ethereum"
                );

                const transactionId = await hederaStableCoin.externalTransferTo(
                    store.state.privateKey!,
                    toPublicKey as string,
                    toNetwork,
                    amount.multipliedBy(100).integerValue()
                );

                await waitForConfirmation(transactionId);
            }

            await store.dispatch("fetchMe");

            busy.value = false;
            success.value = true;
        }

        function handleDone() {
            void router.push({ name: "Home" });
        }

        return {
            busy,
            myBalance: computed(() => store.state.balance),
            toPublicKey,
            toName,
            success,
            amount,
            handleDone,
            handleSubmit,
        };
    },
    render() {
        if (this.success) {
            return (
                <>
                    <div class="AddMoney-success">
                        <CheckCircleOutline class="AddMoney-successIcon" />
                        <div class="AddMoney-successMessage">
                            You sent ${this.amount.toFixed(2)} to {this.toName}
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
                <Header hasBack text="Send StableCoin" />
                <div class="AddMoney">
                    <Balance class="AddMoney-balance" amount={this.amount} />
                    <div class="AddMoney-divider" />
                    <div class="AddMoney-partyContainer">
                        <div class="AddMoney-partyLabel">From</div>
                        <div class="AddMoney-partyMain">
                            <div class="AddMoney-partyName">Me</div>
                            <div class="AddMoney-available">
                                Available: ${this.myBalance.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div class="AddMoney-divider" />
                    <div class="AddMoney-partyContainer">
                        <div class="AddMoney-partyLabel">To</div>
                        <div class="AddMoney-partyMain">
                            <div class="AddMoney-partyName">{this.toName}</div>
                            <div class="AddMoney-available">
                                …
                                {this.toPublicKey?.slice(
                                    this.toPublicKey?.length - 16
                                )}
                            </div>
                        </div>
                    </div>
                    <div class="AddMoney-divider" />
                </div>
                <Button onClick={this.handleSubmit}>Send StableCoin</Button>
                {busyNode}
            </>
        );
    },
});
