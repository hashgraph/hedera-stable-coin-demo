import { defineComponent } from "vue";
import "./Risk.css";

export default defineComponent({
    name: "Metric",
    props: {
        value: Number,
        label: Boolean,
    },
    render() {
        // if (this.value === 0 || this.value == null) return null;

        return (
            <div class="Risk" data-value={this.value}>
                <div class="Risk-box" />
                <div class="Risk-box" />
                <div class="Risk-box" />
                {this.label ? <div class="Risk-label">Risk</div> : null}
            </div>
        );
    },
});
