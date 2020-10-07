import { defineComponent, PropType } from "vue";
import "./ModalConfirm.css";

export default defineComponent({
    name: "ModalConfirm",
    props: {
        isOpen: Boolean,
        title: String,
        confirmLabel: String,
        submitText: String,
        value: String,
        onChange: Function as PropType<(value: string) => void>,
        onSubmit: Function as PropType<() => void>,
        onDismiss: Function as PropType<() => void>,
    },
    render() {
        if (!this.isOpen) return null;

        return (
            <div class={["ModalConfirm", { "is-open": this.isOpen }]}>
                <div class="ModalConfirm-main">
                    <div class="ModalConfirm-title">{this.title}</div>
                    {this.$slots.default?.()}
                    <label for="ModalConfirm-value" class="ModalConfirm-label">
                        {this.confirmLabel}
                    </label>
                    <input
                        id="ModalConfirm-value"
                        class="ModalConfirm-input"
                        type="text"
                        value={this.value}
                        onChange={(event) => {
                            this.onChange?.(
                                (event.target as HTMLInputElement).value
                            );
                        }}
                    />
                    <div class="ModalConfirm-buttons">
                        <button
                            type="button"
                            class="ModalConfirm-button"
                            onClick={this.onDismiss}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            class="ModalConfirm-button submit"
                            onClick={this.onSubmit}
                        >
                            {this.submitText}
                        </button>
                    </div>
                </div>
            </div>
        );
    },
});
