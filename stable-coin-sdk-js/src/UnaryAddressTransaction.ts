import Transaction from "./Transaction";
import {
    Ed25519PublicKey as PublicKey,
    Ed25519PrivateKey as PrivateKey,
} from "@hashgraph/sdk";

export default abstract class UnaryAddressTransaction<
    RequestT
> extends Transaction<RequestT> {
    protected _address?: PublicKey;

    public setAddress(address: string): this {
        try {
            this._address = PublicKey.fromString(address);
        } catch (e) {
            this._address = PrivateKey.fromString(address).publicKey;
        }

        return this;
    }
}
