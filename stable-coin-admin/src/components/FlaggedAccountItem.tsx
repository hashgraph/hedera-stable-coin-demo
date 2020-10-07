import { defineComponent, ref } from "vue";
import BigNumber from "bignumber.js";
import { DotsHorizontal } from "mdue";
import * as hederaStableCoin from "../service/hedera-stable-coin/state";
import * as hederaStableCoinPlatform from "../service/hedera-stable-coin-platform";
import "./FlaggedAccountItem.css";
import Risk from "./Risk";
import ContextMenu from "./ContextMenu";
import * as hederaStableCoinContract from "../service/hedera-stable-coin/contract";
import { useStore } from "vuex";
import { State } from "../store/state";
import ModalConfirm from "./ModalConfirm";

export default defineComponent({
    name: "FlaggedAccountItem",
    props: {
        publicKey: { type: String, required: true },
        displayName: { type: String, required: true },
        risk: { type: Number, required: true },
        onDismiss: Function,
    },
    setup(props) {
        const balance = ref(new BigNumber(0));
        const freezeModalIsOpen = ref(false);
        const currentAdminKey = ref("");
        const store = useStore<State>();

        void hederaStableCoin.getBalanceOf(props.publicKey).then((balance_) => {
            balance.value = balance_;
        });

        function handleChangeCurrentAdminKey(value: string) {
            currentAdminKey.value = value;
        }

        function handleDismissFreeze() {
            freezeModalIsOpen.value = false;
        }

        async function handleFreeze() {
            freezeModalIsOpen.value = false;
            store.commit("setBusy", true);

            try {
                await hederaStableCoinContract.freeze(
                    currentAdminKey.value,
                    props.publicKey
                );

                await hederaStableCoinPlatform.dismissFlag(props.publicKey);

                props.onDismiss?.();
            } catch (e) {
                console.warn(e);
            } finally {
                store.commit("setBusy", false);
            }
        }

        async function handleContextMenu(choice: string) {
            switch (choice) {
                case "Freeze":
                    freezeModalIsOpen.value = true;
                    break;

                case "Dismiss":
                    await hederaStableCoinPlatform.dismissFlag(props.publicKey);
                    props.onDismiss?.();
                    break;
            }
        }

        return {
            balance,
            handleContextMenu,
            handleFreeze,
            handleDismissFreeze,
            handleChangeCurrentAdminKey,
            currentAdminKey,
            freezeModalIsOpen,
        };
    },
    render() {
        return (
            <div class="FlaggedAccountItem">
                <div class="FlaggedAccountItem-risk">
                    <Risk label value={this.risk} />
                </div>
                <div class="FlaggedAccountItem-main">
                    <div class="FlaggedAccountItem-displayName">
                        {this.displayName} …
                        {this.publicKey.slice(this.publicKey.length - 8)}
                    </div>
                    <div class="FlaggedAccountItem-balance">
                        ${this.balance.dividedBy(100).toFixed(2)}
                    </div>
                </div>
                <div class="FlaggedAccountItem-menu">
                    <ContextMenu
                        onSelect={this.handleContextMenu}
                        choices={["Freeze", "Dismiss"]}
                    >
                        <DotsHorizontal class="AccountItem-menuIcon" />
                    </ContextMenu>
                </div>
                <ModalConfirm
                    onChange={this.handleChangeCurrentAdminKey}
                    value={this.currentAdminKey}
                    isOpen={this.freezeModalIsOpen}
                    title={
                        "Are you sure you want to freeze " +
                        this.displayName +
                        "?"
                    }
                    confirmLabel="Enter Current Admin Private Key to Confirm"
                    submitText="Freeze"
                    onSubmit={this.handleFreeze}
                    onDismiss={this.handleDismissFreeze}
                />
            </div>
        );
    },
});
