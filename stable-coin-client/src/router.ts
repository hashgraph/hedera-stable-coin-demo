import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home";
import WhatIsStableCoin from "./views/WhatIsStableCoin";
import StableCoinDisclaimer from "./views/StableCoinDisclaimer";
import StableCoinBalance from "./views/StableCoinBalance";
import EnterTheAmount from "./views/EnterTheAmount";
import AddMoney from "./views/AddMoney";
import Register from "./views/Register";
import store from "./store";
import SendPickContact from "./views/SendPickContact";
import SendEnterAmount from "./views/SendEnterAmount";
import SendConfirm from "./views/SendConfirm";

export default createRouter({
    history: createWebHistory(),
    strict: true,
    routes: [
        {
            path: "/",
            component: Home,
            name: "Home",
            beforeEnter(_to, _from, next) {
                if (store.state.displayName == null) {
                    return next({ name: "Register" });
                }

                return next();
            },
        },
        {
            path: "/register",
            component: Register,
            name: "Register",
        },
        {
            path: "/stable-coin/send",
            component: SendPickContact,
            name: "SendPickContact",
        },
        {
            path: "/stable-coin/send/amount",
            component: SendEnterAmount,
            name: "SendEnterAmount",
        },
        {
            path: "/stable-coin/send/confirm",
            component: SendConfirm,
            name: "SendConfirm",
        },
        {
            path: "/stable-coin/welcome",
            component: WhatIsStableCoin,
            name: "WhatIsStableCoin",
        },
        {
            path: "/stable-coin/disclaimer",
            component: StableCoinDisclaimer,
            name: "StableCoinDisclaimer",
        },
        {
            path: "/stable-coin/balance",
            component: StableCoinBalance,
            name: "StableCoinBalance",
        },
        {
            path: "/stable-coin/balance/add",
            component: EnterTheAmount,
            name: "EnterTheAmount",
        },
        {
            path: "/stable-coin/balance/add/confirm",
            component: AddMoney,
            name: "AddMoney",
        },
    ],
});
