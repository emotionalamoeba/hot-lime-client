import React, { useEffect, useState } from 'react'

import { Col, Container, FormControl, InputGroup, Row } from 'react-bootstrap';
import { selectServerAddress, selectConnected, selectUserName } from '../../shared/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../shared/hooks';

export function StatusPanel() {

    const serverAddress = useAppSelector(selectServerAddress);
    const connected = useAppSelector(selectConnected);
    const userName = useAppSelector(selectUserName);

    return (
        <div>
            {connected ? `Connected as ${userName}` : `Disconnected`}
        </div>
    );
}