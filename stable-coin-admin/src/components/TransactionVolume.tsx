import {computed, defineComponent, PropType} from "vue";
import { Transaction } from "../service/hedera-stable-coin/state";
import "./TransactionList.css";
import Metric from "./Metric";
import {React} from "mdue";
import BigNumber from "bignumber.js";

export default defineComponent({
    name: "TransactionVolume",
    props: {
        transactions: {
            type: Array as PropType<Transaction[]>,
            required: true,
        },
    },
    setup(props) {
        const volume24h = computed(() => {
            let volume = new BigNumber(0);
            const timeNowMinus24 = Date.now().valueOf() - 24 * 60 * 60 * 1000; // now - 24 hours
            props.transactions.forEach ((transaction) => {
                if (transaction.consensusAt.valueOf() >= timeNowMinus24) {
                    switch (transaction.transaction) {
                        case "transfer":
                            // @ts-ignore
                            volume = volume.plus(transaction.data.value);
                            break;
                        case "mint":
                            // @ts-ignore
                            volume = volume.minus(transaction.data.value);
                            break;
                    }
                }
            });
            return volume.dividedBy(100);
        });

        return {
            volume24h
        }
    },
    render() {
        return (
            <Metric label="24hr Transfer Volume" amount={"$" + this.volume24h.toNumber().toLocaleString()} />
        );
    },
});
