import { createApp } from "vue";
import App from "./App";
import router from "./router";
import "./main.css";
import store from "./store";

// async. fetch the token information on page load
void store.dispatch("fetch");

createApp(App).use(store).use(router).mount("#app");

// after app load, continue to update ourself every so often
setInterval(() => {
    void store.dispatch("fetch");
}, 2500);
