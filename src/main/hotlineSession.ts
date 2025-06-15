import net from 'net'
import { opcodeNames, opcodes, paramcodes } from './opcodes.js';

import Store from 'electron-store'
import ServerToClientEventListener from '../shared/types/ServerToClientEvents.js';
import { MessageUpdate, UserDetails, UserListUpdate } from '../shared/types/APITypes.js';
import { UID } from '../shared/types/types.js';
import { IntParameter, Parameter, TextParameter, UserNameWithInfoParameter } from './hotlineParameters.js';

interface PromiseResultPair {
    resolve: (value: any) => void;
    reject: (value: any) => void;
}

interface Response {
    opCode: number,
    parameters: Parameter[]
}

class HotlineSession {

    private promiseMap: Map<number, PromiseResultPair> = new Map<number, PromiseResultPair>();

    private sessionKey: UID;

    private store: Store;

    constructor(store: Store) {
        this.store = store;
        this.sessionKey = `${Math.floor(Math.random() * 10000)}`;
    }

    private port: number = 5500;

    private socketClient: net.Socket;

    private eventListener: ServerToClientEventListener;

    private connectionResolve: (value: any) => void;
    private connectionReject: (value: any) => void;

    setEventListener = (listener: ServerToClientEventListener) => {
        this.eventListener = listener;
    }

    requestToServer = (opCode: number, parameters: Parameter[]): Promise<Parameter[]> => {
        let requestOrReply = 0x00;
        let uuid: number = Math.floor(Math.random() * 10000);
        let errorCode: number = 0;

        let requestHeader: Buffer = Buffer.alloc(200);

        requestHeader.writeUInt8(requestOrReply, 1);
        requestHeader.writeUInt16BE(opCode, 2);
        requestHeader.writeUInt32BE(uuid, 4);
        requestHeader.writeUInt32BE(errorCode, 8);

        let byteOffset: number = this.writeParameters(requestHeader, parameters);

        requestHeader.writeUInt32BE(byteOffset - 20, 12);
        requestHeader.writeUInt32BE(byteOffset - 20, 16);

        console.log(`Sending request with opcode ${opCode} (${opcodeNames[opCode]}) and uid ${uuid} to server`);

        this.socketClient.write(requestHeader.slice(0, byteOffset));

        let promise: Promise<any> = new Promise((resolve, reject) => {
            this.promiseMap.set(uuid, { resolve: resolve, reject: reject } as PromiseResultPair);
        })

        return promise;
    }

    connect = (host: string) => {
        console.log('User wants to connect');
        this.socketClient = net.connect({ host: host, port: this.port });
        this.socketClient.on('data', (data) => {
            this.handleIncoming(data);
        });

        let promise: Promise<any> = new Promise((resolve, reject) => {
            this.connectionResolve = resolve,
                this.connectionReject = reject
        })

        this.socketClient.once('error', (err) => {
            console.log('Rejecting promise')
            this.connectionReject(err);
        });

        let handshake = Buffer.from([
            0x54, 0x52, 0x54, 0x50,
            0x48, 0x4f, 0x54, 0x4c,
            0x00, 0x01,
            0x00, 0x02]);

        this.socketClient.write(handshake);

        return promise;
    }

    handleIncoming = (data: Buffer) => {
        let hotlineProtocolBuffer = Buffer.from([0x54, 0x52, 0x54, 0x50]);

        if (hotlineProtocolBuffer.compare(data, 0, 4) == 0) {
            console.log('Response is from hotline')

            let errorCode = data.readUInt32BE(4)
            if (errorCode == 0) {
                this.store.set('connected', true);
                this.login(this.store.get('userName', 'HotLimeUser') as string).then(() => {
                    this.getUserList().then((users: any) => {
                        //todo - fire listener

                        console.log(JSON.stringify(users));
                    });
                });
            }
            else {
                this.store.set('connected', false);
                this.eventListener.reportError(`Error connecting : ${errorCode}`);
            }
        }
        else
            this.parseResponse(data);
    }

    login = (username: string): Promise<any> => {

        console.log('Requesting login');

        let parameters: Parameter[] = [];

        parameters.push(new TextParameter(105, ""));
        parameters.push(new TextParameter(106, ""));
        parameters.push(new IntParameter(104, 128));
        parameters.push(new TextParameter(102, username));
        parameters.push(new IntParameter(160, 556));

        return this.requestToServer(opcodes.CLIENT_LOGIN, parameters);
    }

    getUserList = (): Promise<any> => {

        console.log('Getting user list');

        let opCode: number = opcodes.CLIENT_GET_USER_NAME_LIST;

        let resolver: (value: any) => void;

        return this.requestToServer(opCode, []).then((parameters: Parameter[]) => {
            let userList: UserDetails[] =
                parameters.filter((p: Parameter) => p.id === paramcodes.USER_NAME_WITH_INFO).map((p: UserNameWithInfoParameter) => {
                    return {
                        userName: p.userName,
                        serverUID: p.userID
                    } as UserDetails;
                });

            let userListUpdate: UserListUpdate = {
                sessionKey: this.sessionKey,
                userList: userList
            };

            this.eventListener.userList(userListUpdate);
        });
    }

    sendPublicMessage = (text: string) => {
        console.log(`Outbound public message ${text}`);

        if (!text) {
            text = 'Empty message';
        }

        this.requestToServer(opcodes.CLIENT_PUBLIC_CHAT, [new TextParameter(101, text)]);
    }

    acceptAgreement = (): Promise<any> => {
        console.log(`Accepting agreement}`);

        return this.requestToServer(opcodes.ACCEPT_AGREEMENT, [
            new TextParameter(paramcodes.USER_NAME, this.store.get('userName', 'HotLimeUser') as string),
            new IntParameter(paramcodes.USER_ICON_ID, 0x00),
            new IntParameter(paramcodes.OPTIONS, 0x00),

        ]);
    }

    writeParameters = (data: Buffer, parameters: Parameter[]): number => {
        let byteOffset: number = 20;
        data.writeUInt16BE(parameters.length, byteOffset); byteOffset += 2;

        parameters.map((parameter: Parameter) => {
            data.writeUInt16BE(parameter.id, byteOffset); byteOffset += 2;
            data.writeUInt16BE(parameter.size(), byteOffset); byteOffset += 2;
            byteOffset = parameter.writeContent(data, byteOffset);
        });

        return byteOffset;
    }

    parseResponse = (data: Buffer): Response => {
        if (data.readUInt8() == 0x54) {
            // This looks like a handshake, don't bother parsing it
            return;
        }

        let header: Buffer = data;
        let isRequest = header.readUInt8(1) === 0;

        let opCode: number = header.readUInt16BE(2);

        console.log(`Parsing ${isRequest ? 'request' : 'response'} for message with opcode ${opCode} (${opcodeNames[opCode]})`);

        if (isRequest) {
            switch (opCode) {
                case opcodes.SERVER_SHOW_AGREEMENT:
                case opcodes.SERVER_PRIVATE_MESSAGE:
                case opcodes.SERVER_PUBLIC_MESSAGE:
                case 300:
                case opcodes.SERVER_NOTIFY_CHANGE_USER:
                case opcodes.SERVER_NOTIFY_DELETE_USER:
                case opcodes.SERVER_USER_ACCESS:
                    break;
                default:
                    console.log(`Opcode ${opCode} is not yet supported by this client`);
                    return;
            }
        }


        /* let userNames: string[] = response.parameters.map((param: Parameter) => {
             if (param as TextParameter) {
                 let textParam: TextParameter = param as TextParameter;
                 if (textParam.id === opcodes.USER_NAME_WITH_INFO) {
                     return textParam.content;
                 }
             }
         })*/

        let uuid: number = header.readUInt32BE(4);
        let errorCode: number = header.readUInt32BE(8);

        let totalSize: number = header.readUInt32BE(12);
        let dataSize: number = header.readUInt32BE(16);

        console.log(`Parsing ${isRequest ? 'request' : 'response'} for message with uid ${uuid}`);

        if (totalSize !== dataSize) {
            console.log(`Multipart messages are not yet supported by this client`);
            return;
        }

        console.log(`Data size ${dataSize}`);

        let parameters: Parameter[] = [];

        let byteOffset: number = 20;
        if (dataSize > 0) {
            let parameterCount = data.readUInt16BE(byteOffset); byteOffset += 2;
            console.log(`Parameter Count ${parameterCount}`);

            for (let parameterIndex = 0; parameterIndex < parameterCount; parameterIndex++) {
                let fieldID = data.readUInt16BE(byteOffset); byteOffset += 2;
                console.log('fieldID' + fieldID);
                let fieldSize = data.readUInt16BE(byteOffset); byteOffset += 2;
                let b = 0;

                if (fieldID === 100) {
                    console.log('Error');
                    continue;
                }

                switch (fieldID) {
                    // string params
                    case paramcodes.USER_NAME_WITH_INFO:
                        let userNameWithInfoParam = new UserNameWithInfoParameter(fieldID);
                        byteOffset = userNameWithInfoParam.readFromBytes(data, byteOffset, fieldSize);

                        parameters.push(userNameWithInfoParam);
                        break;
                    case paramcodes.DATA:
                    case paramcodes.USER_NAME:
                        let textParam = new TextParameter(fieldID, '');
                        byteOffset = textParam.readFromBytes(data, byteOffset, fieldSize);

                        //console.log(`Parameter ${parameterIndex} field ID ${fieldID} : Text ${fieldData} : byte count ${fieldSize}`);
                        parameters.push(textParam);
                        break;
                    case paramcodes.USER_ID:
                        // int params
                        let intParam = new IntParameter(fieldID, 0);
                        byteOffset = intParam.readFromBytes(data, byteOffset, fieldSize);
                        parameters.push(intParam);
                        break;
                    default:
                        console.error(`Unknown param type ${fieldID}, please add it`);
                }

                console.log(`Parameter ${parameterIndex} field ID ${fieldID} size ${fieldSize}`);
            }
        }

        // Handle responses to requests
        if (!isRequest && this.promiseMap.has(uuid)) {
            if (errorCode === 0) {
                this.promiseMap.get(uuid).resolve(parameters);
            }
            else {
                this.promiseMap.get(uuid).reject(errorCode);
            }

            this.promiseMap.delete(uuid);
        }

        if (isRequest) {
            switch (opCode) {
                case opcodes.SERVER_PRIVATE_MESSAGE:
                    try {
                        let userID: number = (parameters.find(p => p.id === paramcodes.USER_ID) as IntParameter)?.content;
                        let from: string = (parameters.find(p => p.id === paramcodes.USER_NAME) as TextParameter)?.content;
                        let message: string = (parameters.find(p => p.id === paramcodes.DATA) as TextParameter)?.content;

                        this.eventListener.privateMessage(userID, message);
                    }
                    catch (error) {
                        console.error('Failed to parse private message');
                    }
                    break;
                case opcodes.SERVER_PUBLIC_MESSAGE:
                    let chatID: number = (parameters.find(p => p.id === paramcodes.CHAT_ID) as IntParameter)?.content;
                    let chatText: string = (parameters.find(p => p.id === paramcodes.DATA) as TextParameter)?.content;

                    this.eventListener.publicMessage({
                        sessionKey: this.sessionKey,
                        text: chatText,
                        userID: 'Broadcast'
                    } as MessageUpdate);
                    break;
                case opcodes.SERVER_NOTIFY_DELETE_USER:
                    this.eventListener.notifyDeleteUser((parameters[0] as IntParameter).content);
                    break;
                case opcodes.SERVER_USER_ACCESS:
                    // Set access privileges for the current user.
                    let userAccess: number = (parameters.find(p => p.id === paramcodes.USER_ACCESS) as IntParameter)?.content;

                    console.log(`User Access : ${userAccess}`)
                    break;
                case opcodes.SERVER_NOTIFY_CHANGE_USER:
                    try {
                        let userID: number = (parameters.find(p => p.id === paramcodes.USER_ID) as IntParameter)?.content;
                        let userName: string = (parameters.find(p => p.id === paramcodes.USER_NAME) as TextParameter)?.content;

                        this.eventListener.notifyChangeUser(userID, userName);
                    }
                    catch (error) {
                        console.error('Failed to parse change user');
                    }
                    break;
                case opcodes.SERVER_SHOW_AGREEMENT:
                    this.acceptAgreement().then(() => {
                        this.getUserList().then((users: any) => {
                            //todo - fire listener

                            console.log(JSON.stringify(users));
                        });
                    });
                    break;
                default:
                    console.log(`Unexpected opcode from server ${opCode}`)

            }
        }

        return { 'opCode': opCode, 'parameters': parameters } as Response;
    }
}

export default HotlineSession