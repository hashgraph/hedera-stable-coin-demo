import { defineComponent, PropType } from "vue";
import "./Button.css";

export default defineComponent({
    name: "Button",
    props: {
        onClick: Function as PropType<() => void>,
        disabled: Boolean
    },
    render() {
        const disabled = !!this.disabled;

        return (
            <button
                class={["Button", {disabled}]}
                onClick={this.onClick} type="button"
                disabled={disabled}
            >
                {this.$slots.default?.()}
            </button>
        );
    }
});
