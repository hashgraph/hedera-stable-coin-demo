import { RouterView } from "vue-router";
import { defineComponent } from "vue";
import Header from "./components/Header";
import Busy from "./components/Busy";

export default defineComponent({
    name: "App",
    render() {
        return (
            <>
                <Header />
                <RouterView />
                {this.$store.state.isBusy ? <Busy /> : null}
            </>
        );
    },
});
