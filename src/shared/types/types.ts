type UID = string;

interface Server {
    UID: UID,
    HostName: string,
    Status: 'Connected' | 'Disconnected'
}

interface Individual {
    UID: UID,
    Nick: string,
    ServerUserID: number,
    ServerUID: UID,
};

type SessionChatEntity = Individual | 'Me' | 'Broadcast'

interface Message {
    Text: string,
    Author: SessionChatEntity,
    Recipient: SessionChatEntity,
    Timestamp: Date,
    Read: boolean
}

interface Conversation { userID: number | 'Broadcast', TextInput: string, History: Message[] }

export { Individual, Conversation, ChatEntity, Message, Server, UID }