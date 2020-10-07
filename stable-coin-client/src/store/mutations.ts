import { Address } from "../service/hedera-stable-coin/state";
import { State } from "./state";
import BigNumber from "bignumber.js";

export default {
    receiveMyAddress(state: State, address: Address) {
        state.balance = address.balance.dividedBy(100);
        state.isFrozen = address.isFrozen;
        state.isKycPassed = address.isKycPassed;
    },

    setIdentity(
        state: State,
        newIdentity: { privateKey: string; address: string }
    ) {
        state.privateKey = newIdentity.privateKey;
        state.address = newIdentity.address;

        // remember beyond page reload
        localStorage.setItem("stableCoinPrivateKey", newIdentity.privateKey);
        localStorage.setItem("stableCoinAddress", newIdentity.address);
    },

    reduceMyFiatBalance(state: State, amount: BigNumber) {
        state.fiatBalance = state.fiatBalance.minus(amount);
    },

    setDisplayName(state: State, newDisplayName: string) {
        state.displayName = newDisplayName;

        // remember beyond page reload
        localStorage.setItem("stableCoinDisplayName", newDisplayName);
    },

    setNetwork(state: State, newNetwork: string) {
        state.network = newNetwork;

        // remember beyond page reload
        localStorage.setItem("stableCoinNetwork", newNetwork);
    },
};
