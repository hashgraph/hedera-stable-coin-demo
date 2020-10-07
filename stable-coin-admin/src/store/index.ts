import { createStore } from "vuex";
import actions from "./actions";
import state from "./state";
import mutations from "./mutations";
import getters from "./getters";

export default createStore({
    state,
    getters,
    actions,
    mutations,
});
