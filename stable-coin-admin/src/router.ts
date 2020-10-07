import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./views/Dashboard";
import Accounts from "./views/Accounts";
import Transactions from "./views/Transactions";
import EditSettings from "./views/EditSettings";
import Network from "./views/Network";

export default createRouter({
    history: createWebHistory(),
    strict: true,
    routes: [
        {
            path: "/",
            component: Dashboard,
            name: "Dashboard",
        },
        {
            path: "/accounts",
            component: Accounts,
            name: "Accounts",
        },
        {
            path: "/transactions",
            component: Transactions,
            name: "Transactions",
        },
        {
            path: "/network",
            component: Network,
            name: "Network",
        },
        {
            path: "/settings/edit",
            component: EditSettings,
            name: "EditSettings",
        },
    ],
});
