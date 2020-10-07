import { ActionContext } from "vuex";
import { State } from "./state";
import * as hederaStableCoin from "../service/hedera-stable-coin/state";
import * as ethStableCoin from "../service/web3-stable-coin";

export default {
    async fetchHedera({ commit }: ActionContext<State, State>) {
        const token = await hederaStableCoin.getToken();

        // const supplyManagerBalance = await hederaStableCoin.getBalanceOf(
        //     token.supplyManager
        // );

        commit("receiveHederaToken", token);
        // commit("receiveBalanceOfSupplyManager", supplyManagerBalance);
    },

    async fetchEthereum({ commit }: ActionContext<State, State>) {
        const totalSupply = await ethStableCoin.getTotalSupply();

        commit("receiveEthTotalSupply", totalSupply);
    },

    async fetch({ dispatch }: ActionContext<State, State>) {
        await dispatch("fetchHedera");
        await dispatch("fetchEthereum");
    },
};
