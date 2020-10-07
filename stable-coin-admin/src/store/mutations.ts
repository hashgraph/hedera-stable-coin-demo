import { Token } from "../service/hedera-stable-coin/state";
import { State } from "./state";
import BigNumber from "bignumber.js";

export default {
    receiveHederaToken(state: State, tokenInfo: Token) {
        state.hederaTotalSupply = tokenInfo.totalSupply;
    },

    receiveEthTotalSupply(state: State, totalSupply: BigNumber) {
        state.ethTotalSupply = totalSupply;
    },

    receiveBalanceOfSupplyManager(state: State, balance: BigNumber) {
        state.supplyManagerBalance = balance;
    },

    setBusy(state: State, isBusy: boolean) {
        state.isBusy = isBusy;
    },

    setNetwork(state: State, address: string) {
        state.hederaStableCoinNode = address;
    },
};
