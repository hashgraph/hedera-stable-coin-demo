import { defineComponent } from "vue";
import "./EditSettings.css";
import ModalConfirm from "../components/ModalConfirm";
import * as hederaStableCoin from "../service/hedera-stable-coin/contract";

const confirmModalTitlePrefix = "Are you sure you want to update the ";

export default defineComponent({
    name: "Settings",
    data() {
        return {
            newSupplyManagerAddress: "",
            newEnforcementManagerAddress: "",
            newComplianceManagerAddress: "",
            currentAdminKey: "",

            confirmModalIsOpen: false,
            confirmModalTitle: "",
            handleSubmit: undefined as (() => Promise<void>) | undefined,
        };
    },
    methods: {
        handleDismissChange() {
            this.confirmModalIsOpen = false;
        },

        handleChangeCurrentAdminKey(value: string) {
            this.currentAdminKey = value;
        },

        handleChangeSupplyManager() {
            this.confirmModalIsOpen = true;
            this.confirmModalTitle = `${confirmModalTitlePrefix}Supply Manager?`;
            this.handleSubmit = async () => {
                this.confirmModalIsOpen = false;
                this.$store.commit("setBusy", true);

                try {
                    await hederaStableCoin.changeSupplyManager(
                        this.currentAdminKey,
                        this.newSupplyManagerAddress
                    );
                } catch (e) {
                    console.warn(e);
                } finally {
                    this.newSupplyManagerAddress = "";
                    this.$store.commit("setBusy", false);
                }
            };
        },

        handleChangeComplianceManager() {
            this.confirmModalIsOpen = true;
            this.confirmModalTitle = `${confirmModalTitlePrefix}Compliance Manager?`;
            this.handleSubmit = async () => {
                this.confirmModalIsOpen = false;
                this.$store.commit("setBusy", true);

                try {
                    await hederaStableCoin.changeComplianceManager(
                        this.currentAdminKey,
                        this.newComplianceManagerAddress
                    );
                } catch (e) {
                    console.warn(e);
                } finally {
                    this.newComplianceManagerAddress = "";
                    this.$store.commit("setBusy", false);
                }
            };
        },

        handleChangeEnforcementManager() {
            this.confirmModalIsOpen = true;
            this.confirmModalTitle = `${confirmModalTitlePrefix}Enforcement Manager?`;
            this.handleSubmit = async () => {
                this.confirmModalIsOpen = false;
                this.$store.commit("setBusy", true);

                try {
                    await hederaStableCoin.changeEnforcementManager(
                        this.currentAdminKey,
                        this.newEnforcementManagerAddress
                    );
                } catch (e) {
                    console.warn(e);
                } finally {
                    this.newEnforcementManagerAddress = "";
                    this.$store.commit("setBusy", false);
                }
            };
        },
    },
    render() {
        return (
            <div class="Settings wrapper">
                <h1>Settings</h1>
                <label class="Settings-label" for="supplyManager">
                    Supply Manager
                </label>
                <div class="Settings-inputContainer">
                    <input
                        id="supplyManager"
                        class="Settings-input"
                        type="text"
                        placeholder="New public key"
                        v-model={this.newSupplyManagerAddress}
                    />
                    <button
                        type="button"
                        class="Settings-button"
                        onClick={this.handleChangeSupplyManager}
                    >
                        Update
                    </button>
                </div>
                <label class="Settings-label" for="complianceManager">
                    Compliance Manager
                </label>
                <div class="Settings-inputContainer">
                    <input
                        id="complianceManager"
                        class="Settings-input"
                        type="text"
                        placeholder="New public key"
                        v-model={this.newComplianceManagerAddress}
                    />
                    <button
                        type="button"
                        class="Settings-button"
                        onClick={this.handleChangeComplianceManager}
                    >
                        Update
                    </button>
                </div>
                <label class="Settings-label" for="enforcementManager">
                    Enforcement Manager
                </label>
                <div class="Settings-inputContainer">
                    <input
                        id="enforcementManager"
                        class="Settings-input"
                        type="text"
                        placeholder="New public key"
                        v-model={this.newEnforcementManagerAddress}
                    />
                    <button
                        type="button"
                        class="Settings-button"
                        onClick={this.handleChangeEnforcementManager}
                    >
                        Update
                    </button>
                </div>
                <ModalConfirm
                    onChange={this.handleChangeCurrentAdminKey}
                    value={this.currentAdminKey}
                    isOpen={this.confirmModalIsOpen}
                    title={this.confirmModalTitle}
                    confirmLabel="Enter Current Admin Private Key to Confirm"
                    submitText="Update"
                    onSubmit={this.handleSubmit}
                    onDismiss={this.handleDismissChange}
                />
            </div>
        );
    },
});
