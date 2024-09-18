import BigNumber from "bignumber.js";
import qs from "qs";

export const availableNodes = JSON.parse((process.env.VUE_APP_APP_NET_NODES === undefined) ? '[{"name": "Node 1", "address": "localhost:8080","left": "230px", "top", "150px"}]' : process.env.VUE_APP_APP_NET_NODES);
export const mainnetNodes = JSON.parse((process.env.VUE_APP_MAINNET_NODES === undefined) ? '[{"left": "105px", "top": "160px"}, {"left": "110px", "top": "190px"}, {"left": "165px", "top": "170px"}, {"left": "210px", "top": "170px"}, {"left": "200px", "top": "185px"}, {"left": "220px", "top": "155px"}, {"left": "420px", "top": "155px"}, {"left": "410px", "top": "145px"}, {"left": "422px","top": "142px"}, {"left": "470px", "top": "120px"}, {"left": "600px", "top": "230px"}]' : process.env.VUE_APP_MAINNET_NODES);
export const testnetNodes = JSON.parse((process.env.VUE_APP_TESTNET_NODES === undefined) ? '[{"left": "106px", "top": "155px"}, {"left": "145px", "top": "170px"}, {"left": "186px", "top": "125px"}, {"left": "225px", "top": "145px"}]' : process.env.VUE_APP_TESTNET_NODES);

export interface State {
    isBusy: boolean;
    hederaTotalSupply: BigNumber;
    ethTotalSupply: BigNumber;
    supplyManagerBalance: BigNumber;
    numberOfAccounts: BigNumber;
    hederaStableCoinNode: string;
}

const query = qs.parse(location.search.slice(1) ?? "");

let currentNode = 0;

if (query.address != null) {
    currentNode = availableNodes.findIndex(
        (node: { address: string | qs.ParsedQs | string[] | qs.ParsedQs[] | undefined; }) => node.address === query.address
    );
}

export default {
    isBusy: false,
    hederaStableCoinNode:
        currentNode >= 0
            ? availableNodes[currentNode].address
            : availableNodes[0].address,
    hederaTotalSupply: new BigNumber(0),
    ethTotalSupply: new BigNumber(0),
    supplyManagerBalance: new BigNumber(0),
    numberOfAccounts: new BigNumber(0),
} as State;
