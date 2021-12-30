import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UID } from 'src/shared/types/types';
import { RootState, AppThunk } from '../../store';

interface ConversationKey {
    sessionKey: UID,
    userID: number | 'Broadcast'
}

export interface UIState {
    activeConversationKey: ConversationKey | null;
}

const initialState: UIState = {
    activeConversationKey: null
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        setActiveConversation: (state, action: PayloadAction<ConversationKey>) => {

            return {
                activeConversationKey: action.payload
            };
        },
    },
});

export const { setActiveConversation } = uiSlice.actions;

export const getActiveConversation = (state: RootState) => state.ui.activeConversationKey;

export default uiSlice.reducer;