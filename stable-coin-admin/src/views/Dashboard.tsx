import { defineComponent, onUnmounted, ref } from "vue";
import Metric from "../components/Metric";
import "./Dashboard.css";
import * as hederaStableCoinPlatform from "../service/hedera-stable-coin-platform";
import { Account } from "../service/hedera-stable-coin-platform";
import FlaggedAccountItem from "../components/FlaggedAccountItem";

export default defineComponent({
    name: "Dashboard",
    setup() {
        const numAccounts = ref(0);
        const flaggedAccounts = ref<Account[]>([]);

        function update() {
            hederaStableCoinPlatform.getAllAccounts().then((accounts) => {
                numAccounts.value = accounts.length;
                flaggedAccounts.value = accounts
                    .filter((account) => {
                        if (account.flagAt == null) return false;

                        if (
                            account.flagSeverity == null ||
                            account.flagSeverity === 0
                        )
                            return false;

                        if (account.network.startsWith("ethereum:"))
                            return false;

                        return (
                            account.flagIgnoreAt == null ||
                            Date.parse(account.flagAt) >=
                                Date.parse(account.flagIgnoreAt)
                        );
                    })
                    .slice(0, 4);
            });
        }

        update();

        function handleDismiss() {
            update();
        }

        const intervalToken = setInterval(update, 15000);

        onUnmounted(() => {
            clearInterval(intervalToken);
        });

        return { numAccounts, flaggedAccounts, handleDismiss };
    },
    render() {
        return (
            <div class="Dashboard wrapper">
                <h1>Dashboard</h1>
                <div class="Dashboard-metrics">
                    <Metric
                        label="User Accounts"
                        amount={this.numAccounts.toString()}
                    />
                    <Metric
                        label="StableCoin in Circulation"
                        amount={
                            "$" +
                            this.$store.getters.totalSupply
                                .integerValue()
                                .toString()
                        }
                    />
                    <Metric label="Transactions per Second" amount={"0"} />
                    <Metric label="Nodes" amount={"3"} />
                </div>
                <div class="Dashboard-main">
                    <div class="Dashboard-card">
                        <div class="Dashboard-cardHeader">
                            <div class="Dashboard-cardTitle">
                                Flagged Accounts
                            </div>
                            <div class="Dashboard-cardCount">
                                {this.flaggedAccounts.length}
                            </div>
                        </div>
                        {this.flaggedAccounts.map((account) => (
                            <FlaggedAccountItem
                                displayName={account.displayName}
                                publicKey={account.address}
                                onDismiss={this.handleDismiss}
                                risk={account.flagSeverity ?? 0}
                            />
                        ))}
                        {this.flaggedAccounts.length === 0 ? (
                            <div class="Dashboard-empty">
                                No New Flagged Accounts
                            </div>
                        ) : null}
                    </div>
                    <div class="Dashboard-card">
                        <div class="Dashboard-cardHeader">
                            <div class="Dashboard-cardTitle">Appeals</div>
                            <div class="Dashboard-cardCount">0</div>
                        </div>
                        <div class="Dashboard-empty">No Appeals</div>
                    </div>
                </div>
            </div>
        );
    },
});
