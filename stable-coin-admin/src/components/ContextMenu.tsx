import { defineComponent, onMounted, onUnmounted, PropType, ref } from "vue";
import "./ContextMenu.css";

export default defineComponent({
    name: "AccountItem",
    props: {
        choices: Array as PropType<string[]>,
        onSelect: Function as PropType<(choice: string) => void>,
    },
    setup(props) {
        const isOpen = ref(false);

        function handleWindowClick() {
            isOpen.value = false;
        }

        function handleItemClick(choice: string) {
            props.onSelect?.(choice);
        }

        function handleMenuClick(event: Event) {
            event.stopPropagation();
            isOpen.value = !isOpen.value;
        }

        onMounted(() => {
            window.addEventListener("click", handleWindowClick);
        });

        onUnmounted(() => {
            window.removeEventListener("click", handleWindowClick);
        });

        return {
            isOpen,
            handleMenuClick,
            handleItemClick,
        };
    },
    render() {
        let menu;

        if (this.isOpen) {
            menu = (
                <div class="ContextMenu-menu">
                    {this.choices?.map((choice) => (
                        <div
                            class="ContextMenu-item"
                            onClick={() => this.handleItemClick(choice)}
                        >
                            {choice}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div class="ContextMenu" onClick={this.handleMenuClick}>
                {this.$slots.default?.()}
                {menu}
            </div>
        );
    },
});
