import BigNumber from "bignumber.js";

export default interface Wallet {
    balanceFiat: BigNumber;
    balanceStableCoin: BigNumber;
}
