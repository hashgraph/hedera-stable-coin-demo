import BigNumber from "bignumber.js";
import Profile from "./profile";

export default interface User {
    profile: Profile | null;
    balanceFiat: BigNumber;
    balanceStableCoin: BigNumber;
}
