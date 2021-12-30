export const INCOMING_MESSAGE = 'INCOMING_MESSAGE';
export const OUTGOING_MESSAGE = 'OUTGOING_MESSAGE';


export function incomingMessage(author = null, content = null, time = new Date()) {
    return {
        type: INCOMING_MESSAGE,
        payload: {
            author,
            content,
            time,
        },
    };
}

export function outgoingMessage(recipient, content, time = new Date()) {
    return {
        type: OUTGOING_MESSAGE,
        payload: {
            recipient,
            content,
            time,
        },
    };
}