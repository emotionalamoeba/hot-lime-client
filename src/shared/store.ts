import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import settingsReducer from './features/settings/settingsSlice';
import sessionReducer from './features/session/sessionSlice';
import uiReducer from './features/ui/uiSlice';

export const store = configureStore({
    devTools: true,
    reducer: {
        settings: settingsReducer,
        session: sessionReducer,
        ui: uiReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;