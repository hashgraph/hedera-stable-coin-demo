import { ActionContext } from "vuex";
import { State } from "./state";
import * as hederaStableCoin from "../service/hedera-stable-coin/state";
import * as ethStableCoin from "../service/web3-stable-coin";

export default {
    async fetchMe({ commit, state }: ActionContext<State, State>) {
        if (state.address != null) {
            if (state.network == "hedera") {
                const addressInfo = await hederaStableCoin.getAddress(
                    state.address
                );

                commit("receiveMyAddress", addressInfo);
            } else if (state.network == "ethereum") {
                const addressInfo = await ethStableCoin.getAddress(
                    state.address
                );

                commit("receiveMyAddress", addressInfo);
            }
        }
    },
};
