import { KeyValuePair } from "../KeyValuePair";

interface HotlineAPI {
    connect(): void;

    login(username: string): void;

    getUserList(): void;

    sendPublicMessage(text: string): Promise<any>

    receive(channel, func): void

    getStoreValue(key: string): Promise<string>

    setStoreValue(keyValuePair: KeyValuePair): void
}

export default HotlineAPI;