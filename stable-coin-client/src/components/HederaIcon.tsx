import { defineComponent } from "vue";
import hederaHbarLogo from "../assets/hedera-hashgraph-hbar-logo.svg";
import "./HederaIcon.css";

export default defineComponent({
    name: "HederaIcon",
    props: {
        value: Number,
        label: Boolean,
    },
    render() {
        return (
            <div class="HederaIcon">
                <img alt="" src={hederaHbarLogo} />
            </div>
        );
    },
});
