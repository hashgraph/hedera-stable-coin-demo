import BigNumber from "bignumber.js";
// @ts-ignore
import BigInteger from "node-biginteger";

export function encodeBigInteger(value: BigNumber): Uint8Array {
    return BigInteger.fromString(value.toString()).toBuffer();
}

export function decodeHex(text: string): Uint8Array {
    const str = text.startsWith("0x") ? text.substring(2) : text;
    const result = str.match(/.{1,2}/gu);

    return new Uint8Array(
        (result == null ? [] : result).map((byte) => parseInt(byte, 16))
    );
}

export function encodeHex(buffer: Uint8Array) {
    return Array.prototype.map
        .call(buffer, (x) => ("00" + x.toString(16)).slice(-2))
        .join("");
}
