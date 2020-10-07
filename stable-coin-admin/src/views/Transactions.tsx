import { computed, defineComponent, onUnmounted, ref } from "vue";
import "./Transactions.css";
import Metric from "../components/Metric";
import * as hederaStableCoin from "../service/hedera-stable-coin/state";
import * as hederaStableCoinPlatform from "../service/hedera-stable-coin-platform";
import { Transaction } from "../service/hedera-stable-coin/state";
import TransactionList from "../components/TransactionList";
import { Account } from "../service/hedera-stable-coin-platform";

export default defineComponent({
    name: "Transactions",
    setup() {
        const ethereumContractAddress = process.env.VUE_APP_ETH_CONTRACT_ADDRESS;
        const transactions = ref<Transaction[]>([]);
        const accountsByAddress = ref<Map<string, Account>>(new Map());
        const onlyBridge = ref(false);

        function fetchAll() {
            hederaStableCoin.getAllTransactions().then((transactions_) => {
                transactions.value = transactions_;
            });

            hederaStableCoinPlatform.getAllAccounts().then((accounts) => {
                const accMap = new Map();

                for (const acc of accounts) {
                    accMap.set(acc.address, acc);
                }

                accountsByAddress.value = accMap;
            });
        }

        fetchAll();

        const intervalToken = setInterval(fetchAll, 2500);

        onUnmounted(() => {
            clearInterval(intervalToken);
        });

        function handleToggleBridge() {
            onlyBridge.value = !onlyBridge.value;
        }

        const filteredTransactions = computed(() =>
            transactions.value.filter((tx) => {
                if (onlyBridge.value) {
                    return tx.transaction.startsWith("external");
                }

                return true;
            })
        );

        return {
            filteredTransactions,
            transactions,
            handleToggleBridge,
            onlyBridge,
            accountsByAddress,
            ethereumContractAddress,
        };
    },
    render() {
        return (
            <div class="Transactions wrapper">
                <h1>Transactions</h1>
                <div class="Transactions-metrics">
                    <Metric
                        label="StableCoin in Circulation"
                        amount={
                            "$" + this.$store.getters.totalSupply.toFixed(0)
                        }
                    />
                    <Metric label="24hr Transfer Volume" amount={"0"} />
                </div>
                <div class="Transactions-header">
                    <h2>Recent Transactions</h2>
                    {this.ethereumContractAddress &&
                        <div class="Transactions-bridgeFilterContainer">
                            <div
                                class={[
                                    "Transactions-bridgeFilterSwitch",
                                    {active: this.onlyBridge},
                                ]}
                                onClick={this.handleToggleBridge}
                            >
                                <div class="Transactions-bridgeFilterThumb"/>
                            </div>
                            Only Bridge Transactions
                        </div>
                    }
                </div>
                <div class="Transactions-headings">
                    <div class="Transactions-heading summary">Transaction</div>
                    <div class="Transactions-heading">Consensus</div>
                    <div class="Transactions-heading amount">Total Amount</div>
                </div>
                <TransactionList
                    accounts={this.accountsByAddress}
                    transactions={this.filteredTransactions}
                />
            </div>
        );
    },
});
