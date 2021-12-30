/* eslint-disable no-param-reassign */
import { INCOMING_MESSAGE, OUTGOING_MESSAGE } from '../actions/chat';

const initialState = {
    messagesReceived: 0,
    messages: [],
};

export default function chat(state = initialState, action) {
    switch (action.type) {
        case INCOMING_MESSAGE: {
            const messages = state.messages;

            return {
                ...state,
                messages: [
                    ...messages,
                    {
                        author: action.payload.author,
                        content: action.payload.content,
                        time: action.payload.time,
                    },
                ],
                messagesReceived: state.messagesReceived + 1,
            };
        }

        case OUTGOING_MESSAGE: {
            const messages = state.messages;

            // TODO - send the message
            return {
                ...state,
                messages,
            };
        }

        default:
            return state;
    }
}