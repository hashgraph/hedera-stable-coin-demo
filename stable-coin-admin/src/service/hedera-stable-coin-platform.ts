const hederaPlatformAddress = process.env.VUE_APP_HSC_PLATFORM;

export interface Account {
    displayName: string;
    network: "hedera" | "ethereum";
    id: number;
    address: string;
    flagSeverity: number | null;
    flagAt: string | null;
    flagIgnoreAt: string | null;
}

export async function getAllAccounts(): Promise<Account[]> {
    return await (await fetch(hederaPlatformAddress + "/user")).json();
}

export async function dismissFlag(address: string): Promise<void> {
    await fetch(hederaPlatformAddress + "/flag/dismiss", {
        method: "POST",
        body: JSON.stringify({ address }),
    });
}
