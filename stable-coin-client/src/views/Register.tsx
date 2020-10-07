import { defineComponent, ref } from "vue";
import icon from "../assets/icon.svg";
import Button from "../components/Button";
import "./Register.css";
import HederaIcon from "../components/HederaIcon";
import EthereumIcon from "../components/EthereumIcon";
import { useStore } from "vuex";
import { State } from "../store/state";
import { useRouter } from "vue-router";
import { Ed25519PrivateKey } from "@hashgraph/sdk";
import { web3 } from "../service/web3";
import * as hederaStableCoinPlatform from "../service/hedera-stable-coin-platform";
import AppSpinner from "../components/AppSpinner";

export default defineComponent({
    name: "Home",
    setup() {
        const displayName = ref("");
        const network = ref("hedera");
        const isBusy = ref(false);
        const router = useRouter();
        const store = useStore<State>();
        const ethereumContractAddress = process.env.VUE_APP_ETH_CONTRACT_ADDRESS;

        function handleChangeNetwork(network_: string) {
            network.value = network_;
        }

        async function handleRegister() {
            isBusy.value = true;

            store.commit("setNetwork", network.value);
            store.commit("setDisplayName", displayName.value);

            let newPrivateKey;
            let newAddress;
            const networkName = store.state.network;

            if (networkName === "hedera") {
                const key = await Ed25519PrivateKey.generate();

                newPrivateKey = key.toString(true);
                newAddress = key.publicKey.toString(true);
            } else if (networkName === "ethereum") {
                const key = web3.eth.accounts.create();

                newPrivateKey = key.privateKey;
                newAddress = key.address;
            } else {
                throw new Error("unexpected network: " + networkName);
            }

            await hederaStableCoinPlatform.register(
                store.state.displayName!,
                store.state.network,
                newAddress
            );

            store.commit("setIdentity", {
                privateKey: newPrivateKey,
                address: newAddress,
            });

            isBusy.value = false;
            await router.push({ name: "Home" });
        }

        return {
            isBusy,
            displayName,
            network,
            ethereumContractAddress,
            handleChangeNetwork,
            handleRegister,
        };
    },
    render() {
        let busyNode;

        if (this.isBusy) {
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
                <div class="Register">
                    <img
                        class="Register-topLogo"
                        alt=""
                        src={icon}
                        height={34}
                    />
                    <input
                        class="Register-input"
                        type="text"
                        name="name"
                        v-model={this.displayName}
                        placeholder="Display Name"
                    />
                    <div class="Register-networkOptionsLabel">Network</div>
                    <div class="Register-networkOptions">
                        <div
                            class={[
                                "Register-networkOption",
                                { active: this.network === "hedera" },
                            ]}
                            onClick={() => this.handleChangeNetwork("hedera")}
                        >
                            <div class="Register-networkOptionCircle" />
                            <div class="Register-networkOptionLabel">
                                Hedera
                            </div>
                            <HederaIcon />
                        </div>
                        { this.ethereumContractAddress &&
                                <div
                                    class={[
                                        "Register-networkOption",
                                        {active: this.network === "ethereum"},
                                    ]}
                                    onClick={() => this.handleChangeNetwork("ethereum")}
                                >
                                <div class="Register-networkOptionCircle"/>
                                <div class="Register-networkOptionLabel">
                                    Ethereum
                                </div>
                                <EthereumIcon/>
                            </div>
                        }
                    </div>
                </div>
                <Button onClick={this.handleRegister}>Register</Button>
                {busyNode}
            </>
        );
    },
});
