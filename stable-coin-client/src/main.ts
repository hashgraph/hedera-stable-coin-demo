import { createApp } from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import "./main.css";

// async. fetch my information on page load
void store.dispatch("fetchMe");

createApp(App).use(store).use(router).mount("#app");

// after app load, continue to update ourself every so often
setInterval(() => {
    void store.dispatch("fetchMe");
}, 500);
