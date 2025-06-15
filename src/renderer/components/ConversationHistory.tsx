import React, { Fragment, useEffect, useState } from 'react'

import { Col, Container, FormControl, InputGroup, Row } from 'react-bootstrap';
import { selectConversationHistory } from '../../shared/features/session/sessionSlice.js';
import { getActiveConversation } from '../../shared/features/ui/uiSlice.js';
import { useAppDispatch, useAppSelector } from '../../shared/hooks.js';
import { Message } from '../../shared/types/types.js';

export function ConversationHistory() {

    const activeConversation = useAppSelector(getActiveConversation);

    const messages: Message[] = useAppSelector(state => selectConversationHistory(state, activeConversation?.sessionKey, activeConversation?.userID));

    return (
        <Fragment>
            <Row><Col>
                {`Conversation with ${activeConversation?.userID}`}
            </Col></Row>
            <Row>
                <Col>
                    {
                        messages?.map((message: Message) => {
                            return <Row>
                                {message.Text}
                            </Row>
                        })
                    }
                </Col>
            </Row>
        </Fragment>
    );
}