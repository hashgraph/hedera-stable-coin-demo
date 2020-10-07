// import { balanceOf } from "./service/network";
import { defineComponent } from "vue";
// import { fetch as fetchState } from "./state";
import { RouterView } from "vue-router";

export default defineComponent({
    name: "App",
    // setup() {
    //     const state = reactive(fetchState());
    //
    //     void (async () => {
    //         state.balanceStableCoin = await balanceOf(state.profile!.publicKey);
    //     })();
    //
    //     provide("state", state);
    // },
    render() {
        return (
            <>
                <RouterView />
            </>
        );
    },
});
