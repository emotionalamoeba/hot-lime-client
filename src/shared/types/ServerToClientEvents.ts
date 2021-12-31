import { MessageUpdate, UserListUpdate } from "./APITypes";

interface ServerToClientEventListener {

    privateMessage(from: number, message: string): void;
    publicMessage(message: MessageUpdate): void;
    notifyChangeUser(userID: number, userName: string): void;
    notifyDeleteUser(userID: number): void;
    reportError(error: string): void;
    userList(userListUpdate: UserListUpdate): void;
}

export default ServerToClientEventListener