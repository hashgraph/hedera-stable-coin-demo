import { defineComponent, ref } from "vue";
import Header from "../components/Header";
import "./SendPickContact.css";
import * as hederaStableCoinPlatform from "../service/hedera-stable-coin-platform";
import { Account } from "../service/hedera-stable-coin-platform";
import AccountItem from "../components/AccountItem";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { State } from "../store/state";

export default defineComponent({
    name: "SendPickContact",
    setup() {
        const router = useRouter();
        const store = useStore<State>();
        const accounts = ref<Account[]>([]);

        hederaStableCoinPlatform.getAllAccounts().then((accounts_) => {
            accounts.value = accounts_.filter(
                (acc) =>
                    acc.address.toLowerCase() !==
                    store.state.address?.toLowerCase()
            );
        });

        function handleClickAccount(account: Account) {
            void router.push({
                name: "SendEnterAmount",
                query: {
                    toNetwork: account.network,
                    toName: account.displayName,
                    toPublicKey: account.address,
                },
            });
        }

        return { accounts, handleClickAccount };
    },
    render() {
        return (
            <>
                <Header hasBack text="Send StableCoin" />
                <div class="SendPickContact">
                    <div class="SendPickContact-heading">Your Contacts</div>
                    <div class="SendPickContact-accounts">
                        {this.accounts.map((account) => (
                            <AccountItem
                                displayName={account.displayName}
                                network={account.network}
                                address={account.address}
                                onClick={() => this.handleClickAccount(account)}
                            />
                        ))}
                    </div>
                </div>
            </>
        );
    },
});
