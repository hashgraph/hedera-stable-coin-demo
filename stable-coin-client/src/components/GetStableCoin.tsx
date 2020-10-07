import { defineComponent } from "vue";
import "./GetStableCoin.css";
import { CurrencyUsdCircleOutline } from "mdue";

export default defineComponent({
    name: "GetStableCoin",
    methods: {
        getStarted() {
            this.$router.push({ name: "WhatIsStableCoin" });
        }
    },
    render() {
        return (
            <div class="GetStableCoin" onClick={this.getStarted}>
                <div class="GetStableCoin-topRow">
                    <div class="GetStableCoin-title">Get StableCoin</div>
                </div>
                <div class="GetStableCoin-textContainer">
                    <div class="GetStableCoin-text">
                        A new added feature is StableCoin. Get it now!
                    </div>
                    <div class="GetStableCoin-circle">
                        <CurrencyUsdCircleOutline />
                    </div>
                </div>
            </div>
        );
    }
});
