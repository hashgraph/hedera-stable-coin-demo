import { defineComponent } from "vue";
import "./Busy.css";

export default defineComponent({
    name: "Busy",
    props: {
        isBusy: Boolean,
    },
    render() {
        return (
            <div class="Busy">
                <div class="Busy-AppSpinner" />
            </div>
        );
    },
});
