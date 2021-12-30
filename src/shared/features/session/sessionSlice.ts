import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageUpdate, UserDetails, UserListUpdate } from 'src/shared/types/APITypes';
import { Conversation, Message, UID } from 'src/shared/types/types';
import { RootState, AppThunk } from '../../store';
import produce from 'immer';

interface Session {
    sessionKey: UID;
    userList: UserDetails[],
    conversations: Conversation[],
}

export interface SessionState {
    sessions: Session[];
}

const initialState: SessionState = {
    sessions: []
};

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        addMessage: (state, action: PayloadAction<MessageUpdate>) => {
            let m: Message = {
                Timestamp: new Date(),
                Author: 'Broadcast',//action.payload.userID,
                Read: false,
                Recipient: 'Broadcast',
                Text: action.payload.text
            };

            produce(state, draft => {
                let session = draft.sessions.find(s => s.sessionKey === action.payload.sessionKey);

                if (session) {
                    let conversation = session.conversations.find(c => c.userID === action.payload.userID);
                    if (conversation) {

                        conversation.History.push(m);
                    }
                    else {
                        conversation = {
                            History: [m],
                            TextInput: '',
                            userID: action.payload.userID
                        } as Conversation;
                    }
                }
                // bonus, you can do array updated as well!
                // draft.firstLevel.secondLevel.thirdLevel.property2[index] = someData;
            });

            Object.assign({}, state, {
                sessions: state.sessions.map(session => {
                    if (session.sessionKey !== action.payload.sessionKey) {
                        return session
                    }

                    return Object.assign({}, session, {
                        conversations: session.conversations
                        //todo add convo if first message
                    })
                })
            })
        },
        setUserListForSession: (state, action: PayloadAction<UserListUpdate>) => {

            console.log('setting user list for session');
            if (!state.sessions.find((session: Session) => session.sessionKey === action.payload.sessionKey)) {
                let session: Session = {
                    sessionKey: action.payload.sessionKey,
                    userList: action.payload.userList,
                    conversations: [],
                }

                return { sessions: [...state.sessions, session] }
            }

            Object.assign({}, state, {
                sessions: state.sessions.map(session => {
                    if (session.sessionKey !== action.payload.sessionKey) {
                        return session
                    }

                    return Object.assign({}, session, {
                        userList: action.payload.userList
                    })
                })
            })

            return state;
        },
    },
});

export const { addMessage, setUserListForSession } = sessionSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectUserListForSession = (state: RootState, sessionKey: UID) => state.session.sessions.find((session: Session) => session.sessionKey === sessionKey)?.userList;

export const selectSessionIDS = (state: RootState) => state.session.sessions.map((session: Session) => session.sessionKey);

export const selectAllUserLists = (state: RootState) => state.session.sessions.map((session: Session) => {
    return {
        sessionKey: session.sessionKey,
        userList: session.userList
    }
});

export const selectConversationHistory = (state: RootState, sessionKey: UID, userID: number | 'Broadcast') => {
    return state.session.sessions.find((session: Session) => session.sessionKey === sessionKey)?.conversations.find((conversation: Conversation) => conversation.userID === userID)?.History
};

export default sessionSlice.reducer;