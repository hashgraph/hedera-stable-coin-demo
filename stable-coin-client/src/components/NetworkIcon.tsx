import { defineComponent } from "vue";
import HederaIcon from "./HederaIcon";
import EthereumIcon from "./EthereumIcon";

export default defineComponent({
    name: "NetworkIcon",
    props: {
        network: String,
    },
    render() {
        if (this.network === "hedera") return <HederaIcon />;
        if (this.network === "ethereum") return <EthereumIcon />;

        return null;
    },
});
