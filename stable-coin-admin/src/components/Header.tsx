import { defineComponent } from "vue";
import icon from "../assets/icon.svg";
import "./Header.css";
import { RouterLink } from "vue-router";
import { CogOutline } from "mdue";

export default defineComponent({
    name: "Header",
    render() {
        return (
            <div class="Header">
                <div class="Header-wrapper wrapper">
                    <img src={icon} class="Header-logo" height={34} />
                    <RouterLink class="Header-nav" to={{ name: "Dashboard" }}>
                        Dashboard
                    </RouterLink>
                    <RouterLink class="Header-nav" to={{ name: "Accounts" }}>
                        Accounts
                    </RouterLink>
                    <RouterLink class="Header-nav" to={{ name: "Network" }}>
                        Network
                    </RouterLink>
                    <RouterLink
                        class="Header-nav"
                        to={{ name: "Transactions" }}
                    >
                        Transactions
                    </RouterLink>
                    <div class="Header-spacer" />
                    <RouterLink
                        class="Header-nav Header-navIcon"
                        to={{ name: "EditSettings" }}
                    >
                        <CogOutline />
                    </RouterLink>
                </div>
            </div>
        );
    },
});
