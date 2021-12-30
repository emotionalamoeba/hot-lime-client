import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KeyValuePair } from 'src/shared/KeyValuePair';
import { RootState, AppThunk } from '../../store';

export interface SettingsState {
    userName: string;
    serverAddress: string;
    connected: boolean;
    value: number;
    status: 'idle' | 'loading' | 'failed';
}

const initialState: SettingsState = {
    userName: 'Unloaded',
    serverAddress: 'Unloaded',
    connected: false,
    value: 0,
    status: 'idle',
};

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        setServerAddress: (state, action: PayloadAction<string>) => {
            state.serverAddress = action.payload
            console.log(`settings slice setting ${action.payload}`)
            window.hotlineAPI.setStoreValue({ key: 'serverAddress', value: action.payload } as KeyValuePair)
        },
        setUserName: (state, action: PayloadAction<string>) => {
            state.userName = action.payload
            window.hotlineAPI.setStoreValue({ key: 'userName', value: action.payload } as KeyValuePair)
        }
    },
});

export const { setServerAddress, setUserName } = settingsSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectServerAddress = (state: RootState) => state.settings.serverAddress;
export const selectUserName = (state: RootState) => state.settings.userName;
export const selectConnected = (state: RootState) => state.settings.connected;

export default settingsSlice.reducer;