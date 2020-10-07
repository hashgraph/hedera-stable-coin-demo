import { defineComponent, PropType } from "vue";
import AccountItem from "./AccountItem";
import { Account } from "../service/hedera-stable-coin-platform";
import "./AccountList.css";

export default defineComponent({
    name: "AccountList",
    props: {
        accounts: { type: Array as PropType<Account[]>, required: true },
    },
    render() {
        return (
            <div class="AccountList">
                {this.accounts.map((account) => {
                    let accountRisk;

                    if (account.flagAt != null) {
                        if (
                            account.flagIgnoreAt != null &&
                            Date.parse(account.flagIgnoreAt) <
                                Date.parse(account.flagAt)
                        ) {
                            accountRisk = account.flagSeverity;
                        } else {
                            accountRisk = account.flagSeverity;
                        }
                    }

                    return (
                        <AccountItem
                            risk={accountRisk ?? undefined}
                            address={account.address}
                            network={account.network}
                            displayName={account.displayName}
                        />
                    );
                })}
            </div>
        );
    },
});
