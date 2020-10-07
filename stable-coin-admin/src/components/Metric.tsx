import { defineComponent } from "vue";
import "./Metric.css";

export default defineComponent({
    name: "Metric",
    props: {
        label: { type: String, required: true },
        amount: String,
        description: String,
    },
    render() {
        return (
            <div class="Metric">
                <div class="Metric-label">{this.label}</div>
                <div class="Metric-amount">{this.amount?.toString()}</div>
                <div class="Metric-description">{this.description}</div>
            </div>
        );
    },
});
