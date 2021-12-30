import React, { useEffect, useState } from 'react'

import { Col, Container, FormControl, InputGroup, Row } from 'react-bootstrap';
import { selectServerAddress, selectUserName, setServerAddress, setUserName } from 'src/shared/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from 'src/shared/hooks';

import { store } from '../../shared/store';

export function ControlPanel() {

    const dispatch = useAppDispatch();
    const serverAddress = useAppSelector(selectServerAddress);
    const userName = useAppSelector(selectUserName);

    const attemptConnect = () => {
        window.hotlineAPI.connect();
    }

    return (
        <Row>
            <Col xs={5}>
                <InputGroup>
                    <InputGroup.Text>Server Address</InputGroup.Text>
                    <FormControl aria-label="With textarea"
                        value={serverAddress}
                        onChange={(e) => {
                            dispatch(setServerAddress(e.target.value));
                        }} />
                </InputGroup>
            </Col>
            <Col xs={5}>
                <InputGroup>
                    <InputGroup.Text>User Name</InputGroup.Text>
                    <FormControl aria-label="With textarea"
                        value={userName}
                        onChange={(e) => {
                            dispatch(setUserName(e.target.value));
                        }} />

                </InputGroup>
            </Col>
            <Col>
                <button onClick={() => attemptConnect()}>Connect</button>
            </Col>
        </Row>
    );
}