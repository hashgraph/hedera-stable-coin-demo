import { computed, defineComponent } from "vue";
import "./Network.css";
import worldMap from "../assets/img_world_map.svg";
import Metric from "../components/Metric";
import { availableNodes, State } from "../store/state";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
    name: "Network",
    setup() {
        const router = useRouter();
        const store = useStore<State>();

        function handleSwitchNetwork(address: string) {
            void store.commit("setNetwork", address);
            void router.replace({
                name: "Network",
                query: {
                    address,
                },
            });
        }

        return {
            handleSwitchNetwork,
            currentNetwork: computed(() => store.state.hederaStableCoinNode),
        };
    },
    render() {
        return (
            <div class="Network wrapper">
                <h1>Network</h1>
                <div class="Network-metrics">
                    <Metric
                        label="Nodes"
                        amount={availableNodes.length.toString()}
                    />
                    <Metric label="TPS (avg)" amount={"0"} />
                    {/*<Metric label="Latency (sec)" amount={"8"} />*/}
                    <Metric label="Status" amount={"Up"} />
                </div>
                <div class="Network-main">
                    <div class="Network-select">
                        {availableNodes.map((node: { address: string; name: any; }) => (
                            <div
                                onClick={() =>
                                    this.handleSwitchNetwork(node.address)
                                }
                                class={[
                                    "Network-option",
                                    {
                                        active:
                                            this.currentNetwork ===
                                            node.address,
                                    },
                                ]}
                            >
                                <div class="Network-optionCircle" />
                                <div class="Network-optionMain">
                                    <div class="Network-optionName">
                                        {node.name}
                                    </div>
                                    <div class="Network-optionAddress">
                                        {node.address}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div class="Network-worldImageContainer">
                        <img class="Network-worldImage" src={worldMap} />
                        <div class="Network-hederaNodePin" data-value={1} />
                        <div class="Network-hederaNodePin" data-value={2} />
                        <div class="Network-hederaNodePin" data-value={3} />
                        <div class="Network-hederaNodePin" data-value={4} />
                        <div class="Network-hederaNodePin" data-value={5} />
                        <div class="Network-hederaNodePin" data-value={6} />
                        <div class="Network-hederaNodePin" data-value={7} />
                        <div class="Network-hederaNodePin" data-value={8} />
                        <div class="Network-hederaNodePin" data-value={9} />
                        <div class="Network-hederaNodePin" data-value={10} />
                        <div class="Network-hederaNodePin" data-value={11} />
                        {availableNodes.map((node: { address: string; left: any; top: any; }) => (
                            <div
                                class={[
                                    "Network-worldImagePin",
                                    {
                                        active:
                                            node.address ===
                                            this.currentNetwork,
                                    },
                                ]}
                                style={{ left: node.left, top: node.top }}
                            />
                        ))}
                        <div class="Network-nodeLegend">
                            <div class="Network-nodeLegendPin hedera" />
                            <div class="Network-nodeLegendPinLabel">
                                Hedera Mainnet Node
                            </div>
                            <div class="Network-nodeLegendPin hsc" />
                            <div class="Network-nodeLegendPinLabel">
                                Hedera Stable Coin Node
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
});
