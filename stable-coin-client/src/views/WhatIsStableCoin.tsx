import { defineComponent } from "vue";
import Header from "../components/Header";
import "./WhatIsStableCoin.css";

const messages = [
    "Cryptocurrencies like Bitcoin and Ethereum are notorious for their volatility when priced against fiat.",
    "Stablecoins are digital assets designed to mimic the value of fiat currencies like the dollar or the euro.",
    "They allow users to cheaply and rapidly transfer value around the globe while maintaining price stability.",
];

export default defineComponent({
    name: "WhatIsStableCoin",
    data() {
        return {
            step: 0,
        }
    },
    methods: {
        skip() {
            this.$router.push({ name: "StableCoinDisclaimer" });
        },

        goNext() {
            if ((this.step + 1) < messages.length) {
                this.step += 1;
            } else {
                this.skip();
            }
        },

        goPrev() {
            if (this.step > 0) {
                this.step -= 1;
            }
        }
    },
    render() {
        const isDone = this.step === (messages.length - 1);

        return (
            <>
                <Header hasBack text="What is StableCoin?" />
                <div class="WhatIsStableCoin">
                    <div class="WhatIsStableCoin-imagePlaceholder" />
                    <div class="WhatIsStableCoin-description">
                        {messages[this.step]}
                    </div>
                    <div class="WhatIsStableCoin-spacer" />
                    <div class="WhatIsStableCoin-progress">
                        {messages.map((_value, index) => (
                            <div class={["WhatIsStableCoin-progressCircle", {
                                "active": index === this.step
                            }]} />
                        ))}
                    </div>
                    <div onClick={this.goNext} class="WhatIsStableCoin-next" />
                    <div onClick={this.goPrev}  class="WhatIsStableCoin-prev" />
                    <button
                        class={["WhatIsStableCoin-skip", {done: isDone}]}
                        onClick={this.skip} type="button"
                    >
                        {isDone ? "Done" : "Skip"}
                    </button>
                </div>
            </>
        );
    },
});
