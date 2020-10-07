import { defineComponent } from "vue";
import "./Header.css";
import icon from "../assets/icon.svg";
import { ArrowLeft } from "mdue";
import HederaIcon from "./HederaIcon";
import EthereumIcon from "./EthereumIcon";

export default defineComponent({
    name: "Header",
    props: {
        text: String,
        hasBack: Boolean,
    },
    methods: {
        goBack() {
            this.$router.back();
        },
    },
    render() {
        let content;

        if (this.text != null) {
            content = <span class="Header-text">{this.text}</span>;
        } else {
            content = <img alt="" src={icon} height={34} />;
        }

        let back;

        if (this.hasBack) {
            // @ts-ignore
            back = <ArrowLeft onClick={this.goBack} class="Header-back" />;
        } else if (this.$store.state.network === "hedera") {
            back = (
                <div class="Header-back">
                    <HederaIcon />
                </div>
            );
        } else if (this.$store.state.network === "ethereum") {
            back = (
                <div class="Header-back">
                    <EthereumIcon />
                </div>
            );
        }

        let avatar;

        if (this.$store.state.address != null) {
            const avatarUrl = `https://avatars.dicebear.com/api/avataaars/${this.$store.state.address}.svg`;
            avatar = <img src={avatarUrl} class="Header-avatar" />;
        }

        return (
            <div class="Header">
                {back}
                {content}
                {avatar}
            </div>
        );
    },
});
