import React, { useEffect, useState } from 'react'

import { useAppDispatch } from 'src/shared/hooks';
import { setServerAddress, setUserName } from 'src/shared/features/settings/settingsSlice';

/**
 * TODO - there must be a better way to init the loading from store
 */
export function Loader() {

    const dispatch = useAppDispatch();

    useEffect(() => {
        window.hotlineAPI.getStoreValue('serverAddress').then((value: string) => {
            dispatch(setServerAddress(value));
        });

        window.hotlineAPI.getStoreValue('userName').then((value: string) => {
            dispatch(setUserName(value));
        });
    }, []);

    return (<div></div>);
}