import BigNumber from "bignumber.js";
import qs from "qs";

export const availableNodes = JSON.parse((process.env.VUE_APP_APP_NET_NODES === undefined) ? '[{"name": "Node 1", "address": "localhost:8080","left": "230px", "top", "150px"}]' : process.env.VUE_APP_APP_NET_NODES);

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
