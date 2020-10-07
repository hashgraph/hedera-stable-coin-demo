import { computed, defineComponent } from "vue";
import Header from "../components/Header";
import GetStableCoin from "../components/GetStableCoin";
import Balance from "../components/BalanceCard";
import "./Home.css";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { State } from "../store/state";
import Button from "../components/Button";
import TransactionList from "../components/TransactionList";

export default defineComponent({
    name: "Home",
    setup() {
        const router = useRouter();
        const store = useStore<State>();

        function goToStableCoinBalance() {
            void router.push({ name: "StableCoinBalance" });
        }

        function handleSend() {
            void router.push({ name: "SendPickContact" });
        }

        return {
            isFrozen: computed(() => store.state.isFrozen),
            balanceFiat: store.state.fiatBalance,
            balanceStableCoin: computed(() => store.state.balance),
            hasStableCoin: computed(() => store.state.isKycPassed),
            goToStableCoinBalance,
            handleSend,
        };
    },
    render() {
        const getStableCoin = this.hasStableCoin ? null : <GetStableCoin />;

        const stableCoinBalance =
            this.hasStableCoin && this.balanceStableCoin != null ? (
                <Balance
                    isFrozen={this.isFrozen}
                    onClick={
                        this.isFrozen ? undefined : this.goToStableCoinBalance
                    }
                    kind="StableCoin"
                    amount={this.balanceStableCoin}
                />
            ) : null;

        return (
            <>
                <Header />
                <div class="Home">
                    <Balance kind="Cash" amount={this.balanceFiat} />
                    {stableCoinBalance}
                    {getStableCoin}
                    {this.$store.state.network.startsWith("hedera") ? (
                        <div class="Home-recentActivity">
                            <div class="BalanceCard-title">Recent Activity</div>
                            <TransactionList />
                        </div>
                    ) : null}
                    <div class="Home-spacer" />
                </div>
                <Button onClick={this.handleSend} disabled={this.isFrozen}>
                    Send StableCoin
                </Button>
            </>
        );
    },
});
