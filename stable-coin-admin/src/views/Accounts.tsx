import { defineComponent, onUnmounted, ref } from "vue";
import Metric from "../components/Metric";
import "./Accounts.css";
import AccountList from "../components/AccountList";
import { Account } from "../service/hedera-stable-coin-platform";
import * as hederaStableCoinPlatform from "../service/hedera-stable-coin-platform";

export default defineComponent({
    name: "Accounts",
    setup() {
        const accounts = ref<Account[]>([]);

        function fetchAccounts() {
            void hederaStableCoinPlatform.getAllAccounts().then((accounts_) => {
                accounts.value = accounts_;
            });
        }

        fetchAccounts();

        const intervalToken = setInterval(fetchAccounts, 2500);

        onUnmounted(() => {
            clearInterval(intervalToken);
        });

        return { accounts };
    },
    render() {
        const totalSupply = this.$store.getters.totalSupply.toFixed(2);

        return (
            <div class="Accounts wrapper">
                <h1>Accounts</h1>
                <div class="Accounts-metrics">
                    <Metric
                        label="Accounts"
                        amount={this.accounts.length.toString()}
                    />
                    <Metric label="Balance" amount={"$" + totalSupply} />
                </div>
                <div class="Accounts-headings">
                    <div class="Accounts-heading">Risk</div>
                    <div class="Accounts-heading name">Name</div>
                    <div class="Accounts-heading balance">Balance</div>
                    <div class="Accounts-heading">Active?</div>
                    <div class="Accounts-heading" />
                </div>
                <AccountList accounts={this.accounts} />
            </div>
        );
    },
});
