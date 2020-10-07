import { defineComponent, onUnmounted, ref } from "vue";
import BigNumber from "bignumber.js";
import { Circle, DotsHorizontal, Lock } from "mdue";
import * as hederaStableCoinState from "../service/hedera-stable-coin/state";
import * as ethStableCoinState from "../service/web3-stable-coin";
import * as hederaStableCoinContract from "../service/hedera-stable-coin/contract";
import "./AccountItem.css";
import Risk from "./Risk";
import ContextMenu from "./ContextMenu";
import ModalConfirm from "./ModalConfirm";
import { State } from "../store/state";
import { useStore } from "vuex";
import HederaIcon from "./HederaIcon";
import EthereumIcon from "./EthereumIcon";
import ModalClawback from "./ModalClawback";

export default defineComponent({
    name: "AccountItem",
    props: {
        address: { type: String, required: true },
        displayName: String,
        network: { type: String, required: true },
        risk: Number,
    },
    setup(props) {
        const balance = ref(new BigNumber(0));
        const contextMenuIsOpen = ref(false);
        const freezeModalIsOpen = ref(false);
        const clawbackModalIsOpen = ref(false);
        const unfreezeModalIsOpen = ref(false);
        const currentAdminKey = ref("");
        const store = useStore<State>();
        const isFrozen = ref(false);

        function fetch() {
            if (props.network.startsWith("hedera:")) {
                void hederaStableCoinState
                    .getAddress(props.address)
                    .then((address) => {
                        balance.value = new BigNumber(
                            address.balance
                        ).dividedBy(100);
                        isFrozen.value = address.isFrozen;
                    });
            } else {
                void ethStableCoinState
                    .getAddress(props.address)
                    .then((address) => {
                        balance.value = new BigNumber(
                            address.balance
                        ).dividedBy(100);

                        isFrozen.value = address.isFrozen;
                    });
            }
        }

        function handleChangeCurrentAdminKey(value: string) {
            currentAdminKey.value = value;
        }

        function handleDismissFreeze() {
            freezeModalIsOpen.value = false;
        }

        function handleDismissClawback() {
            clawbackModalIsOpen.value = false;
        }

        async function handleFreeze() {
            freezeModalIsOpen.value = false;
            store.commit("setBusy", true);

            try {
                await hederaStableCoinContract.freeze(
                    currentAdminKey.value,
                    props.address
                );
            } catch (e) {
                console.warn(e);
            } finally {
                store.commit("setBusy", false);
            }
        }

        function handleDismissUnfreeze() {
            unfreezeModalIsOpen.value = false;
        }

        async function handleUnfreeze() {
            unfreezeModalIsOpen.value = false;
            store.commit("setBusy", true);

            try {
                await hederaStableCoinContract.unfreeze(
                    currentAdminKey.value,
                    props.address
                );
            } catch (e) {
                console.warn(e);
            } finally {
                store.commit("setBusy", false);
            }
        }

        async function handleClawback(
            clawbackAmount: BigNumber,
            adminKey: string
        ) {
            clawbackModalIsOpen.value = false;
            store.commit("setBusy", true);

            try {
                await hederaStableCoinContract.wipe(
                    adminKey,
                    props.address,
                    clawbackAmount.multipliedBy(100)
                );
            } catch (e) {
                console.warn(e);
            } finally {
                store.commit("setBusy", false);
            }
        }

        function handleContextMenu(choice: string) {
            switch (choice) {
                case "Freeze":
                    freezeModalIsOpen.value = true;
                    break;

                case "Unfreeze":
                    unfreezeModalIsOpen.value = true;
                    break;

                case "Clawback":
                    clawbackModalIsOpen.value = true;
                    break;
            }
        }

        fetch();

        const intervalToken = setInterval(fetch, 2500);

        onUnmounted(() => {
            clearInterval(intervalToken);
        });

        return {
            balance,
            currentAdminKey,
            freezeModalIsOpen,
            unfreezeModalIsOpen,
            clawbackModalIsOpen,
            isFrozen,
            contextMenuIsOpen,
            handleFreeze,
            handleUnfreeze,
            handleContextMenu,
            handleDismissClawback,
            handleClawback,
            handleChangeCurrentAdminKey,
            handleDismissFreeze,
            handleDismissUnfreeze,
        };
    },
    render() {
        let statusIcon;
        const contextChoices = ["Clawback"];

        if (this.isFrozen) {
            statusIcon = <Lock class="AccountItem-statusIcon frozen" />;
            contextChoices.push("Unfreeze");
        } else {
            statusIcon = <Circle class="AccountItem-statusIcon" />;
            contextChoices.push("Freeze");
        }

        let networkIcon;
        let risk = this.risk;

        if (this.network.startsWith("hedera:")) {
            networkIcon = <HederaIcon />;
        } else if (this.network.startsWith("ethereum:")) {
            networkIcon = <EthereumIcon />;
            risk = 0;
        }

        const zero = this.balance.isLessThanOrEqualTo(0);

        return (
            <div class="AccountItem">
                <div class="AccountItem-risk">
                    <Risk label={false} value={risk} />
                </div>
                <div class="AccountItem-displayName">
                    {this.displayName} …
                    {this.address.slice(this.address.length - 6)}
                    <div class="AccountItem-networkIcon">{networkIcon}</div>
                </div>
                <div class={["AccountItem-balance", { zero }]}>
                    ${this.balance.toFixed(2)}
                </div>
                <div class="AccountItem-status">{statusIcon}</div>
                <div class="AccountItem-menu">
                    <ContextMenu
                        onSelect={this.handleContextMenu}
                        choices={contextChoices}
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
                <ModalConfirm
                    onChange={this.handleChangeCurrentAdminKey}
                    value={this.currentAdminKey}
                    isOpen={this.unfreezeModalIsOpen}
                    title={
                        "Are you sure you want to unfreeze " +
                        this.displayName +
                        "?"
                    }
                    confirmLabel="Enter Current Admin Private Key to Confirm"
                    submitText="Unfreeze"
                    onSubmit={this.handleUnfreeze}
                    onDismiss={this.handleDismissUnfreeze}
                />
                <ModalClawback
                    balance={this.balance.toFixed(2)}
                    isOpen={this.clawbackModalIsOpen}
                    displayName={this.displayName}
                    onSubmit={this.handleClawback}
                    onDismiss={this.handleDismissClawback}
                />
            </div>
        );
    },
});
