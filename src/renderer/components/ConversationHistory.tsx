import React, { Fragment, useEffect, useState } from 'react'

import { Col, Container, FormControl, InputGroup, Row } from 'react-bootstrap';
import { selectConversationHistory } from 'src/shared/features/session/sessionSlice';
import { getActiveConversation } from 'src/shared/features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from 'src/shared/hooks';
import { Message, UID } from 'src/shared/types/types';

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