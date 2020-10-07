import { defineComponent, PropType } from "vue";
import "./AccountItem.css";
import HederaIcon from "./HederaIcon";
import EthereumIcon from "./EthereumIcon";

export default defineComponent({
    name: "AccountItem",
    props: {
        displayName: String,
        address: String,
        network: { type: String, required: true },
        onClick: Function as PropType<() => void>,
    },
    render() {
        const avatarUrl = `https://avatars.dicebear.com/api/avataaars/${this.address}.svg`;

        let networkIcon;

        if (this.network.startsWith("ethereum:")) {
            networkIcon = <EthereumIcon />;
        } else if (this.network.startsWith("hedera:")) {
            networkIcon = <HederaIcon />;
        }

        return (
            <div class="AccountItem" onClick={this.onClick}>
                <img class="AccountItem-avatar" src={avatarUrl} />
                <div class="AccountItem-displayName">{this.displayName}</div>
                <div class="AccountItem-publicKey">
                    …{this.address?.slice(this.address?.length - 6)}
                </div>
                {networkIcon}
            </div>
        );
    },
});
