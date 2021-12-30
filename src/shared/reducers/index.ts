import { combineReducers } from 'redux';
import chat from './chat';

export default function getRootReducer(scope = 'main') {
    let reducers = {
        chat,
    };

    if (scope === 'renderer') {
        reducers = {
            ...reducers,
            //routing,
        };
    }

    return combineReducers({ ...reducers });
}