import React, { useEffect, useState } from 'react'
import { Container, ListGroup } from 'react-bootstrap'
import { selectAllUserLists, selectUserListForSession } from 'src/shared/features/session/sessionSlice';
import { setActiveConversation } from 'src/shared/features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from 'src/shared/hooks';
import { UserDetails } from 'src/shared/types/APITypes';
import { UID } from 'src/shared/types/types';

export function ConversationList() {

    const dispatch = useAppDispatch();

    const allUserLists = useAppSelector(selectAllUserLists);

    const switchConversation = (sessionKey, userID) => {
        dispatch(setActiveConversation({ sessionKey, userID }));
    }

    return (
        <div style={{ height: 300, overflowY: 'scroll' }}>
            <ListGroup>
                {
                    allUserLists.map((sessionUserList: any) => {
                        const sessionKey = sessionUserList.sessionKey;

                        let listItems = [];

                        listItems = sessionUserList.userList.map((userDetails: UserDetails) => {
                            return <ListGroup.Item key={userDetails.serverUID} onClick={() => switchConversation(sessionKey, userDetails.serverUID)}>{userDetails.userName}</ListGroup.Item>
                        });

                        listItems.push(<ListGroup.Item key={'Broadcast'} onClick={() => switchConversation(sessionKey, 'Broadcast')}>{'Lobby'}</ListGroup.Item>)
                        return listItems;
                    })
                }
            </ListGroup>
        </div>
    )
}