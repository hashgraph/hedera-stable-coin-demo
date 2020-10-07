import { defineComponent, PropType } from "vue";
import TransactionItem from "./TransactionItem";
import { Transaction } from "../service/hedera-stable-coin/state";
import "./TransactionList.css";
import { Account } from "../service/hedera-stable-coin-platform";

export default defineComponent({
    name: "TransactionList",
    props: {
        accounts: Object as PropType<Map<string, Account>>,
        transactions: {
            type: Array as PropType<Transaction[]>,
            required: true,
        },
    },
    render() {
        return (
            <div class="TransactionList">
                {this.transactions.map((transaction) => (
                    <TransactionItem
                        key={transaction.consensusAt.toString()}
                        accounts={this.accounts}
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
