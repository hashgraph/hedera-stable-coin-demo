import { defineComponent } from "vue";
import ethereumLogo from "../assets/Ethereum-Icon-Purple-Logo.wine.svg";
import "./EthereumIcon.css";

export default defineComponent({
    name: "EthereumIcon",
    props: {
        value: Number,
        label: Boolean,
    },
    render() {
        return (
            <div class="EthereumIcon">
                <img alt="" src={ethereumLogo} />
            </div>
        );
    },
});
