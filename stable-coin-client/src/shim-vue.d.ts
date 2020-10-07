import { ComponentCustomProperties } from "vue";
import { Store } from "vuex";
import { State } from "./store/state";
import { Router } from "vue-router";

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $store: Store<State>;
        $router: Router;
    }
}
