import React, { useEffect, useState } from "react";

import { useAppDispatch } from "../shared/hooks";
import {
  setUserListForSession,
  addMessage,
} from "../shared/features/session/sessionSlice";
import { MessageUpdate, UserListUpdate } from "../shared/types/APITypes";

/**
 * TODO - there must be a better way to link listeners to the redux store
 */
export function Listener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.hotlineAPI.receive(
      "connection:userList",
      (userListUpdate: UserListUpdate) => {
        dispatch(setUserListForSession(userListUpdate));
      }
    );

    window.hotlineAPI.receive("connection:privateMessage", (message) => {
      dispatch(addMessage(message));
    });

    window.hotlineAPI.receive(
      "connection:publicMessage",
      (message: MessageUpdate) => {
        dispatch(addMessage(message));
      }
    );
  }, []);

  return <div></div>;
}
