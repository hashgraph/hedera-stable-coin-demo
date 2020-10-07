import { State } from "./state";
import BigNumber from "bignumber.js";

export default {
    totalSupply(state: State): BigNumber {
        return state.ethTotalSupply
            .plus(state.hederaTotalSupply)
            .dividedBy(100);
    },
};
