import { computed, defineComponent } from "vue";
import Header from "../components/Header";
import Button from "../components/Button";
import "./StableCoinBalance.css";
import Balance from "../components/Balance";
import { useStore } from "vuex";
import { State } from "../store/state";

export default defineComponent({
    name: "StableCoinBalance",
    methods: {
        addMoney() {
            this.$router.push({ name: "EnterTheAmount" });
        },
    },
    setup() {
        const store = useStore<State>();

        return {
            balance: computed(() => store.state.balance),
            address: store.state.address!,
        };
    },
    render() {
        return (
            <>
                <Header hasBack text="StableCoin Balance" />
                <div class="StableCoinBalance">
                    <Balance amount={this.balance} />
                    <div class="StableCoinBalance-available">
                        Available in your StableCoin account
                    </div>
                    <div class="StableCoinBalance-qr" />
                    <div class="StableCoinBalance-publicKeyLabel">Address</div>
                    <div class="StableCoinBalance-publicKey">
                        {this.address}
                    </div>
                </div>
                <Button onClick={this.addMoney}>Add Money</Button>
            </>
        );
    },
});
