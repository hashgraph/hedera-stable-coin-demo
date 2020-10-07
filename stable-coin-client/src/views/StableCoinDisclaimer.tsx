import { defineComponent, ref } from "vue";
import Header from "../components/Header";
import Button from "../components/Button";
import "./StableCoinDisclaimer.css";
import { web3 } from "../service/web3";
import * as hederaStableCoinPlatform from "../service/hedera-stable-coin-platform";
import { useRouter } from "vue-router";
import { Ed25519PrivateKey } from "@hashgraph/sdk";
import { useStore } from "vuex";
import { State } from "../store/state";
import AppSpinner from "../components/AppSpinner";

export default defineComponent({
    name: "StableCoinDisclaimer",
    setup() {
        const router = useRouter();
        const isBusy = ref(false);
        const store = useStore<State>();

        async function agreeToDisclaimer() {
            isBusy.value = true;

            let newPrivateKey;
            let newAddress;
            const networkName = store.state.network;

            if (networkName === "hedera") {
                const key = await Ed25519PrivateKey.generate();

                newPrivateKey = key.toString(true);
                newAddress = key.publicKey.toString(true);
            } else if (networkName === "ethereum") {
                const key = web3.eth.accounts.create();

                newPrivateKey = key.privateKey;
                newAddress = key.address;
            } else {
                throw new Error("unexpected network: " + networkName);
            }

            console.log("key =", newPrivateKey);
            console.log("address =", newAddress);

            await hederaStableCoinPlatform.register(
                store.state.displayName!,
                store.state.network,
                newAddress
            );

            store.commit("setIdentity", {
                privateKey: newPrivateKey,
                address: newAddress,
            });

            // while (true) {
            //     // if (store.state.isKycPassed) {
            //     //     break;
            //     // }
            //     //
            //     // await store.dispatch("fetchMe");
            //     //
            //     // await new Promise((resolve) => setTimeout(resolve, 500));
            // }

            isBusy.value = false;
            await router.push({ name: "Home" });
        }

        return {
            agreeToDisclaimer,
            isBusy,
        };
    },
    render() {
        let busyNode;

        if (this.isBusy) {
            busyNode = (
                <>
                    <div class="AddMoney-busyOverlay" />
                    <div class="AddMoney-busy">
                        <AppSpinner />
                    </div>
                </>
            );
        }

        return (
            <>
                <Header hasBack text="StableCoin Disclaimer" />
                <div class="StableCoinDisclaimer">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Fusce nec pulvinar sem. In risus nibh, volutpat nec
                        lorem et, porttitor placerat enim. Mauris semper blandit
                        ipsum. Suspendisse laoreet vulputate tincidunt. Aenean
                        nisi felis, sagittis eget ipsum ac, facilisis gravida
                        felis. Suspendisse eu magna efficitur mi pharetra
                        bibendum. Nulla facilisi. Nam ut leo at mauris pulvinar
                        laoreet.
                    </p>
                    <p>
                        Nullam et mollis velit. Donec leo augue, dapibus nec
                        odio et, gravida convallis libero. Nulla magna justo,
                        elementum in enim et, dignissim viverra quam. Nam
                        eleifend felis nec arcu rutrum, sit amet consequat sem
                        bibendum. Etiam at cursus mauris. Suspendisse mi velit,
                        consequat a lacus eu, condimentum bibendum lorem.
                    </p>
                    <p>
                        Aenean venenatis mattis nisl sit amet hendrerit.
                        Vestibulum massa libero, consequat et placerat eget,
                        ullamcorper nec nisi. Aliquam vitae dignissim diam.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec arcu urna, placerat vel mattis in, finibus a
                        nulla. Vestibulum ac neque sapien.
                    </p>
                    <p>
                        Donec mattis rutrum rhoncus. Nullam molestie pharetra
                        augue ut tristique. Donec eget sagittis augue.
                        Pellentesque ullamcorper quis tellus eu cursus. Proin
                        non dictum sapien. Nullam commodo non leo ut bibendum.
                    </p>
                    <p>
                        Nam et malesuada neque. Sed non risus sed lacus dictum
                        fermentum. Curabitur lacinia eu quam nec pellentesque.
                        Praesent nisl risus, elementum sed lacinia sit amet,
                        euismod eu nibh. Aliquam imperdiet accumsan nunc, eu
                        pharetra est lacinia vitae. Suspendisse faucibus ante ut
                        pulvinar eleifend. Proin vel elit magna. Suspendisse nec
                        nunc sapien. Vivamus sollicitudin massa turpis, et
                        fermentum lorem dictum ut.
                    </p>
                    <p>
                        Nullam et mollis velit. Donec leo augue, dapibus nec
                        odio et, gravida convallis libero. Nulla magna justo,
                        elementum in enim et, dignissim viverra quam. Nam
                        eleifend felis nec arcu rutrum, sit amet consequat sem
                        bibendum. Etiam at cursus mauris. Suspendisse mi velit,
                        consequat a lacus eu, condimentum bibendum lorem.
                    </p>
                    <p>
                        Aenean venenatis mattis nisl sit amet hendrerit.
                        Vestibulum massa libero, consequat et placerat eget,
                        ullamcorper nec nisi. Aliquam vitae dignissim diam.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec arcu urna, placerat vel mattis in, finibus a
                        nulla. Vestibulum ac neque sapien.
                    </p>
                </div>
                <Button onClick={this.agreeToDisclaimer}>I Agree</Button>
                {busyNode}
            </>
        );
    },
});
