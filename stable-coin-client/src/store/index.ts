import { createStore } from "vuex";
import actions from "./actions";
import state from "./state";
import mutations from "./mutations";

export default createStore({
    state,
    actions,
    mutations,
});
