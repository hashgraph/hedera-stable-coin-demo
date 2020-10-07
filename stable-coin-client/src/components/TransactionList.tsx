import { defineComponent, onUnmounted, ref } from "vue";
import TransactionItem from "./TransactionItem";
import { Transaction } from "../service/hedera-stable-coin/state";
import { Account } from "../service/hedera-stable-coin-platform";
import "./TransactionList.css";
import * as hederaStableCoin from "../service/hedera-stable-coin/state";
import * as hederaStableCoinPlatform from "../service/hedera-stable-coin-platform";
import { useStore } from "vuex";
import { State } from "../store/state";

export default defineComponent({
    name: "TransactionList",
    setup() {
        const transactions = ref<Transaction[]>([]);
        const accountsByAddress = ref<Map<string, Account>>(new Map());
        const store = useStore<State>();

        function update() {
            hederaStableCoin
                .getTransactions(store.state.address!)
                .then((transactions_) => {
                    transactions.value = transactions_.filter(
                        (tx) =>
                            [
                                "transfer",
                                "wipe",
                                "externalTransfer",
                                "externalTransferFrom",
                            ].indexOf(tx.transaction) >= 0
                    );
                });

            hederaStableCoinPlatform.getAllAccounts().then((accounts) => {
                const accMap = new Map();

                for (const acc of accounts) {
                    accMap.set(acc.address, acc);
                }

                accountsByAddress.value = accMap;
            });
        }

        update();

        const intervalToken = setInterval(update, 500);

        onUnmounted(() => {
            clearInterval(intervalToken);
        });

        return {
            transactions,
            accountsByAddress,
        };
    },
    render() {
        if (this.transactions.length === 0) {
            return <div class="TransactionList empty">No recent activity.</div>;
        }

        return (
            <div class="TransactionList">
                {this.transactions.map((transaction) => (
                    <TransactionItem
                        accounts={this.accountsByAddress}
                        transaction={transaction.transaction}
                        caller={transaction.callerPublicKey}
                        data={transaction.data}
                        consensusAt={transaction.consensusAt}
                        kind={transaction.transaction}
                    />
                ))}
            </div>
        );
    },
});
